import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GameReadyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/patient/games/question');
    }, 1200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary)', color: 'var(--white)' }}>
      <h1 className="headline-lg" style={{ fontSize: 42, color: 'var(--mint-soft)' }}>
        GO! 🎯
      </h1>
    </div>
  );
}
