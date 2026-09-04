import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LiveTrackingMap from '@/pages/patient/sos/components/LiveTrackingMap';
import { useCaretaker } from '@/context/CaretakerContext';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useToast } from '@/context/ToastContext';
import { formatRelativeTime } from '@/utils/formatters';
import { IconMap, IconUser, IconCheck } from '@/components/icons';

export default function MapPage() {
  const { showToast } = useToast();
  const {
    assignedPatients,
    activePatient: patient,
    activePatientId,
    loadingPatients,
    selectPatient,
  } = useCaretaker();

  const patientId = patient?.patient_id;
  const patientName = patient?.patient?.profiles?.full_name || 'Assigned Patient';
  const relationship = patient?.relationship || 'Caregiver';
  const connectionCode = patient?.patient?.connection_code || '';

  const {
    latestLocation,
    loading: loadingLocation,
    refreshing,
    refresh,
  } = useLocationTracking(patientId);

  const [currentTime, setCurrentTime] = useState(Date.now());

  // Periodically update relative time ticker every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const lat = latestLocation?.latitude ? Number(latestLocation.latitude) : null;
  const lng = latestLocation?.longitude ? Number(latestLocation.longitude) : null;
  const accuracy = latestLocation?.accuracy ? Number(latestLocation.accuracy) : null;
  const recordedAt = latestLocation?.recorded_at || null;

  const hasCoords =
    lat != null &&
    lng != null &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180;

  // Live vs Recent vs Unavailable classification
  const fixTime = recordedAt ? new Date(recordedAt).getTime() : 0;
  const ageMs = fixTime ? currentTime - fixTime : Infinity;
  const isLiveSharing = hasCoords && ageMs < 180000; // within 3 minutes
  const isRecentFix = hasCoords && !isLiveSharing; // older than 3 minutes

  const googleMapsUrl = hasCoords ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  const handleOpenGoogleMaps = () => {
    if (!hasCoords || !googleMapsUrl) {
      showToast('Coordinates unavailable for Google Maps.');
      return;
    }
    window.open(googleMapsUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCoords = () => {
    if (!hasCoords) return;
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard?.writeText(text).then(() => {
      showToast(`Coordinates copied: ${text}`);
    });
  };

  const handleManualRefresh = async () => {
    await refresh();
    showToast('Location stream refreshed.');
  };

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Patient Live GPS Tracking" />

      <div style={{ marginTop: 8 }}>
        {loadingPatients ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient details...</p>
          </Card>
        ) : !patient ? (
          <Card className="empty-state-card" style={{ backgroundColor: '#fff3e0', borderColor: '#ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to access live GPS tracking.
            </p>
          </Card>
        ) : (
          <div>
            {/* Multi-Patient Switcher Tabs */}
            {assignedPatients.length > 1 && (
              <Card style={{ marginBottom: 16, padding: '12px 18px', backgroundColor: 'var(--surface-container-low)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', margin: 0, fontWeight: 600 }}>
                    MONITORING PATIENT:
                  </p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {assignedPatients.map((p) => {
                      const isSelected = p.patient_id === activePatientId;
                      const name = p.patient?.profiles?.full_name || 'Patient';
                      return (
                        <button
                          key={p.patient_id}
                          type="button"
                          onClick={() => selectPatient(p.patient_id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-pill)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                            backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-container-lowest)',
                            color: isSelected ? 'var(--white)' : 'var(--ink)',
                            fontWeight: 700,
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <IconUser size={14} />
                          <span>{name}</span>
                          {isSelected && <IconCheck size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            )}

            {/* Live Location Status Banner */}
            <Card
              style={{
                marginBottom: 20,
                backgroundColor: isLiveSharing
                  ? 'var(--ink)'
                  : isRecentFix
                  ? 'var(--surface-container-low)'
                  : '#fff8e1',
                color: isLiveSharing ? 'var(--white)' : 'var(--ink)',
                border: isLiveSharing
                  ? '2px solid var(--primary)'
                  : isRecentFix
                  ? '1px solid var(--outline-variant)'
                  : '1.5px solid #ffe082',
                padding: '20px 24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <h3
                      className="headline-sm"
                      style={{
                        margin: 0,
                        fontSize: '22px',
                        color: isLiveSharing ? 'var(--white)' : 'var(--ink)',
                      }}
                    >
                      {patientName}
                    </h3>
                    <span
                      style={{
                        backgroundColor: isLiveSharing
                          ? 'rgba(46, 125, 50, 0.25)'
                          : isRecentFix
                          ? 'rgba(230, 81, 0, 0.12)'
                          : 'rgba(0, 0, 0, 0.08)',
                        color: isLiveSharing ? 'var(--mint)' : isRecentFix ? '#e65100' : 'var(--outline)',
                        border: isLiveSharing
                          ? '1px solid var(--mint)'
                          : isRecentFix
                          ? '1px solid #ffb74d'
                          : '1px solid var(--outline-variant)',
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-pill)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {isLiveSharing ? (
                        <>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: 'var(--mint)',
                              boxShadow: '0 0 8px var(--mint)',
                            }}
                          />
                          LIVE SHARING ACTIVE
                        </>
                      ) : isRecentFix ? (
                        <>
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: '#e65100',
                            }}
                          />
                          LAST KNOWN LOCATION
                        </>
                      ) : (
                        'LOCATION UNAVAILABLE'
                      )}
                    </span>
                  </div>

                  <p
                    className="body-md"
                    style={{
                      margin: '6px 0 0',
                      fontSize: '13px',
                      color: isLiveSharing ? 'rgba(255, 255, 255, 0.85)' : 'var(--outline)',
                    }}
                  >
                    {isLiveSharing
                      ? `Real-time GPS stream active. Updated ${formatRelativeTime(recordedAt)}.`
                      : isRecentFix
                      ? `Patient is not currently streaming. Last recorded fix: ${formatRelativeTime(recordedAt)} (${new Date(recordedAt).toLocaleTimeString()}).`
                      : 'Patient has not enabled location sharing on their device yet.'}
                    {connectionCode ? ` • SMRITI Code: ${connectionCode}` : ''}
                  </p>
                </div>

                {/* Primary Actions: Google Maps & Refresh */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleManualRefresh}
                    disabled={refreshing}
                    style={{
                      fontSize: '13px',
                      padding: '8px 14px',
                      color: isLiveSharing ? 'var(--white)' : undefined,
                      borderColor: isLiveSharing ? 'rgba(255, 255, 255, 0.4)' : undefined,
                    }}
                  >
                    {refreshing ? 'Refreshing...' : '🔄 Refresh Fix'}
                  </Button>

                  <Button
                    variant={hasCoords ? 'primary' : 'outline'}
                    size="sm"
                    onClick={handleOpenGoogleMaps}
                    disabled={!hasCoords}
                    style={{
                      fontSize: '13px',
                      padding: '8px 16px',
                      fontWeight: 700,
                      opacity: hasCoords ? 1 : 0.5,
                      cursor: hasCoords ? 'pointer' : 'not-allowed',
                    }}
                  >
                    🗺️ View on Google Maps ↗
                  </Button>
                </div>
              </div>
            </Card>

            <div className="grid-responsive-2" style={{ alignItems: 'start' }}>
              {/* Left Column: Telemetry & Safety Zone */}
              <div>
                <Card style={{ marginBottom: 16 }}>
                  <h4 className="headline-sm" style={{ fontSize: '17px', marginBottom: 8 }}>
                    Geofence &amp; Safety Status
                  </h4>
                  <p className="body-md" style={{ color: 'var(--outline)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
                    {isLiveSharing
                      ? '✓ Live satellite feed synchronized. Active tracking provides instant position within standard safe perimeter.'
                      : isRecentFix
                      ? 'Displaying last captured coordinates. To receive continuous telemetry, patient should keep "Live Location Sharing" enabled.'
                      : 'Perimeter and safety monitoring will activate as soon as location coordinates are transmitted by the patient.'}
                  </p>
                </Card>

                {/* Detailed Satellite Fix Card */}
                {hasCoords && (
                  <Card style={{ marginBottom: 16, backgroundColor: 'var(--surface-container-low)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 className="label-lg" style={{ color: 'var(--primary)', margin: 0 }}>
                        SATELLITE TELEMETRY FIX
                      </h4>
                      <Button variant="outline" size="sm" onClick={handleCopyCoords} style={{ fontSize: '11px', padding: '2px 8px' }}>
                        📋 Copy Coords
                      </Button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--outline)' }}>Latitude:</span>
                        <strong style={{ fontFamily: 'monospace' }}>{lat?.toFixed(6)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--outline)' }}>Longitude:</span>
                        <strong style={{ fontFamily: 'monospace' }}>{lng?.toFixed(6)}</strong>
                      </div>
                      {accuracy && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--outline)' }}>Accuracy:</span>
                          <strong>±{Math.round(accuracy)} meters</strong>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--outline)' }}>Last Fix Recorded:</span>
                        <strong>{new Date(recordedAt).toLocaleTimeString()} ({formatRelativeTime(recordedAt)})</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--outline)' }}>Monitored Patient:</span>
                        <strong>{patientName} ({relationship})</strong>
                      </div>
                    </div>

                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--surface-container-high)' }}>
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--primary)',
                          fontSize: '13px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        Open Exact Coordinates in Google Maps App ↗
                      </a>
                    </div>
                  </Card>
                )}

                {/* Helpful Guidelines Card */}
                <Card style={{ backgroundColor: 'var(--surface-container-lowest)' }}>
                  <h4 className="label-lg" style={{ color: 'var(--outline)', marginBottom: 8, letterSpacing: '0.5px' }}>
                    ABOUT LIVE LOCATION STREAMING
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--outline)', fontSize: '13px', lineHeight: 1.6 }}>
                    <li>Location updates stream via Supabase real-time channels whenever the patient turns on Live Share.</li>
                    <li>Google Maps button opens coordinates directly in Google Maps for turn-by-turn navigation.</li>
                    <li>Switching active patients switches the live map and telemetry stream instantly.</li>
                  </ul>
                </Card>
              </div>

              {/* Right Column: Interactive Map */}
              <div>
                {loadingLocation && !latestLocation ? (
                  <Card style={{ textAlign: 'center', padding: 48 }}>
                    <div className="spinner" />
                    <p className="body-md" style={{ color: 'var(--outline)', marginTop: 12 }}>
                      Connecting to location telemetry channel...
                    </p>
                  </Card>
                ) : (
                  <LiveTrackingMap
                    latitude={lat}
                    longitude={lng}
                    accuracy={accuracy}
                    lastUpdated={recordedAt}
                    title={`${patientName}'s Live Position`}
                    height="420px"
                    showGoogleMapsBtn={true}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
