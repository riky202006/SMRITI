import { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LiveTrackingMap from '@/pages/patient/sos/components/LiveTrackingMap';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { getAssignedPatients } from '@/services/patients';
import {
  getActiveSosAlerts,
  getSosHistory,
  acknowledgeSosAlert,
  resolveSosAlert,
  subscribeToSosAlerts,
} from '@/services/sos';
import { IconSos, IconCheck } from '@/components/icons';

export default function SosPage() {
  const { showToast } = useAppData();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // 1. Fetch assigned patient
  useEffect(() => {
    if (user?.id) {
      setLoadingPatient(true);
      getAssignedPatients(user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setPatient(data[0]);
          } else {
            setPatient(null);
          }
        })
        .finally(() => {
          setLoadingPatient(false);
        });
    }
  }, [user?.id]);

  const patientId = patient?.patient_id;
  const patientName = patient?.patient?.profiles?.full_name || 'Assigned Patient';

  // 2. Load active & historical SOS alerts
  const loadAlerts = useCallback(() => {
    if (!patientId) return;
    setLoadingAlerts(true);

    Promise.all([
      getActiveSosAlerts(patientId),
      getSosHistory(patientId, 5),
    ])
      .then(([activeRes, histRes]) => {
        setActiveAlerts(activeRes.data || []);
        setHistoryAlerts(histRes.data || []);
      })
      .finally(() => {
        setLoadingAlerts(false);
      });
  }, [patientId]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // 3. Realtime subscription to live SOS broadcasts
  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToSosAlerts(patientId, (payload) => {
      if (payload.new?.status === 'active') {
        showToast(`🚨 URGENT: Emergency SOS received from ${patientName}!`);
      }
      loadAlerts();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId, patientName, showToast, loadAlerts]);

  // 4. Handle Caretaker Acknowledgement
  const handleAcknowledge = async (alertId) => {
    setProcessingId(alertId);
    try {
      const { error } = await acknowledgeSosAlert(alertId);
      if (error) {
        showToast('Failed to acknowledge: ' + error.message);
      } else {
        showToast('✓ SOS Acknowledged. Patient has been notified.');
        loadAlerts();
      }
    } catch {
      showToast('Error acknowledging alert.');
    } finally {
      setProcessingId(null);
    }
  };

  // 5. Handle Caretaker Resolve / Clear
  const handleResolve = async (alertId) => {
    setProcessingId(alertId);
    try {
      const { error } = await resolveSosAlert(alertId);
      if (error) {
        showToast('Failed to resolve: ' + error.message);
      } else {
        showToast('Emergency alert resolved.');
        loadAlerts();
      }
    } catch {
      showToast('Error resolving alert.');
    } finally {
      setProcessingId(null);
    }
  };

  const currentActive = activeAlerts[0];
  const isEmergency = currentActive?.status === 'active';
  const isAcknowledged = currentActive?.status === 'acknowledged';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Emergency SOS Monitor" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient monitor status...</p>
          </Card>
        ) : !patient ? (
          <Card style={{ textAlign: 'center', padding: 24, backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to monitor emergency distress signals.
            </p>
          </Card>
        ) : (
          <>
            {/* Live Status Hero Card */}
            <Card
              style={{
                backgroundColor: isEmergency
                  ? 'var(--error-container)'
                  : isAcknowledged
                  ? '#fff8e1'
                  : 'var(--mint-soft)',
                border: `2px solid ${
                  isEmergency ? 'var(--error)' : isAcknowledged ? '#f57c00' : 'var(--primary)'
                }`,
                textAlign: 'center',
                padding: 24,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  margin: '0 auto 12px',
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: isEmergency
                    ? 'var(--error)'
                    : isAcknowledged
                    ? '#f57c00'
                    : 'var(--primary)',
                  color: 'var(--white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isAcknowledged ? <IconCheck size={36} /> : <IconSos size={36} />}
              </div>

              <h2
                className="headline-md"
                style={{
                  color: isEmergency
                    ? 'var(--on-error-container)'
                    : isAcknowledged
                    ? '#e65100'
                    : 'var(--primary)',
                }}
              >
                {isEmergency
                  ? 'EMERGENCY DISTRESS TRIGGERED!'
                  : isAcknowledged
                  ? 'DISTRESS SIGNAL ACKNOWLEDGED'
                  : 'Status: Normal & Safe'}
              </h2>

              <p
                className="body-md"
                style={{
                  color: isEmergency
                    ? 'var(--on-error-container)'
                    : isAcknowledged
                    ? '#e65100'
                    : 'var(--outline)',
                  marginTop: 8,
                  fontSize: '14px',
                }}
              >
                {isEmergency
                  ? `Patient ${patientName} triggered an emergency SOS at ${new Date(currentActive.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                  : isAcknowledged
                  ? `You acknowledged this alert at ${new Date(currentActive.acknowledged_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Response in progress.`
                  : `Currently monitoring ${patientName}. No active distress signals.`}
              </p>

              {/* Actions */}
              {isEmergency && (
                <div style={{ marginTop: 20 }}>
                  <Button
                    variant="danger"
                    onClick={() => handleAcknowledge(currentActive.id)}
                    disabled={processingId === currentActive.id}
                    style={{ width: '100%' }}
                  >
                    {processingId === currentActive.id ? 'Acknowledging...' : 'Acknowledge Distress Signal'}
                  </Button>
                </div>
              )}

              {isAcknowledged && (
                <div style={{ marginTop: 16 }}>
                  <Button
                    variant="primary"
                    onClick={() => handleResolve(currentActive.id)}
                    disabled={processingId === currentActive.id}
                    style={{ width: '100%' }}
                  >
                    {processingId === currentActive.id ? 'Clearing...' : 'Mark Emergency as Resolved / Safe'}
                  </Button>
                </div>
              )}
            </Card>

            {/* If active alert contains coordinates, render live location map */}
            {currentActive && (
              <div style={{ marginBottom: 20 }}>
                <LiveTrackingMap
                  latitude={currentActive.latitude ? Number(currentActive.latitude) : null}
                  longitude={currentActive.longitude ? Number(currentActive.longitude) : null}
                  lastUpdated={currentActive.triggered_at}
                  title="Distress Signal Origin"
                />
              </div>
            )}

            {/* Recent SOS History */}
            <h3 className="label-lg" style={{ marginBottom: 12, color: 'var(--outline)' }}>
              RECENT EMERGENCY ALERTS HISTORY
            </h3>

            {loadingAlerts ? (
              <Card style={{ textAlign: 'center', padding: 16 }}>
                <p className="body-md" style={{ color: 'var(--outline)' }}>Loading alert logs...</p>
              </Card>
            ) : historyAlerts.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 20 }}>
                <p className="body-md" style={{ color: 'var(--outline)' }}>No emergency alert history recorded.</p>
              </Card>
            ) : (
              historyAlerts.map((h) => (
                <Card key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: 14 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: h.status === 'active' ? '#ffebee' : h.status === 'acknowledged' ? '#fff8e1' : '#e8f5e9',
                          color: h.status === 'active' ? '#c62828' : h.status === 'acknowledged' ? '#e65100' : '#2e7d32',
                          textTransform: 'uppercase',
                        }}
                      >
                        {h.status}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--outline)' }}>
                        {new Date(h.triggered_at).toLocaleDateString()} at {new Date(h.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '12px', color: 'var(--outline)' }}>
                    {h.acknowledged_at ? '✓ Acknowledged' : h.status === 'resolved' ? 'Resolved' : 'Broadcasting'}
                  </span>
                </Card>
              ))
            )}
          </>
        )}
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
