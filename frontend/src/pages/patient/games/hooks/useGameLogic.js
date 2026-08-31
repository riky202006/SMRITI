import { useState, useCallback } from 'react';
import { useAppData } from '@/hooks/useAppData';

export function useGameLogic() {
  const { appData, setAppData } = useAppData();
  const images = appData.images || [];

  const TOTAL_ROUNDS = 5;
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [roundsHistory, setRoundsHistory] = useState([]);
  const [lastReport, setLastReport] = useState(null);

  // Pick target image for current round
  const imageIndex = (currentRound - 1) % (images.length || 1);
  const currentImage = images[imageIndex] || {
    id: '1',
    dataUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
    name: 'Anita',
  };

  const getOptions = useCallback(() => {
    const correctName = currentImage.name || 'Anita';
    const pool = ['Anita', 'Rahul', 'Priya', 'Sanjay', 'Kiran', 'Deepak', 'Sunita'];
    const distractors = pool.filter((n) => n !== correctName).slice(0, 3);
    const options = [correctName, ...distractors].sort();
    return options;
  }, [currentImage]);

  const submitAnswer = (chosenName) => {
    setSelectedOption(chosenName);
    const isCorrect = chosenName.toLowerCase().trim() === (currentImage.name || 'Anita').toLowerCase().trim();

    const newScore = isCorrect ? score + 10 : score;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;

    setScore(newScore);
    setCorrectCount(newCorrect);

    const roundRecord = {
      round: currentRound,
      targetName: currentImage.name,
      chosenName,
      isCorrect,
    };

    const newHistory = [...roundsHistory, roundRecord];
    setRoundsHistory(newHistory);

    // If 5th round finished, compile and dispatch caretaker report
    if (currentRound >= TOTAL_ROUNDS) {
      const accuracy = Math.round((newCorrect / TOTAL_ROUNDS) * 100);
      const report = {
        id: `rpt_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        totalRounds: TOTAL_ROUNDS,
        correctCount: newCorrect,
        accuracy,
        score: newScore,
        rounds: newHistory,
        summary: `Recognized ${newCorrect} of ${TOTAL_ROUNDS} family members correctly (${accuracy}% accuracy).`,
      };

      setLastReport(report);

      // Save report directly into global appData for caretaker analytics view
      setAppData((prev) => ({
        ...prev,
        analyticsReports: [report, ...(prev.analyticsReports || [])],
        stats: {
          ...prev.stats,
          games: (prev.stats?.games || 0) + 1,
          score: (prev.stats?.score || 0) + newScore,
          correct: (prev.stats?.correct || 0) + newCorrect,
        },
      }));
    }

    return isCorrect;
  };

  const advanceRound = () => {
    setSelectedOption(null);
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound((r) => r + 1);
      return true; // Continues next round
    }
    return false; // Completed 5 rounds
  };

  const resetGame = () => {
    setCurrentRound(1);
    setScore(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setRoundsHistory([]);
    setLastReport(null);
  };

  return {
    TOTAL_ROUNDS,
    currentRound,
    currentImage,
    score,
    correctCount,
    selectedOption,
    roundsHistory,
    lastReport,
    getOptions,
    submitAnswer,
    advanceRound,
    resetGame,
  };
}
