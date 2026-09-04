import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getGalleryImages } from '@/services/gallery';
import { saveMemorySession } from '@/services/analytics';
import {
  speakText,
  stopSpeech,
  isSpeechRecognitionSupported,
  matchTranscriptToOptions,
} from '@/services/speech';

// Fisher-Yates shuffle algorithm for unbiased random selection
function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export default function GameQuestionPage() {
  const navigate = useNavigate();
  const { patientRecord } = useAuth();
  const { showToast } = useToast();
  const patientId = patientRecord?.id;

  const [loading, setLoading] = useState(true);
  const [gamePhotos, setGamePhotos] = useState([]);
  const [allFamilyNames, setAllFamilyNames] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [sessionRounds, setSessionRounds] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);

  // Speech Recognition States & Lifecycle References
  const [voiceStatus, setVoiceStatus] = useState('idle'); // 'idle' | 'listening' | 'heard' | 'error'
  const [voiceMessage, setVoiceMessage] = useState('');
  const recognitionRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const optionsRef = useRef([]);
  const handleSelectRef = useRef(null);

  // 1. Fetch real photos from Supabase Storage & gallery_images
  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    getGalleryImages(patientId)
      .then(({ data }) => {
        if (!mounted) return;

        const validPhotos = (data || []).filter((img) => img.url && img.file_name);
        const names = Array.from(new Set(validPhotos.map((p) => p.file_name.trim())));
        setAllFamilyNames(names);

        if (validPhotos.length === 0) {
          setGamePhotos([]);
        } else {
          // Shuffle all and pick up to 5 unique photos
          const shuffled = shuffleArray(validPhotos);
          const selected = shuffled.slice(0, Math.min(shuffled.length, 5));
          setGamePhotos(selected);
        }
      })
      .catch(() => {
        if (mounted) setGamePhotos([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      stopSpeech();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, [patientId]);

  const totalRounds = gamePhotos.length;
  const currentPhoto = gamePhotos[currentRound - 1];
  const correctName = currentPhoto?.file_name || '';

  // 2. Generate 4 options for current target photo
  const options = useMemo(() => {
    if (!correctName) return [];

    const fallbackPool = ['Anita', 'Rahul', 'Priya', 'Sanjay', 'Kiran', 'Deepak', 'Sunita', 'Vikram', 'Meera', 'Ravi'];
    const otherFamilyNames = allFamilyNames.filter((n) => n.toLowerCase() !== correctName.toLowerCase());
    const distractorsPool = [...otherFamilyNames, ...fallbackPool.filter((n) => !otherFamilyNames.includes(n))];

    const shuffledDistractors = shuffleArray(distractorsPool.filter((n) => n.toLowerCase() !== correctName.toLowerCase()));
    const selectedDistractors = shuffledDistractors.slice(0, 3);

    return shuffleArray([correctName, ...selectedDistractors]);
  }, [correctName, allFamilyNames]);

  // Keep fresh options in ref for speech recognition and keyboard navigation
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // 3. Voice Speak Handler
  const handleSpeakQuestion = useCallback(() => {
    stopSpeech();
    speakText('Who is this person?');
  }, []);

  // 4. Exit Game Handler
  const handleExitGame = () => {
    stopSpeech();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    showToast('Game exited.');
    navigate('/patient/home');
  };

  // 5. Reset round-level voice state when round advances
  useEffect(() => {
    hasSubmittedRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setVoiceStatus('idle');
    setVoiceMessage('');
  }, [currentRound]);

  // 6. Handle Answer Selection & Cloud Persistence
  const handleSelect = useCallback(
    async (chosen) => {
      stopSpeech();
      hasSubmittedRef.current = true;

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }

      const isCorrect = chosen.toLowerCase().trim() === correctName.toLowerCase().trim();
      const newCorrect = isCorrect ? correctCount + 1 : correctCount;
      const newScore = isCorrect ? score + 10 : score;

      const roundRecord = {
        round: currentRound,
        targetName: correctName,
        chosenName: chosen,
        isCorrect,
      };

      const newRounds = [...sessionRounds, roundRecord];
      setSessionRounds(newRounds);
      setCorrectCount(newCorrect);
      setScore(newScore);

      if (currentRound < totalRounds) {
        setCurrentRound((r) => r + 1);
      } else {
        // Completed all rounds: Save to Supabase
        const accuracy = Math.round((newCorrect / totalRounds) * 100);
        const summaryText = `Recognized ${newCorrect} of ${totalRounds} family members (${accuracy}% accuracy).`;

        const report = {
          id: `rpt_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          totalRounds,
          correctCount: newCorrect,
          accuracy,
          score: newScore,
          rounds: newRounds,
          summary: summaryText,
        };

        if (patientId) {
          const saveRes = await saveMemorySession({
            patientId,
            totalRounds,
            correctCount: newCorrect,
            accuracy,
            score: newScore,
            summary: summaryText,
          });
          if (saveRes?.data?.id) {
            report.sessionId = saveRes.data.id;
          }
        }

        navigate('/patient/games/result', { state: { report } });
      }
    },
    [correctName, correctCount, score, currentRound, sessionRounds, totalRounds, patientId, navigate]
  );

  useEffect(() => {
    handleSelectRef.current = handleSelect;
  }, [handleSelect]);

  // 7. Keyboard Navigation (1, 2, 3, 4 keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (hasSubmittedRef.current) return;
      const keyIndex = parseInt(e.key, 10) - 1;
      if (keyIndex >= 0 && keyIndex < optionsRef.current.length) {
        const chosen = optionsRef.current[keyIndex];
        if (chosen && handleSelectRef.current) {
          handleSelectRef.current(chosen);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 8. Speech Recognition Pipeline
  const startVoiceRecognition = () => {
    stopSpeech();

    if (!isSpeechRecognitionSupported()) {
      setVoiceStatus('error');
      setVoiceMessage('Speech recognition is not supported in this browser. Please use Google Chrome.');
      showToast('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setVoiceStatus('listening');
        setVoiceMessage("Listening... Speak person's name now");
      };

      recognition.onresult = (event) => {
        if (hasSubmittedRef.current || !event.results) return;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result || !result[0]) continue;

          if (!result.isFinal) {
            const interimText = result[0].transcript.trim();
            if (interimText) {
              setVoiceStatus('listening');
              setVoiceMessage(`Hearing: "${interimText}"...`);
            }
          } else {
            const rawTranscript = result[0].transcript.trim();
            const allAlternatives = Array.from(result).map((alt) => alt.transcript.trim());
            const currentOptions = optionsRef.current;
            const matchedOption = matchTranscriptToOptions(allAlternatives, currentOptions);

            if (matchedOption) {
              hasSubmittedRef.current = true;
              setVoiceStatus('heard');
              setVoiceMessage(`I heard: "${rawTranscript}" → "${matchedOption}"`);
              showToast(`I heard: "${matchedOption}"`);

              try {
                recognition.stop();
              } catch {}

              if (handleSelectRef.current) {
                handleSelectRef.current(matchedOption);
              }
              break;
            } else {
              setVoiceStatus('listening');
              setVoiceMessage(`I heard: "${rawTranscript}". Keep speaking or choose an option.`);
            }
          }
        }
      };

      recognition.onerror = (event) => {
        if (hasSubmittedRef.current) return;
        if (event.error === 'not-allowed') {
          setVoiceStatus('error');
          setVoiceMessage('Microphone permission denied. Please allow microphone in browser settings.');
        } else if (event.error === 'no-speech') {
          setVoiceStatus('idle');
          setVoiceMessage('No speech heard. Tap Speak Answer to try again.');
        } else {
          setVoiceStatus('idle');
          setVoiceMessage('Microphone session ended. Tap Speak Answer to try again.');
        }
      };

      recognition.onend = () => {
        if (!hasSubmittedRef.current) {
          setVoiceStatus((prev) => (prev === 'listening' ? 'idle' : prev));
          setVoiceMessage((prev) => (prev.startsWith('Listening') ? 'Listening ended. Tap Speak Answer to try again.' : prev));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setVoiceStatus('error');
      setVoiceMessage('Could not start microphone. Please tap an option below.');
    }
  };

  return (
    <AppLayout mode="patient" showNav={false}>
      <TopBar
        title={totalRounds > 0 ? `Round ${currentRound} of ${totalRounds}` : 'Memory Challenge'}
        onBack={handleExitGame}
      />

      <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {loading ? (
          <Card style={{ width: '100%', textAlign: 'center', padding: '36px 20px', marginTop: 24 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>
              Loading family photo challenge...
            </p>
          </Card>
        ) : totalRounds === 0 ? (
          <Card className="empty-state-card" style={{ width: '100%', marginTop: 20 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🖼️</div>
            <h3 className="headline-sm" style={{ marginBottom: 8 }}>No Family Photos Uploaded</h3>
            <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 24, fontSize: 14 }}>
              Your memory game uses real family photos from your private cloud album. Please ask your caretaker to upload photos in the Family Photo Album first.
            </p>
            <Button variant="primary" onClick={() => navigate('/patient/home')} style={{ width: '100%' }}>
              Back to Home
            </Button>
          </Card>
        ) : (
          <>
            {/* Header Action Bar with Progress and Exit Game Button */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ flex: 1, height: 8, backgroundColor: 'var(--surface-container-high)', borderRadius: 4, overflow: 'hidden', marginRight: 14 }}>
                <div
                  style={{
                    width: `${(currentRound / totalRounds) * 100}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <button
                type="button"
                onClick={handleExitGame}
                style={{
                  background: 'none',
                  border: '1.5px solid var(--outline-variant)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--outline)',
                  cursor: 'pointer',
                }}
              >
                ✕ Exit
              </button>
            </div>

            {/* Photo Card */}
            <Card style={{ width: '100%', overflow: 'hidden', padding: 0, marginBottom: 16 }}>
              <img
                src={currentPhoto.url}
                alt="Family member"
                style={{ width: '100%', height: 'clamp(200px, 35vh, 320px)', objectFit: 'cover' }}
              />
            </Card>

            <h3 className="headline-sm" style={{ marginBottom: 14, textAlign: 'center', fontSize: '20px' }}>
              Who is this person?
            </h3>

            {/* Speak / Voice Buttons */}
            <div style={{ display: 'flex', gap: 12, width: '100%', marginBottom: 14 }}>
              <Button
                variant="outline"
                onClick={handleSpeakQuestion}
                style={{ flex: 1, padding: '12px 14px' }}
              >
                🔊 Read Aloud
              </Button>
              <Button
                variant={voiceStatus === 'listening' ? 'primary' : 'secondary'}
                onClick={startVoiceRecognition}
                disabled={voiceStatus === 'listening'}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  backgroundColor: voiceStatus === 'listening' ? '#c62828' : undefined,
                  color: voiceStatus === 'listening' ? '#fff' : undefined,
                }}
              >
                {voiceStatus === 'listening' ? '🎙️ Listening...' : '🎤 Speak Answer'}
              </Button>
            </div>

            {/* Voice Feedback Banner */}
            {voiceMessage && (
              <div
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor:
                    voiceStatus === 'heard'
                      ? '#e8f5e9'
                      : voiceStatus === 'error'
                      ? 'var(--error-container)'
                      : 'var(--mint-soft)',
                  color:
                    voiceStatus === 'heard'
                      ? '#2e7d32'
                      : voiceStatus === 'error'
                      ? 'var(--on-error-container)'
                      : 'var(--primary)',
                  fontSize: '14px',
                  fontWeight: 600,
                  marginBottom: 16,
                  textAlign: 'center',
                }}
              >
                {voiceMessage}
              </div>
            )}

            {/* Option Buttons with Numbers */}
            <div className="grid-responsive-2" style={{ width: '100%' }}>
              {options.map((nameOpt, idx) => (
                <Button
                  key={nameOpt}
                  variant="outline"
                  onClick={() => handleSelect(nameOpt)}
                  style={{
                    padding: '18px 14px',
                    fontSize: '18px',
                    fontWeight: 700,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{ opacity: 0.6, fontSize: 14 }}>{idx + 1}.</span>
                  <span>{nameOpt}</span>
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
