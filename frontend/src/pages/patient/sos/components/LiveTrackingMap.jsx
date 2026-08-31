import { IconMap } from '@/components/icons';

export default function LiveTrackingMap({
  latitude,
  longitude,
  accuracy,
  lastUpdated,
  title = 'Patient Live Location',
  interactive = false,
}) {
  const hasCoords = latitude != null && longitude != null;

  if (!hasCoords) {
    return (
      <div
        style={{
          width: '100%',
          minHeight: 200,
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1.5px dashed var(--outline)',
          color: 'var(--outline)',
          padding: 24,
          textAlign: 'center',
        }}
      >
        <IconMap size={44} style={{ marginBottom: 10, opacity: 0.6 }} />
        <p className="headline-sm" style={{ fontSize: 16, color: 'var(--ink)' }}>Location Unavailable</p>
        <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, marginTop: 4, maxWidth: 300 }}>
          Live GPS coordinates have not been transmitted yet. Patient must enable "Share Live Location".
        </p>
      </div>
    );
  }

  // OpenStreetMap embed URL for privacy-friendly real rendering without API keys
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005}%2C${latitude - 0.005}%2C${longitude + 0.005}%2C${latitude + 0.005}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div
      style={{
        width: '100%',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '2px solid var(--primary)',
        backgroundColor: 'var(--surface)',
      }}
    >
      {/* Map Header */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--mint-soft)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2e7d32' }} />
          <span className="label-lg" style={{ color: 'var(--primary)', fontSize: 13 }}>
            {title}
          </span>
        </div>

        {accuracy && (
          <span style={{ fontSize: 11, color: 'var(--outline)', fontWeight: 600 }}>
            Accuracy: ±{Math.round(accuracy)}m
          </span>
        )}
      </div>

      {/* Interactive Map Frame */}
      <div style={{ width: '100%', height: 220, position: 'relative' }}>
        <iframe
          title="Patient Live Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={osmEmbedUrl}
          style={{ border: 'none' }}
        />
      </div>

      {/* Map Footer Info */}
      <div
        style={{
          padding: '8px 12px',
          backgroundColor: 'var(--surface-container-lowest)',
          borderTop: '1px solid var(--outline-variant)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
        }}
      >
        <span style={{ fontFamily: 'monospace', color: 'var(--ink)' }}>
          Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
        </span>

        {lastUpdated && (
          <span style={{ color: 'var(--outline)' }}>
            Updated: {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
