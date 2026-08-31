import { useState } from 'react';
import Card from '@/components/ui/Card';
import { IconCalendar, IconCheck } from '@/components/icons';

export default function AppointmentReminderCard({ visit, onAcknowledge }) {
  const [acknowledged, setAcknowledged] = useState(visit?.acknowledged || false);

  if (!visit) return null;

  const isDoctor = visit.kind === 'doctor' || !visit.kind;

  const handleConfirm = () => {
    setAcknowledged(true);
    if (onAcknowledge) onAcknowledge(visit.id);
  };

  return (
    <Card style={{
      borderLeft: `4px solid ${isDoctor ? 'var(--primary)' : 'var(--secondary)'}`,
      padding: '12px 14px',
      marginBottom: 10,
      boxSizing: 'border-box',
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{
            padding: 6,
            borderRadius: 'var(--radius-pill)',
            backgroundColor: isDoctor ? 'var(--mint-soft)' : '#fff3e0',
            color: isDoctor ? 'var(--primary)' : 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconCalendar size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              color: isDoctor ? 'var(--primary)' : 'var(--secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              display: 'block',
            }}>
              {isDoctor ? '👨‍⚕️ Doctor Appointment' : '👥 Visitor Visit'}
            </span>
            <h4 style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {visit.name}
            </h4>
          </div>
        </div>

        <button
          type="button"
          className={`btn btn-sm ${acknowledged ? 'btn-secondary' : 'btn-primary'}`}
          onClick={handleConfirm}
          style={{ fontSize: 11, padding: '4px 10px', height: 28, flexShrink: 0, width: 'auto' }}
        >
          {acknowledged ? (
            <>
              <IconCheck size={14} /> Noted
            </>
          ) : (
            'Confirm'
          )}
        </button>
      </div>

      <div style={{ fontSize: 12, color: 'var(--outline)', marginTop: 4, lineHeight: 1.4, display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
        <span>📅 Today at {visit.time}</span>
        {visit.purpose && <span>• {visit.purpose}</span>}
        {visit.location && <span>📍 {visit.location}</span>}
      </div>
    </Card>
  );
}
