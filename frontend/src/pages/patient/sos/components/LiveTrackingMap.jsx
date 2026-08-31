import { IconMap } from '@/components/icons';

export default function LiveTrackingMap({ latitude = 12.9716, longitude = 77.5946 }) {
  return (
    <div
      style={{
        width: '100%',
        height: 220,
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--mint-soft)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justify: 'center',
        border: '2px dashed var(--primary)',
        color: 'var(--primary)',
        padding: 16,
        textAlign: 'center',
      }}
    >
      <IconMap size={48} style={{ marginBottom: 8 }} />
      <p className="headline-sm">GPS Live Tracking Active</p>
      <p className="body-md" style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>
        Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
      </p>
    </div>
  );
}
