import { useCallback, useRef, useState } from 'react';

const AI_MOCK = [
  { img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500', name: 'Computer' },
  { img: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500', name: 'Ocean' },
  { img: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?w=500', name: 'Mountain' },
  { img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', name: 'Salad' },
  { img: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=500', name: 'Forest' },
];

function generateRounds(images) {
  const pers = [...(images || [])];
  const allNames = pers.map((p) => p.name).concat(
    AI_MOCK.map((a) => a.name),
    ['Cat', 'Dog', 'House', 'Car', 'Tree', 'Book'],
  );

  const getOpts = (correct) => {
    const opts = new Set([correct]);
    const shuffled = [...allNames].sort(() => Math.random() - 0.5);
    for (const x of shuffled) {
      if (opts.size < 4) opts.add(x);
    }
    return Array.from(opts).sort(() => Math.random() - 0.5);
  };

  const generated = [];
  const shuffledPers = [...pers].sort(() => Math.random() - 0.5);
  const shuffledAi = [...AI_MOCK].sort(() => Math.random() - 0.5);
  let pIdx = 0;
  let aIdx = 0;

  for (let i = 0; i < 10; i++) {
    let src;
    if (shuffledPers.length > 0 && (i % 2 === 0 || aIdx >= shuffledAi.length)) {
      src = shuffledPers[pIdx % shuffledPers.length];
      pIdx += 1;
    } else {
      src = shuffledAi[aIdx % shuffledAi.length];
      aIdx += 1;
    }
    generated.push({
      img: src.dataUrl || src.img,
      name: src.name,
      options: getOpts(src.name),
    });
  }
  return generated;
}

export function useGameLogic(images, onUpdateStats) {
  const [phase, setPhase] = useState('idle');
  const [rounds, setRounds] = useState([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [timerPercent, setTimerPercent] = useState(100);
  const [timerSec, setTimerSec] = useState(10);
  const [feedback, setFeedback] = useState({ correct: true, heading: '', sub: '' });
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const timerRef = useRef(null);
  const timeoutsRef = useRef([]);

  const clearAll = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timeoutsRef.current.push(t);
    return t;
  }, []);

  const startGame = useCallback(() => {
    clearAll();
    setPhase('countdown');
    setCountdown(3);
    addTimeout(() => {
      setCountdown(2);
      addTimeout(() => {
        setCountdown(1);
        addTimeout(() => {
          setCountdown("LET'S GO!");
          addTimeout(() => {
            const newRounds = generateRounds(images);
            setRounds(newRounds);
            setRoundIndex(0);
            setSessionCorrect(0);
            setPhase('ready');
            startTimer();
          }, 800);
        }, 1000);
      }, 1000);
    }, 1000);
  }, [addTimeout, clearAll, images]);

  const startTimer = useCallback(() => {
    const duration = 10000;
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const remaining = Math.max(duration - elapsed, 0);
      setTimerSec(Math.ceil(remaining / 1000));
      setTimerPercent((remaining / duration) * 100);
      if (remaining > 0) {
        timerRef.current = requestAnimationFrame(animate);
      } else {
        setPhase('question');
      }
    };
    timerRef.current = requestAnimationFrame(animate);
  }, []);

  const goToQuestion = useCallback(() => {
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
    setPhase('question');
  }, []);

  const selectAnswer = useCallback(
    (selected, correct) => {
      const isCorrect = selected === correct;
      setFeedback({
        correct: isCorrect,
        heading: isCorrect ? 'Well Done! 🎉' : 'Nice try!',
        sub: isCorrect ? "That's correct." : `The answer was ${correct}.`,
      });
      if (isCorrect) {
        setSessionCorrect((c) => c + 1);
        onUpdateStats({ correct: true });
      } else {
        onUpdateStats({ correct: false });
      }
      addTimeout(() => setPhase('feedback'), isCorrect ? 500 : 1200);
    },
    [addTimeout, onUpdateStats],
  );

  const nextQuestion = useCallback(() => {
    const next = roundIndex + 1;
    if (next >= 10) {
      onUpdateStats({ gameComplete: true, sessionCorrect });
      setPhase('result');
      return;
    }
    setRoundIndex(next);
    setPhase('ready');
    startTimer();
  }, [onUpdateStats, roundIndex, sessionCorrect, startTimer]);

  const quitGame = useCallback(() => {
    clearAll();
    setPhase('idle');
  }, [clearAll]);

  const currentRound = rounds[roundIndex];

  return {
    phase,
    setPhase,
    countdown,
    timerPercent,
    timerSec,
    roundIndex,
    currentRound,
    feedback,
    sessionCorrect,
    startGame,
    goToQuestion,
    selectAnswer,
    nextQuestion,
    quitGame,
    clearAll,
  };
}
