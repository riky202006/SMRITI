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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--primary)',
      color: 'var(--white)',
      padding: '24px',
    }}>
      <h1 style={{ fontSize: 'clamp(48px, 8vw, 84px)', fontWeight: 900, color: 'var(--mint-soft)' }}>
        GO! 🎯
      </h1>
    </div>
  );
}
