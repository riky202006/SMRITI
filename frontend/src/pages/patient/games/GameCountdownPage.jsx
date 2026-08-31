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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--primary)', color: 'var(--white)' }}>
      <p className="body-lg" style={{ color: 'var(--mint-soft)', marginBottom: 12 }}>Get Ready...</p>
      <h1 style={{ fontSize: 96, fontWeight: 800 }}>{count}</h1>
    </div>
  );
}
