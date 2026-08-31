import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { getPatientByProfileId } from '@/services/patients';
import { saveMemorySession } from '@/services/analytics';
import { DeviceFrame } from '@/components/layout/DeviceFrame';
import { useGameLogic } from '@/hooks/useGameLogic';
import './games.css';

export default function GamePlayPage() {
  const navigate = useNavigate();
  const { appData, setAppData, showToast } = useApp();
  const { user, patientRecord } = useAuth();
  const [selected, setSelected] = useState(null);

  const onUpdateStats = useCallback(
    async ({ correct, gameComplete, sessionCorrect: sc }) => {
      setAppData((prev) => {
        const stats = { ...(prev.stats || { games: 0, score: 0, correct: 0, incorrect: 0 }) };
        if (correct === true) {
          stats.correct = (stats.correct || 0) + 1;
          stats.score = (stats.score || 0) + 10;
        } else if (correct === false) {
          stats.incorrect = (stats.incorrect || 0) + 1;
        }
        if (gameComplete) {
          stats.games = (stats.games || 0) + 1;
          return { ...prev, stats, currentGameCorrect: sc };
        }
        return { ...prev, stats };
      });

      if (gameComplete) {
        let pId = patientRecord?.id;
        if (!pId && user?.id) {
          const { data: pRec } = await getPatientByProfileId(user.id);
          pId = pRec?.id;
        }

        if (pId) {
          const total = 10;
          const correctNum = sc || 0;
          const acc = Math.round((correctNum / total) * 100);
          await saveMemorySession({
            patientId: pId,
            totalRounds: total,
            correctCount: correctNum,
            accuracy: acc,
            score: correctNum * 10,
            summary: `Completed 10-round memory challenge (${correctNum}/10 correct, ${acc}% accuracy).`,
          });
        }
      }
    },
    [setAppData, patientRecord?.id, user?.id],
  );

  const game = useGameLogic(appData.images, onUpdateStats);

  useEffect(() => {
    game.startGame();
    return () => game.clearAll();
  }, []);

  const quit = () => {
    game.quitGame();
    showToast('Game cancelled');
    navigate('/patient/games');
  };

  if (game.phase === 'countdown') {
    return (
      <DeviceFrame>
        <div className="game-countdown">
          <div className="game-countdown__text">{game.countdown}</div>
        </div>
      </DeviceFrame>
    );
  }

  if (game.phase === 'result') {
    return (
      <DeviceFrame>
        <div className="page-scroll page-scroll--center">
          <div className="card" style={{ width: '100%', padding: '30px 20px' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'var(--mint)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-dark)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 36, height: 36 }}>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <h2 style={{ fontSize: 26, color: 'var(--teal-dark)', margin: '0 0 8px' }}>Game Completed!</h2>
            <p style={{ color: 'var(--gray)', margin: '0 0 20px' }}>Great job exercising your memory.</p>
            <div style={{ background: 'var(--cream)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--gray)' }}>Your Score</p>
              <h1 style={{ margin: '4px 0', fontSize: 42, color: 'var(--teal-dark)' }}>{game.sessionCorrect * 10}</h1>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--teal-dark)', fontWeight: 700 }}>{game.sessionCorrect} / 10 Correct</p>
            </div>
            <button type="button" className="btn btn-primary" style={{ marginBottom: 12 }} onClick={() => navigate('/patient/games/play', { replace: true })}>
              PLAY AGAIN
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/patient/home')}>
              BACK TO HOME
            </button>
          </div>
        </div>
      </DeviceFrame>
    );
  }

  if (game.phase === 'feedback') {
    return (
      <DeviceFrame>
        <div className="game-correct">
          <div className="correct-card">
            <div className="check-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 13l5 5L20 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ margin: '0 0 4px', fontSize: 24 }}>{game.feedback.heading}</h2>
            <p style={{ color: 'var(--gray)', margin: 0 }}>{game.feedback.sub}</p>
            <div className="dots-row">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`dot${i <= game.roundIndex ? ' filled' : ''}`} />
              ))}
            </div>
            <button type="button" className="btn btn-primary" onClick={game.nextQuestion}>
              NEXT →
            </button>
          </div>
        </div>
      </DeviceFrame>
    );
  }

  if (game.phase === 'question' && game.currentRound) {
    return (
      <DeviceFrame>
        <div className="game-screen">
          <div className="game-quit-row">
            <button type="button" className="game-quit-btn" onClick={quit}>QUIT GAME</button>
          </div>
          <div className="gq-body">
            <img src={game.currentRound.img} alt="" className="gq-image" />
            <h2>Who is this?</h2>
            <p className="hint">Tap the correct name below</p>
            <div className="options">
              {game.currentRound.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={`option-btn${selected === opt ? (opt === game.currentRound.name ? ' correct' : ' wrong') : ''}`}
                  disabled={selected !== null}
                  onClick={() => {
                    setSelected(opt);
                    game.selectAnswer(opt, game.currentRound.name);
                    setTimeout(() => setSelected(null), 1500);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <div className="gq-footer">
            <div className="q-count">Question {game.roundIndex + 1} of 10</div>
          </div>
        </div>
      </DeviceFrame>
    );
  }

  if (game.phase === 'ready' && game.currentRound) {
    return (
      <DeviceFrame>
        <div className="game-screen">
          <div className="game-quit-row">
            <button type="button" className="game-quit-btn" onClick={quit}>QUIT GAME</button>
          </div>
          <div className="game-ready-body">
            <h2>Look carefully...</h2>
            <div className="stim-card">
              <img src={game.currentRound.img} alt={game.currentRound.name} />
            </div>
            <div className="timer-row">
              <div className="timer-bar-track">
                <div className="timer-bar-fill" style={{ width: `${game.timerPercent}%` }} />
              </div>
              <div className="timer-labels">
                <span>{game.timerSec}s</span>
                <span>0s</span>
              </div>
            </div>
          </div>
          <div className="game-footer">
            <div className="q-count">Question {game.roundIndex + 1} of 10</div>
            <button type="button" className="btn btn-primary" onClick={game.goToQuestion}>
              I&apos;M READY ✓
            </button>
          </div>
        </div>
      </DeviceFrame>
    );
  }

  return (
    <DeviceFrame>
      <div className="page-scroll page-scroll--center">
        <p>Loading game...</p>
      </div>
    </DeviceFrame>
  );
}
