import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function GameCountdownPage() {
  const navigate = useNavigate();
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count <= 0) {
      navigate('/patient/games/ready');
      return undefined;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, navigate]);

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
      <p style={{ color: 'var(--mint-soft)', fontSize: '24px', fontWeight: 600, marginBottom: 16 }}>
        Get Ready...
      </p>
      <h1 style={{ fontSize: 'clamp(96px, 15vw, 160px)', fontWeight: 900, lineHeight: 1 }}>
        {count}
      </h1>
    </div>
  );
}
