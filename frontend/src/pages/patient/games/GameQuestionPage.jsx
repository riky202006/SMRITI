import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { getPatientByProfileId } from '@/services/patients';
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
  const { setAppData, showToast } = useAppData();
  const { user, patientRecord } = useAuth();

  const [patientId, setPatientId] = useState(patientRecord?.id || null);
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

  // 1. Resolve patient ID
  useEffect(() => {
    if (patientRecord?.id) {
      setPatientId(patientRecord.id);
    } else if (user?.id) {
      getPatientByProfileId(user.id).then(({ data }) => {
        if (data?.id) setPatientId(data.id);
      });
    }
  }, [patientRecord?.id, user?.id]);

  // 2. Fetch and randomly select up to 5 unique photos from Supabase Storage & gallery_images
  useEffect(() => {
    if (!patientId) return;

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
          // Unbiased random selection: Shuffle all and pick up to 5 unique photos
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

  // 3. Generate 4 options for current target photo
  const options = useMemo(() => {
    if (!correctName) return [];

    const fallbackPool = ['Anita', 'Rahul', 'Priya', 'Sanjay', 'Kiran', 'Deepak', 'Sunita', 'Vikram', 'Meera', 'Ravi'];
    const otherFamilyNames = allFamilyNames.filter((n) => n.toLowerCase() !== correctName.toLowerCase());
    const distractorsPool = [...otherFamilyNames, ...fallbackPool.filter((n) => !otherFamilyNames.includes(n))];

    const shuffledDistractors = shuffleArray(distractorsPool.filter((n) => n.toLowerCase() !== correctName.toLowerCase()));
    const selectedDistractors = shuffledDistractors.slice(0, 3);

    return shuffleArray([correctName, ...selectedDistractors]);
  }, [correctName, allFamilyNames]);

  // Keep fresh options in ref for speech recognition
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // 4. Voice Speak Handler (SpeechSynthesis - Read Aloud)
  const handleSpeakQuestion = useCallback(() => {
    stopSpeech();
    speakText('Who is this person?');
  }, []);

  // 5. Exit Game Handler (Cleans up Speech Recognition & Navigates Home)
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

  // 6. Reset round-level voice state and abort prior recognition when round advances
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

  // 7. Handle Answer Selection & Cloud Persistence (The Answer Validator)
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

      console.log('Sending transcript to answer validator:', chosen);

      const isCorrect = chosen.toLowerCase().trim() === correctName.toLowerCase().trim();
      console.log('Answer registered. isCorrect:', isCorrect, '| Expected:', correctName, '| Given:', chosen);

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
          await saveMemorySession({
            patientId,
            totalRounds,
            correctCount: newCorrect,
            accuracy,
            score: newScore,
            summary: summaryText,
          });
        }

        setAppData((prev) => ({
          ...prev,
          analyticsReports: [report, ...(prev.analyticsReports || [])],
          latestReport: report,
          stats: {
            ...prev.stats,
            games: (prev.stats?.games || 0) + 1,
            score: (prev.stats?.score || 0) + newScore,
            correct: (prev.stats?.correct || 0) + newCorrect,
          },
        }));

        navigate('/patient/games/result');
      }
    },
    [correctName, correctCount, score, currentRound, sessionRounds, totalRounds, patientId, setAppData, navigate]
  );

  // Keep fresh handleSelect in ref for speech recognition
  useEffect(() => {
    handleSelectRef.current = handleSelect;
  }, [handleSelect]);

  // 8. Patient-Friendly Speech Recognition Pipeline (Continuous + Interim streaming + Pause tolerance)
  const startVoiceRecognition = () => {
    stopSpeech();

    if (!isSpeechRecognitionSupported()) {
      setVoiceStatus('error');
      setVoiceMessage('Speech recognition is not supported in this browser. Please use Chrome.');
      showToast('Speech recognition not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    // Abort any existing instance before creating a new one
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Stay listening through natural speech pauses
      recognition.interimResults = true; // Stream interim words in real-time
      recognition.lang = 'en-IN'; // Indian English accent recognition
      recognition.maxAlternatives = 3;

      // Attach all event handlers BEFORE recognition.start()
      recognition.onstart = () => {
        console.log('Recognition started');
        setVoiceStatus('listening');
        setVoiceMessage("Listening... Speak person's name now");
      };

      recognition.onresult = (event) => {
        if (hasSubmittedRef.current || !event.results) return;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (!result || !result[0]) continue;

          if (!result.isFinal) {
            // Live interim result (speaking in progress): show feedback without submitting
            const interimText = result[0].transcript.trim();
            if (interimText) {
              setVoiceStatus('listening');
              setVoiceMessage(`Hearing: "${interimText}"...`);
            }
          } else {
            // Final utterance segment
            console.log('Final result event received');
            const rawTranscript = result[0].transcript.trim();
            console.log('Transcript received:', rawTranscript);

            // Gather all alternatives for this final segment
            const allAlternatives = Array.from(result).map((alt) => alt.transcript.trim());
            const currentOptions = optionsRef.current;
            const matchedOption = matchTranscriptToOptions(allAlternatives, currentOptions);

            if (matchedOption) {
              // Valid option match found!
              hasSubmittedRef.current = true;
              setVoiceStatus('heard');
              setVoiceMessage(`I heard: "${rawTranscript}" → "${matchedOption}"`);
              showToast(`I heard: "${matchedOption}"`);

              // Clean up recognition
              try {
                recognition.stop();
              } catch {}

              if (handleSelectRef.current) {
                handleSelectRef.current(matchedOption);
              }
              break;
            } else {
              // No option matched yet: show what was heard and keep listening for next utterance
              setVoiceStatus('listening');
              setVoiceMessage(`I heard: "${rawTranscript}". Keep speaking or choose an option.`);
              console.log('No option matched for final transcript:', rawTranscript, '| Available options:', currentOptions);
            }
          }
        }
      };

      recognition.onerror = (event) => {
        console.log('Recognition error:', event.error);
        if (hasSubmittedRef.current) return;

        if (event.error === 'not-allowed') {
          setVoiceStatus('error');
          setVoiceMessage('Microphone permission denied. Please allow microphone access in Chrome settings.');
          showToast('Microphone permission denied.');
        } else if (event.error === 'no-speech') {
          // Normal timeout after extended silence: allow user to tap Speak Answer again
          setVoiceStatus('idle');
          setVoiceMessage('No speech heard. Tap Speak Answer to try again.');
        } else if (event.error === 'audio-capture') {
          setVoiceStatus('error');
          setVoiceMessage('No microphone detected on your device.');
          showToast('Microphone unavailable.');
        } else {
          setVoiceStatus('idle');
          setVoiceMessage(`Microphone session ended. Tap Speak Answer to try again.`);
        }
      };

      recognition.onend = () => {
        console.log('Recognition ended');
        if (!hasSubmittedRef.current) {
          setVoiceStatus((prev) => (prev === 'listening' ? 'idle' : prev));
          setVoiceMessage((prev) => (prev.startsWith('Listening') ? 'Listening ended. Tap Speak Answer to try again.' : prev));
        }
      };

      // Assign to ref then start
      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Could not start recognition:', err);
      setVoiceStatus('error');
      setVoiceMessage('Could not start microphone. Please tap an option below.');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar
        title={totalRounds > 0 ? `Round ${currentRound} of ${totalRounds}` : 'Memory Challenge'}
        onBack={handleExitGame}
      />

      <div style={{ flex: 1, padding: 'var(--gutter)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {loading ? (
          <Card style={{ width: '100%', textAlign: 'center', padding: 32, marginTop: 24 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>
              Loading family photo challenge...
            </p>
          </Card>
        ) : totalRounds === 0 ? (
          <Card style={{ width: '100%', textAlign: 'center', padding: 28, marginTop: 20 }}>
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
            {/* Header Action Bar with Progress and Visible Exit Game Button */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ flex: 1, height: 6, backgroundColor: 'var(--surface-container-high)', borderRadius: 3, overflow: 'hidden', marginRight: 12 }}>
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
                  border: '1px solid var(--outline)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--outline)',
                  cursor: 'pointer',
                }}
              >
                ✕ Exit Game
              </button>
            </div>

            {/* Real Family Photo Card */}
            <Card style={{ width: '100%', overflow: 'hidden', padding: 0, marginBottom: 16 }}>
              <img
                src={currentPhoto.url}
                alt="Family member"
                style={{ width: '100%', height: 230, objectFit: 'cover' }}
              />
            </Card>

            <h3 className="headline-sm" style={{ marginBottom: 12, textAlign: 'center' }}>
              Who is this person?
            </h3>

            {/* Speak / Voice Buttons */}
            <div style={{ display: 'flex', gap: 10, width: '100%', marginBottom: 12 }}>
              <Button
                variant="outline"
                onClick={handleSpeakQuestion}
                style={{ flex: 1, borderColor: 'var(--primary)', color: 'var(--primary)', padding: '10px 8px' }}
              >
                🔊 Read Aloud
              </Button>
              <Button
                variant={voiceStatus === 'listening' ? 'primary' : 'secondary'}
                onClick={startVoiceRecognition}
                disabled={voiceStatus === 'listening'}
                style={{
                  flex: 1,
                  padding: '10px 8px',
                  backgroundColor: voiceStatus === 'listening' ? '#c62828' : undefined,
                  color: voiceStatus === 'listening' ? '#fff' : undefined,
                }}
              >
                {voiceStatus === 'listening' ? '🎙️ Listening...' : '🎤 Speak Answer'}
              </Button>
            </div>

            {/* Real-time Voice Recognition Feedback Banner */}
            {voiceMessage && (
              <div
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
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
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: 14,
                  textAlign: 'center',
                }}
              >
                {voiceMessage}
              </div>
            )}

            {/* Multiple Choice Option Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
              {options.map((nameOpt) => (
                <Button
                  key={nameOpt}
                  variant="outline"
                  onClick={() => handleSelect(nameOpt)}
                  style={{
                    padding: '16px 8px',
                    fontSize: '17px',
                    fontWeight: 700,
                    borderColor: 'var(--primary)',
                  }}
                >
                  {nameOpt}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
