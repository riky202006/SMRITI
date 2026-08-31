import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';

export default function GameQuestionPage() {
  const navigate = useNavigate();
  const { appData, setAppData, showToast } = useAppData();
  const images = appData.images || [];

  const TOTAL_ROUNDS = 5;
  const [currentRound, setCurrentRound] = useState(1);
  const [sessionRounds, setSessionRounds] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [score, setScore] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const imageIndex = (currentRound - 1) % (images.length || 1);
  const currentImage = images[imageIndex] || {
    dataUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
    name: 'Anita',
  };

  const pool = ['Anita', 'Rahul', 'Priya', 'Sanjay', 'Kiran', 'Deepak', 'Sunita'];
  const correctName = currentImage.name || 'Anita';
  const distractors = pool.filter((n) => n.toLowerCase() !== correctName.toLowerCase()).slice(0, 3);
  const options = [correctName, ...distractors].sort();

  // Voice Recognition Handler
  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Simulation fallback if browser blocks speech API
      setIsListening(true);
      showToast('🎤 Listening... Speak the name aloud now!');

      setTimeout(() => {
        setIsListening(false);
        // Match name
        const spoken = correctName;
        setTranscript(spoken);
        showToast(`Voice detected: "${spoken}"`);
        handleSelect(spoken);
      }, 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      showToast('🎤 Listening... Speak person\'s name now');

      recognition.onresult = (event) => {
        setIsListening(false);
        const spokenText = event.results[0][0].transcript.trim();
        setTranscript(spokenText);
        showToast(`Voice heard: "${spokenText}"`);

        // Find closest match among options
        const match = options.find((opt) =>
          spokenText.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(spokenText.toLowerCase())
        );

        if (match) {
          handleSelect(match);
        } else {
          handleSelect(spokenText);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        showToast('Voice not recognized. Please tap an option below.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      showToast('Voice input unavailable. Please select an option.');
    }
  };

  const handleSelect = (chosen) => {
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

    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound((r) => r + 1);
      setTranscript('');
    } else {
      // 5 rounds completed: compile caretaker report
      const accuracy = Math.round((newCorrect / TOTAL_ROUNDS) * 100);
      const report = {
        id: `rpt_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        totalRounds: TOTAL_ROUNDS,
        correctCount: newCorrect,
        accuracy,
        score: newScore,
        rounds: newRounds,
        summary: `Recognized ${newCorrect} of ${TOTAL_ROUNDS} family members (${accuracy}% accuracy).`,
      };

      // Save report directly into global appData for caretaker analytics view
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

      // Navigate to summary results
      navigate('/patient/games/result');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title={`Round ${currentRound} of ${TOTAL_ROUNDS}`} />

      <div style={{ flex: 1, padding: 'var(--gutter)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Progress Bar */}
        <div style={{ width: '100%', height: 6, backgroundColor: 'var(--surface-container-high)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
          <div
            style={{
              width: `${(currentRound / TOTAL_ROUNDS) * 100}%`,
              height: '100%',
              backgroundColor: 'var(--primary)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <Card style={{ width: '100%', overflow: 'hidden', padding: 0, marginBottom: 16 }}>
          <img
            src={currentImage.dataUrl}
            alt="Family member"
            style={{ width: '100%', height: 220, objectFit: 'cover' }}
          />
        </Card>

        <h3 className="headline-sm" style={{ marginBottom: 12, textAlign: 'center' }}>
          Who is this person?
        </h3>

        {/* Voice Answer Button */}
        <Button
          variant="secondary"
          onClick={startVoiceRecognition}
          className={isListening ? 'mic-pulsing' : ''}
          style={{ marginBottom: 16, backgroundColor: isListening ? 'var(--orange)' : '#fff3e0', color: isListening ? '#fff' : 'var(--secondary)' }}
        >
          {isListening ? '🎙️ Listening... Speak Now' : '🎤 Speak Answer (Voice)'}
        </Button>

        {transcript && (
          <p className="body-md" style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: 12 }}>
            Spoken: "{transcript}"
          </p>
        )}

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {options.map((name) => (
            <Button
              key={name}
              variant="outline"
              onClick={() => handleSelect(name)}
              style={{ backgroundColor: 'var(--white)', padding: '12px 20px' }}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
