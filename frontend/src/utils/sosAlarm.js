// ==============================================================================
// EMERGENCY SOS AUDIBLE ALARM MANAGER
// Supports both Web Audio API Synthesizer (instant, crystal clear, zero-lag)
// and HTML5 Audio Element playback (/sounds/sos-alert.wav & .mp3).
// ==============================================================================

class SosAlarmManager {
  constructor() {
    this.audio = null;
    this.audioCtx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.sirenInterval = null;
    this.isPlaying = false;
    this.isAutoplayBlocked = false;
    this.listeners = new Set();
  }

  initAudioElement() {
    if (typeof window === 'undefined') return;

    if (!this.audio) {
      // Use standard WAV / MP3 asset
      this.audio = new Audio('/sounds/sos-alert.wav');
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.volume = 1.0;
      this.audio.muted = false;

      this.audio.addEventListener('error', (e) => {
        console.warn('[SosAlarm] HTMLAudioElement error event:', e);
      });

      this.audio.addEventListener('playing', () => {
        console.log('[SosAlarm] HTMLAudioElement reached "playing" state.');
      });
    }
  }

  getAudioContext() {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((fn) =>
      fn({
        isPlaying: this.isPlaying,
        isAutoplayBlocked: this.isAutoplayBlocked,
      })
    );
  }

  /**
   * Start the audible emergency siren alarm.
   */
  async start() {
    if (this.isPlaying) return;

    console.log('[SosAlarm] 🚨 Starting SOS Audible Alarm...');
    this.isPlaying = true;
    this.isAutoplayBlocked = false;
    this.notify();

    let webAudioSuccess = false;
    let htmlAudioSuccess = false;

    // 1. Start Web Audio API Oscillator Siren (Primary - Loud, reliable, hardware-direct)
    try {
      const ctx = this.getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        if (ctx.state === 'running') {
          this.startOscillatorSiren(ctx);
          webAudioSuccess = true;
          console.log('[SosAlarm] ✓ Web Audio API Oscillator Siren active at ctx.currentTime:', ctx.currentTime);
        } else {
          console.warn('[SosAlarm] Web Audio Context state suspended (autoplay policy):', ctx.state);
        }
      }
    } catch (webAudioErr) {
      console.warn('[SosAlarm] Web Audio Context start exception:', webAudioErr);
    }

    // 2. Start HTMLAudioElement playback (Secondary / Parallel)
    this.initAudioElement();
    if (this.audio) {
      try {
        this.audio.volume = 1.0;
        this.audio.muted = false;
        this.audio.currentTime = 0;

        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          htmlAudioSuccess = true;
          console.log('[SosAlarm] ✓ HTMLAudioElement playing successfully.', {
            src: this.audio.src,
            readyState: this.audio.readyState,
            networkState: this.audio.networkState,
            volume: this.audio.volume,
            muted: this.audio.muted,
            paused: this.audio.paused,
            currentTime: this.audio.currentTime,
          });
        }
      } catch (playErr) {
        console.warn('[SosAlarm] HTMLAudioElement play() rejected:', playErr.name, playErr.message);
        this.logDiagnostics();
      }
    }

    // 3. Autoplay Blocked Evaluation
    if (!webAudioSuccess && !htmlAudioSuccess) {
      console.warn('[SosAlarm] ⚠️ Both Web Audio and HTMLAudioElement were blocked by browser autoplay policy.');
      this.isAutoplayBlocked = true;
    } else {
      this.isAutoplayBlocked = false;
    }

    this.notify();
  }

  /**
   * Generates a dual-tone pulsing emergency siren using Web Audio API
   */
  startOscillatorSiren(ctx) {
    this.stopOscillatorSiren();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(850, ctx.currentTime);

    // Master volume for siren synth
    gain.gain.setValueAtTime(0.4, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();

    this.oscillator = osc;
    this.gainNode = gain;

    // Siren frequency modulation (850Hz <-> 1100Hz every 250ms)
    let high = false;
    this.sirenInterval = setInterval(() => {
      if (!this.isPlaying || !this.oscillator) return;
      try {
        const nextFreq = high ? 850 : 1100;
        high = !high;
        this.oscillator.frequency.setTargetAtTime(nextFreq, ctx.currentTime, 0.05);
      } catch {}
    }, 250);
  }

  stopOscillatorSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }

    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch {}
      this.oscillator = null;
    }

    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {}
      this.gainNode = null;
    }
  }

  /**
   * Stop the alarm immediately.
   */
  stop() {
    console.log('[SosAlarm] ⏹ Stopping SOS Audible Alarm.');
    this.isPlaying = false;
    this.isAutoplayBlocked = false;

    // Stop Oscillator Siren
    this.stopOscillatorSiren();

    // Stop HTMLAudioElement
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {}
    }

    this.notify();
  }

  /**
   * User interaction trigger (bypasses browser autoplay lock).
   */
  async enableAudioByUser() {
    console.log('[SosAlarm] Enabling audio via user interaction...');
    this.isAutoplayBlocked = false;

    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (e) {
        console.warn('[SosAlarm] Context resume error:', e);
      }
    }

    this.stop();
    await this.start();
  }

  logDiagnostics() {
    if (typeof window === 'undefined') return;
    console.group('[SosAlarm Diagnostics]');
    if (this.audio) {
      console.log('Audio SRC:', this.audio.src);
      console.log('Audio readyState:', this.audio.readyState, '(4 = HAVE_ENOUGH_DATA)');
      console.log('Audio networkState:', this.audio.networkState);
      console.log('Audio volume:', this.audio.volume);
      console.log('Audio muted:', this.audio.muted);
      console.log('Audio paused:', this.audio.paused);
      console.log('Audio currentTime:', this.audio.currentTime);
    } else {
      console.log('HTMLAudioElement: null');
    }
    if (this.audioCtx) {
      console.log('AudioContext state:', this.audioCtx.state);
      console.log('AudioContext sampleRate:', this.audioCtx.sampleRate);
    } else {
      console.log('AudioContext: null');
    }
    console.groupEnd();
  }
}

export const sosAlarm = new SosAlarmManager();
