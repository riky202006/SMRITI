import Card from '@/components/ui/Card';
import { IconMedication, IconCheck } from '@/components/icons';
import { formatTime } from '@/utils/formatters';

export default function MedReminderCard({ medication, isTaken, onToggle }) {
  if (!medication) return null;

  const timeStr = medication.times && medication.times.length > 0 ? medication.times[0] : '08:00';

  return (
    <Card style={{
      borderLeft: '4px solid var(--secondary)',
      padding: '14px 16px',
      marginBottom: 12,
      boxSizing: 'border-box',
      width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            padding: 8,
            borderRadius: 'var(--radius-pill)',
            backgroundColor: '#fff3e0',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconMedication size={20} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              color: 'var(--secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              display: 'block',
            }}>
              💊 Daily Medication
            </span>
            <h4 style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {medication.name}
            </h4>
          </div>
        </div>

        <button
          type="button"
          className={`btn btn-sm ${isTaken ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => onToggle && onToggle(medication.id, timeStr, !isTaken)}
          style={{ padding: '6px 14px', flexShrink: 0, width: 'auto' }}
        >
          {isTaken ? (
            <>
              <IconCheck size={14} /> Taken
            </>
          ) : (
            'Mark Taken'
          )}
        </button>
      </div>

      <div style={{ fontSize: 13, color: 'var(--outline)', marginTop: 4, lineHeight: 1.4, display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
        {medication.dosage && <span>Dosage: <strong>{medication.dosage}</strong></span>}
        <span>Scheduled: <strong>{formatTime(timeStr)}</strong></span>
        {medication.type && <span>• {medication.type}</span>}
      </div>
    </Card>
  );
}
