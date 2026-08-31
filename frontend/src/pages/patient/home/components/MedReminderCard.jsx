import Card from '@/components/ui/Card';
import { IconMedication, IconCheck } from '@/components/icons';
import { formatTime } from '@/utils/formatters';

export default function MedReminderCard({ medicine = [], onToggle }) {
  const nextMed = medicine[0] || { name: 'Paracetamol', dosage: '500 mg', times: ['08:00'] };
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = nextMed.times ? nextMed.times[0] : '08:00';
  const histKey = `${dateStr}_${timeStr}`;
  const isTaken = nextMed.history ? !!nextMed.history[histKey] : false;

  return (
    <Card style={{
      borderLeft: '4px solid var(--secondary)',
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
            backgroundColor: '#fff3e0',
            color: 'var(--secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <IconMedication size={18} />
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
            <h4 style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {nextMed.name}
            </h4>
          </div>
        </div>

        <button
          type="button"
          className={`btn btn-sm ${isTaken ? 'btn-secondary' : 'btn-primary'}`}
          onClick={() => onToggle && onToggle(nextMed.id, timeStr, dateStr)}
          style={{ fontSize: 11, padding: '4px 10px', height: 28, flexShrink: 0, width: 'auto' }}
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

      <div style={{ fontSize: 12, color: 'var(--outline)', marginTop: 4, lineHeight: 1.4, display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
        <span>Dosage: <strong>{nextMed.dosage}</strong></span>
        <span>• Time: <strong>{formatTime(timeStr)}</strong></span>
      </div>
    </Card>
  );
}
