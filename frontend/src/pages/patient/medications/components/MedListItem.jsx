import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { IconMedication, IconCheck } from '@/components/icons';
import { formatTime } from '@/utils/formatters';

export default function MedListItem({ medicine, isTaken, takenAt, onToggle, toggling }) {
  const primaryTime = medicine.times && medicine.times.length > 0 ? medicine.times[0] : '08:00';

  let takenTimeStr = '';
  if (isTaken && takenAt) {
    try {
      const d = new Date(takenAt);
      takenTimeStr = ` at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {}
  }

  return (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: 10, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}>
            <IconMedication size={24} />
          </div>
          <div>
            <h3 className="headline-sm">{medicine.name}</h3>
            <p className="body-md" style={{ color: 'var(--outline)' }}>
              {medicine.dosage} • {medicine.type || 'Tablet'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {(medicine.times || [primaryTime]).map((t) => (
          <span
            key={t}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-pill)',
              backgroundColor: 'var(--surface-container)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ⏰ {formatTime(t)}
          </span>
        ))}
      </div>

      <Button
        variant={isTaken ? 'secondary' : 'primary'}
        onClick={() => onToggle && onToggle(medicine.id, primaryTime, !isTaken)}
        disabled={toggling}
        style={{ width: '100%' }}
      >
        {toggling ? (
          'Updating Cloud Log...'
        ) : isTaken ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconCheck size={20} /> Dose Marked as Taken{takenTimeStr}
          </span>
        ) : (
          'Mark as Taken'
        )}
      </Button>
    </Card>
  );
}
