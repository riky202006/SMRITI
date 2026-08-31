import { useState, useEffect } from 'react';
import Toast from '../ui/Toast';
import { useApp } from '@/context/AppContext';

export default function DeviceFrame({ children }) {
  const { toast } = useApp();
  const [timeStr, setTimeStr] = useState('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, '0');
      hours = hours % 12 || 12;
      setTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="device-frame">
      {/* iPhone Dynamic Island */}
      <div className="dynamic-island">
        <div className="dynamic-island-sensor"></div>
        <div className="dynamic-island-camera"></div>
      </div>

      {/* iPhone iOS Top Status Bar */}
      <div className="ios-status-bar">
        <span>{timeStr}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Signal Icon */}
          <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
            <rect x="0" y="8" width="2.5" height="4" rx="0.5" />
            <rect x="4" y="6" width="2.5" height="6" rx="0.5" />
            <rect x="8" y="3" width="2.5" height="9" rx="0.5" />
            <rect x="12" y="0" width="2.5" height="12" rx="0.5" />
          </svg>
          {/* Wi-Fi Icon */}
          <svg width="15" height="12" viewBox="0 0 15 12" fill="currentColor">
            <path d="M7.5 9.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zm-3.536-2.464a5 5 0 0 1 7.072 0l-1.06 1.06a3.5 3.5 0 0 0-4.952 0l-1.06-1.06zm-2.828-2.828a9 9 0 0 1 12.728 0l-1.06 1.06a7.5 7.5 0 0 0-10.608 0l-1.06-1.06z" />
          </svg>
          {/* Battery Icon */}
          <svg width="22" height="11" viewBox="0 0 22 11" fill="currentColor">
            <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="currentColor" fill="none" strokeWidth="1" />
            <rect x="2" y="2" width="13" height="7" rx="1.5" />
            <path d="M20 3.5v4a1.5 1.5 0 0 0 1.5-1.5v-1A1.5 1.5 0 0 0 20 3.5z" />
          </svg>
        </div>
      </div>

      {toast && <Toast message={toast} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {children}
      </div>

      {/* iPhone iOS Bottom Home Indicator */}
      <div className="ios-home-indicator"></div>
    </div>
  );
}
