import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LiveTrackingMap from './components/LiveTrackingMap';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSos } from '@/hooks/useSos';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { getAssignedCaretakersForPatient } from '@/services/patients';
import { IconSos, IconPhone, IconCheck, IconMap } from '@/components/icons';

export default function SosPage() {
  const { patientRecord } = useAuth();
  const { showToast } = useToast();
  const patientId = patientRecord?.id;

  const {
    currentActive: activeAlert,
    isEmergency,
    isAcknowledged,
    triggerSos,
    resolveSos,
    error: sosError,
  } = useSos(patientId);

  const {
    latestLocation,
    isTracking,
    gpsCoords,
    gpsError,
    startTracking,
    stopTracking,
  } = useLocationTracking(patientId);

  const { contacts, primaryContact } = useEmergencyContacts(patientId);

  const [caretakers, setCaretakers] = useState([]);
  const [triggering, setTriggering] = useState(false);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (patientId) {
      getAssignedCaretakersForPatient(patientId).then(({ data }) => {
        if (data && data.length > 0) {
          setCaretakers(data);
        }
      });
    }
  }, [patientId]);

  const handleToggleGps = () => {
    if (isTracking) {
      stopTracking();
      showToast('Live GPS sharing stopped.');
    } else {
      startTracking(15000);
      showToast('Live GPS location sharing started.');
    }
  };

  const handleTrigger = async () => {
    if (!patientId) {
      showToast('Patient profile not linked yet.');
      return;
    }

    setTriggering(true);
    try {
      const coords = gpsCoords || (latestLocation ? { latitude: Number(latestLocation.latitude), longitude: Number(latestLocation.longitude) } : null);
      const { error, alreadyActive } = await triggerSos(coords);

      if (error) {
        showToast('⚠️ SOS Transmission Failed: ' + error.message);
      } else if (alreadyActive) {
        showToast('Active distress signal is already broadcasting.');
      } else {
        showToast('🚨 Emergency SOS broadcasted to your Caretaker!');
      }
    } finally {
      setTriggering(false);
    }
  };

  const handleResolve = async () => {
    if (!activeAlert?.id) return;
    setResolving(true);
    try {
      const { error } = await resolveSos(activeAlert.id);
      if (error) {
        showToast('Failed to resolve alert: ' + error.message);
      } else {
        showToast('Emergency alert cleared.');
      }
    } finally {
      setResolving(false);
    }
  };

  const caretakerProfile = caretakers[0]?.caretaker;
  const caretakerName = caretakerProfile?.full_name || 'Caretaker';
  const caretakerPhone = caretakerProfile?.phone || primaryContact?.phone || '';

  const activeLat = gpsCoords?.latitude ?? (latestLocation?.latitude ? Number(latestLocation.latitude) : null);
  const activeLng = gpsCoords?.longitude ?? (latestLocation?.longitude ? Number(latestLocation.longitude) : null);

  return (
    <AppLayout mode="patient">
      <TopBar title="Emergency SOS & Location" />

      <div style={{ marginTop: 8 }}>
        {sosError && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--error-container)',
              color: 'var(--on-error-container)',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: 16,
            }}
          >
            {sosError.message || 'SOS Network Error'}
          </div>
        )}

        <div className="grid-responsive-2" style={{ alignItems: 'start' }}>
          {/* Left Column: SOS Button / Active Alert State */}
          <div>
            {isEmergency || isAcknowledged ? (
              <Card
                style={{
                  backgroundColor: isAcknowledged ? '#e8f5e9' : 'var(--error-container)',
                  border: `2px solid ${isAcknowledged ? '#2e7d32' : 'var(--error)'}`,
                  padding: '24px',
                  marginBottom: 20,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: isAcknowledged ? '#2e7d32' : 'var(--error)',
                    color: 'var(--white)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  {isAcknowledged ? <IconCheck size={36} /> : <IconSos size={36} />}
                </div>

                <h2
                  className="headline-md"
                  style={{ color: isAcknowledged ? '#2e7d32' : 'var(--on-error-container)', fontSize: '22px' }}
                >
                  {isAcknowledged ? 'CARETAKER ACKNOWLEDGED!' : 'EMERGENCY DISTRESS ACTIVE'}
                </h2>

                <p
                  className="body-md"
                  style={{ color: isAcknowledged ? '#1b5e20' : 'var(--on-error-container)', marginTop: 8, fontSize: '15px' }}
                >
                  {isAcknowledged
                    ? `Your caretaker (${caretakerName}) has received and acknowledged your distress alert at ${new Date(activeAlert.acknowledged_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} and is attending to you.`
                    : `Distress alert sent at ${new Date(activeAlert.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Broadcasting live to your caretaker (${caretakerName}).`}
                </p>

                <div style={{ marginTop: 24 }}>
                  <Button
                    variant={isAcknowledged ? 'primary' : 'outline'}
                    onClick={handleResolve}
                    disabled={resolving}
                    style={{ width: '100%', borderColor: 'var(--error)', color: isAcknowledged ? undefined : 'var(--error)' }}
                  >
                    {resolving ? 'Clearing Alert...' : 'I Am Safe Now (Cancel SOS)'}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card style={{ padding: '36px 20px', textAlign: 'center', marginBottom: 20 }}>
                <Button
                  variant="danger"
                  onClick={handleTrigger}
                  disabled={triggering}
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    fontSize: 26,
                    fontWeight: 800,
                    boxShadow: '0 12px 30px rgba(186, 26, 26, 0.4)',
                    margin: '0 auto 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconSos size={44} />
                  <span style={{ marginTop: 4 }}>{triggering ? 'SENDING...' : 'SOS'}</span>
                </Button>

                <h3 className="headline-sm" style={{ fontSize: '18px', marginBottom: 6 }}>
                  Emergency Distress Signal
                </h3>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: '14px', maxWidth: '360px', margin: '0 auto' }}>
                  Tap the red button in an emergency to alert your caretaker and transmit your latest GPS location immediately.
                </p>
              </Card>
            )}

            {/* Direct Contacts Card */}
            <Card style={{ marginBottom: 20 }}>
              <h3 className="label-lg" style={{ marginBottom: 14, color: 'var(--outline)', letterSpacing: '0.5px' }}>
                DIRECT EMERGENCY CONTACTS
              </h3>

              {caretakerPhone ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: contacts.length > 0 ? '1px solid var(--surface-container)' : 'none' }}>
                  <div>
                    <p className="headline-sm" style={{ fontSize: 16, margin: 0 }}>{caretakerName}</p>
                    <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, margin: '2px 0 0' }}>
                      Primary Caretaker • {caretakerPhone}
                    </p>
                  </div>
                  <a
                    href={`tel:${caretakerPhone.replace(/[^0-9+]/g, '')}`}
                    className="icon-btn"
                    style={{ backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}
                    aria-label={`Call ${caretakerName}`}
                  >
                    <IconPhone size={22} />
                  </a>
                </div>
              ) : null}

              {contacts.map((c) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
                  <div>
                    <p className="headline-sm" style={{ fontSize: 16, margin: 0 }}>{c.name}</p>
                    <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, margin: '2px 0 0' }}>
                      {c.relationship} • {c.phone}
                    </p>
                  </div>
                  <a
                    href={`tel:${c.phone.replace(/[^0-9+]/g, '')}`}
                    className="icon-btn"
                    style={{ backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}
                    aria-label={`Call ${c.name}`}
                  >
                    <IconPhone size={22} />
                  </a>
                </div>
              ))}

              {!caretakerPhone && contacts.length === 0 && (
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13 }}>
                  No emergency phone contacts linked yet. Ask your caretaker to add contacts.
                </p>
              )}
            </Card>
          </div>

          {/* Right Column: GPS Tracking & Live Map */}
          <div>
            {/* GPS Control Card */}
            <Card style={{ marginBottom: 16, border: isTracking ? '2px solid var(--primary)' : '1px solid var(--outline-variant)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconMap size={26} style={{ color: isTracking ? 'var(--primary)' : 'var(--outline)' }} />
                  <div>
                    <h4 className="headline-sm" style={{ fontSize: 16 }}>Live Location Sharing</h4>
                    <p className="body-md" style={{ color: 'var(--outline)', fontSize: 12 }}>
                      {isTracking ? '● Transmitting coordinates actively' : 'Disabled (Requires permission)'}
                    </p>
                  </div>
                </div>

                <Button
                  variant={isTracking ? 'secondary' : 'primary'}
                  onClick={handleToggleGps}
                  style={{ padding: '6px 14px', fontSize: 13 }}
                >
                  {isTracking ? 'Stop Sharing' : 'Start Sharing'}
                </Button>
              </div>

              {gpsError && (
                <p className="body-md" style={{ color: 'var(--error)', fontSize: 12, marginTop: 8 }}>
                  ⚠️ {gpsError}
                </p>
              )}
            </Card>

            {/* Live Map Preview */}
            <LiveTrackingMap
              latitude={activeLat}
              longitude={activeLng}
              accuracy={gpsCoords?.accuracy}
              lastUpdated={gpsCoords?.timestamp || (latestLocation?.recorded_at ? new Date(latestLocation.recorded_at).getTime() : null)}
              title={isTracking ? 'Your Live Location (Transmitting)' : 'Last Known Location'}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
