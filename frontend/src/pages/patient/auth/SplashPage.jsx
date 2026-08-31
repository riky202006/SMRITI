import { useNavigate } from 'react-router-dom';
import { DeviceFrame } from '@/components/layout/DeviceFrame';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <DeviceFrame>
      <div className="splash-screen" onClick={() => navigate('/patient/role')} role="button" tabIndex={0}>
        <div style={{ width: 90, height: 90, marginBottom: 16 }}>
          <svg viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="18" fill="#8fe0c9" />
            <ellipse cx="50" cy="22" rx="14" ry="18" fill="#8fe0c9" opacity="0.8" />
            <ellipse cx="50" cy="78" rx="14" ry="18" fill="#8fe0c9" opacity="0.8" />
            <ellipse cx="22" cy="50" rx="18" ry="14" fill="#8fe0c9" opacity="0.8" />
            <ellipse cx="78" cy="50" rx="18" ry="14" fill="#8fe0c9" opacity="0.8" />
            <circle cx="50" cy="50" r="10" fill="#0b5d52" />
          </svg>
        </div>
        <h1 className="splash-title">Smriti</h1>
        <p className="splash-sub">MemoryCare &amp; Companion</p>
        <p style={{ fontSize: 13, opacity: 0.65, marginTop: 30 }}>Tap anywhere to begin</p>
      </div>
    </DeviceFrame>
  );
}
