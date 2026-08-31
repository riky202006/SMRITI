import { useNavigate } from 'react-router-dom';
import { DeviceFrame } from '@/components/layout/DeviceFrame';

export default function RoleSelectLanding() {
  const navigate = useNavigate();

  return (
    <DeviceFrame>
      <div className="page-scroll" style={{ justifyContent: 'center', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2 style={{ fontSize: 30, color: 'var(--teal-dark)', margin: 0 }}>Welcome to Smriti</h2>
          <p style={{ color: 'var(--gray)', margin: '8px 0 0' }}>Please choose how you&apos;ll use the app</p>
        </div>

        <div className="card row-card" onClick={() => navigate('/patient')} role="button" tabIndex={0}>
          <div className="row-icon" style={{ background: '#8fe0c9', color: 'var(--teal-dark)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="row-text">
            <p className="title">I am a Patient</p>
            <p className="sub">Play memory games, view medicines &amp; documents</p>
          </div>
        </div>

        <div className="card row-card" onClick={() => navigate('/caretaker')} role="button" tabIndex={0}>
          <div className="row-icon" style={{ background: '#f2c9a3', color: '#8a4d1a' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="row-text">
            <p className="title">I am a Caretaker</p>
            <p className="sub">Manage photos, medicines &amp; track live location</p>
          </div>
        </div>
      </div>
    </DeviceFrame>
  );
}
