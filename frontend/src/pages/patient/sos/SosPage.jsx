import { useEffect, useState, useCallback, useRef } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LiveTrackingMap from './components/LiveTrackingMap';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { getPatientByProfileId, getAssignedCaretakersForPatient } from '@/services/patients';
import {
  triggerSosAlert,
  getActiveSosAlerts,
  resolveSosAlert,
  subscribeToSosAlerts,
} from '@/services/sos';
import { startGpsTracking, getLatestLocation } from '@/services/location';
import { IconSos, IconPhone, IconCheck, IconMap } from '@/components/icons';

export default function SosPage() {
  const { appData, showToast } = useAppData();
  const { user, patientRecord } = useAuth();

  const [patientId, setPatientId] = useState(patientRecord?.id || null);
  const [activeAlert, setActiveAlert] = useState(null);
  const [caretakers, setCaretakers] = useState([]);
  const [triggering, setTriggering] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // GPS Location Sharing states
  const [isSharingGps, setIsSharingGps] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsError, setGpsError] = useState('');
  const stopTrackingRef = useRef(null);

  // 1. Resolve patient ID and connected caretakers
  useEffect(() => {
    if (patientRecord?.id) {
      setPatientId(patientRecord.id);
    } else if (user?.id) {
      getPatientByProfileId(user.id).then(({ data }) => {
        if (data?.id) setPatientId(data.id);
      });
    }
  }, [patientRecord?.id, user?.id]);

  useEffect(() => {
    if (patientId) {
      getAssignedCaretakersForPatient(patientId).then(({ data }) => {
        if (data && data.length > 0) {
          setCaretakers(data);
        }
      });
      // Load last known location from cloud
      getLatestLocation(patientId).then(({ data }) => {
        if (data) {
          setGpsCoords({
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            accuracy: data.accuracy,
            timestamp: new Date(data.recorded_at).getTime(),
          });
        }
      });
    }
  }, [patientId]);

  // 2. Load active SOS state from Supabase
  const loadSosState = useCallback(() => {
    if (!patientId) return;

    getActiveSosAlerts(patientId)
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg('Could not verify SOS status from server.');
        } else if (data && data.length > 0) {
          setActiveAlert(data[0]);
        } else {
          setActiveAlert(null);
        }
      })
      .catch(() => {
        setErrorMsg('Network error connecting to cloud.');
      });
  }, [patientId]);

  useEffect(() => {
    loadSosState();
  }, [loadSosState]);

  // 3. Realtime subscription to live SOS updates (e.g. Caretaker acknowledges)
  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToSosAlerts(patientId, () => {
      loadSosState();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId, loadSosState]);

  // 4. GPS Tracking toggle handler
  const handleToggleGps = () => {
    if (isSharingGps) {
      // Stop tracking
      if (stopTrackingRef.current) {
        stopTrackingRef.current();
        stopTrackingRef.current = null;
      }
      setIsSharingGps(false);
      showToast('Live GPS sharing stopped.');
    } else {
      if (!patientId) {
        setGpsError('Patient record not found. Cannot share location.');
        return;
      }

      setGpsError('');
      try {
        const cleanup = startGpsTracking({
          patientId,
          onPosition: (pos) => {
            setGpsCoords(pos);
            setGpsError('');
          },
          onError: (err) => {
            if (err.code === 1) {
              setGpsError('GPS permission was denied by browser settings.');
            } else if (err.code === 2) {
              setGpsError('GPS position unavailable. Please ensure location services are enabled.');
            } else {
              setGpsError('Location error: ' + (err.message || 'Unknown error'));
            }
            setIsSharingGps(false);
          },
          throttleMs: 15000,
        });

        stopTrackingRef.current = cleanup;
        setIsSharingGps(true);
        showToast('Live GPS location sharing started.');
      } catch (err) {
        setGpsError(err.message || 'Could not start GPS.');
      }
    }
  };

  // Cleanup watcher on component unmount
  useEffect(() => {
    return () => {
      if (stopTrackingRef.current) {
        stopTrackingRef.current();
        stopTrackingRef.current = null;
      }
    };
  }, []);

  // 5. Handle SOS button click (attaching latest GPS if available)
  const handleTriggerSos = async () => {
    if (!patientId) {
      setErrorMsg('Patient profile not linked yet. Please check Account screen.');
      return;
    }

    setTriggering(true);
    setErrorMsg('');

    try {
      const { data, error, alreadyActive } = await triggerSosAlert({
        patientId,
        latitude: gpsCoords?.latitude || null,
        longitude: gpsCoords?.longitude || null,
      });

      if (error) {
        setErrorMsg('⚠️ SOS Transmission Failed: Could not contact cloud server. Please call your caretaker directly.');
        showToast('SOS Transmission Failed');
        return;
      }

      if (alreadyActive) {
        showToast('Active distress signal is already broadcasting.');
      } else if (data) {
        showToast('🚨 Emergency SOS broadcasted to your Caretaker!');
      }

      loadSosState();
    } catch (err) {
      setErrorMsg('⚠️ Transmission Error: ' + err.message);
    } finally {
      setTriggering(false);
    }
  };

  // 6. Handle cancel / resolve
  const handleResolveSos = async () => {
    if (!activeAlert?.id) return;

    setResolving(true);
    try {
      const { error } = await resolveSosAlert(activeAlert.id);
      if (error) {
        showToast('Failed to resolve alert: ' + error.message);
      } else {
        showToast('Emergency alert cleared.');
        setActiveAlert(null);
      }
    } catch {
      showToast('Error resolving alert.');
    } finally {
      setResolving(false);
    }
  };

  const isAcknowledged = activeAlert?.status === 'acknowledged';
  const caretakerContact = caretakers[0]?.caretaker;
  const primaryPhone = caretakerContact?.phone || appData.caretakerPhone || '+91 98765 43210';
  const primaryCaretakerName = caretakerContact?.full_name || appData.caretakerName || 'Caretaker';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Emergency SOS" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto', textAlign: 'center' }}>
        {/* Error Banner if transmission fails */}
        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--error-container)',
              color: 'var(--on-error-container)',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: 16,
              textAlign: 'left',
              lineHeight: 1.4,
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Active Emergency Alert Banner */}
        {activeAlert ? (
          <Card
            style={{
              backgroundColor: isAcknowledged ? '#e8f5e9' : 'var(--error-container)',
              border: `2px solid ${isAcknowledged ? '#2e7d32' : 'var(--error)'}`,
              padding: 20,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: isAcknowledged ? '#2e7d32' : 'var(--error)',
                color: 'var(--white)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
              }}
            >
              {isAcknowledged ? <IconCheck size={32} /> : <IconSos size={32} />}
            </div>

            <h2
              className="headline-md"
              style={{ color: isAcknowledged ? '#2e7d32' : 'var(--on-error-container)', fontSize: '20px' }}
            >
              {isAcknowledged ? 'CARETAKER ACKNOWLEDGED!' : 'EMERGENCY DISTRESS ACTIVE'}
            </h2>

            <p
              className="body-md"
              style={{ color: isAcknowledged ? '#1b5e20' : 'var(--on-error-container)', marginTop: 8, fontSize: '14px' }}
            >
              {isAcknowledged
                ? `Your caretaker (${primaryCaretakerName}) has received and acknowledged your distress alert at ${new Date(activeAlert.acknowledged_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} and is attending to you.`
                : `Distress alert sent at ${new Date(activeAlert.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Broadcasting live to your caretaker (${primaryCaretakerName}).`}
            </p>

            <div style={{ marginTop: 18 }}>
              <Button
                variant={isAcknowledged ? 'primary' : 'outline'}
                onClick={handleResolveSos}
                disabled={resolving}
                style={{ width: '100%', borderColor: 'var(--error)', color: isAcknowledged ? undefined : 'var(--error)' }}
              >
                {resolving ? 'Clearing...' : 'I Am Safe Now (Cancel SOS)'}
              </Button>
            </div>
          </Card>
        ) : (
          <div style={{ margin: '10px auto 20px' }}>
            <Button
              variant="danger"
              onClick={handleTriggerSos}
              disabled={triggering}
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                fontSize: 24,
                fontWeight: 800,
                boxShadow: '0 12px 30px rgba(186, 26, 26, 0.4)',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSos size={40} />
              <span style={{ marginTop: 4 }}>{triggering ? 'SENDING...' : 'SOS'}</span>
            </Button>

            <p className="body-md" style={{ color: 'var(--outline)', marginTop: 12 }}>
              Tap the red button in an emergency to alert your caretaker immediately.
            </p>
          </div>
        )}

        {/* Live GPS Sharing Control Card */}
        <Card style={{ textAlign: 'left', marginBottom: 16, border: isSharingGps ? '2px solid var(--primary)' : '1px solid var(--outline-variant)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconMap size={24} style={{ color: isSharingGps ? 'var(--primary)' : 'var(--outline)' }} />
              <div>
                <h4 className="headline-sm" style={{ fontSize: 16 }}>Live Location Sharing</h4>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: 12 }}>
                  {isSharingGps ? '● Sharing actively with Caretaker' : 'Disabled (Requires permission)'}
                </p>
              </div>
            </div>

            <Button
              variant={isSharingGps ? 'secondary' : 'primary'}
              onClick={handleToggleGps}
              style={{ padding: '6px 14px', fontSize: 13 }}
            >
              {isSharingGps ? 'Stop Sharing' : 'Start Sharing'}
            </Button>
          </div>

          {gpsError && (
            <p className="body-md" style={{ color: 'var(--error)', fontSize: 12, marginTop: 6 }}>
              ⚠️ {gpsError}
            </p>
          )}

          {isSharingGps && (
            <p className="body-md" style={{ color: 'var(--outline)', fontSize: 11, marginTop: 6 }}>
              Note: Location updates periodically while this browser tab remains active.
            </p>
          )}
        </Card>

        {/* Live Map Preview */}
        <LiveTrackingMap
          latitude={gpsCoords?.latitude}
          longitude={gpsCoords?.longitude}
          accuracy={gpsCoords?.accuracy}
          lastUpdated={gpsCoords?.timestamp}
          title={isSharingGps ? 'Your Live Location (Transmitting)' : 'Last Known Location'}
        />

        <h3 className="label-lg" style={{ marginTop: 24, marginBottom: 12, textAlign: 'left', color: 'var(--outline)' }}>
          DIRECT EMERGENCY CONTACT
        </h3>

        <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ textAlign: 'left' }}>
            <p className="headline-sm" style={{ fontSize: 17 }}>{primaryCaretakerName}</p>
            <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13 }}>
              {caretakers[0]?.relationship || 'Primary Caregiver'} • {primaryPhone}
            </p>
          </div>
          <a
            href={`tel:${primaryPhone.replace(/[^0-9+]/g, '')}`}
            className="icon-btn"
            style={{ backgroundColor: 'var(--mint-soft)', color: 'var(--primary)', textDecoration: 'none' }}
          >
            <IconPhone size={24} />
          </a>
        </Card>
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
