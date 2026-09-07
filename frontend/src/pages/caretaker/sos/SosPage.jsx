import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LiveTrackingMap from '@/pages/patient/sos/components/LiveTrackingMap';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useCaretaker } from '@/context/CaretakerContext';
import { useSos } from '@/hooks/useSos';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { sosAlarm } from '@/utils/sosAlarm';
import { IconSos, IconCheck } from '@/components/icons';

export default function SosPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { activePatient: patient, loadingPatients: loadingPatient } = useCaretaker();

  const [processingId, setProcessingId] = useState(null);
  const [alarmStatus, setAlarmStatus] = useState({ isPlaying: false, isAutoplayBlocked: false });

  const patientId = patient?.patient_id;
  const patientName = patient?.patient?.profiles?.full_name || 'Assigned Patient';

  // Push notifications state on this caregiver device
  const {
    isSupported: pushSupported,
    isSubscribed: pushSubscribed,
    loading: pushLoading,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = usePushNotifications(user?.id);

  const {
    activeAlerts,
    currentActive,
    history,
    isEmergency,
    isAcknowledged,
    loading: loadingAlerts,
    error: sosError,
    acknowledgeSos,
    resolveSos,
  } = useSos(patientId);

  // Subscribe to alarm state changes (e.g. autoplay blocked detection)
  useEffect(() => {
    const unsub = sosAlarm.subscribe((status) => {
      setAlarmStatus(status);
    });
    return () => unsub();
  }, []);

  // Control Audible Alarm: Start on active emergency, stop immediately on acknowledge/resolve/unmount
  useEffect(() => {
    if (isEmergency) {
      sosAlarm.start();
    } else {
      sosAlarm.stop();
    }

    return () => {
      sosAlarm.stop();
    };
  }, [isEmergency]);

  const handleTogglePush = async () => {
    if (pushSubscribed) {
      const res = await unsubscribePush();
      if (res.success) showToast('Push notifications disabled on this device.');
      else showToast('Failed to disable: ' + res.error?.message);
    } else {
      const res = await subscribePush();
      if (res.success) {
        showToast('✓ Real-time SOS Push Notifications enabled on this device!');
      } else {
        showToast('⚠️ Push registration failed: ' + (res.error?.message || 'Check browser permissions'));
      }
    }
  };

  // 4. Handle Caretaker Acknowledgement
  const handleAcknowledge = async (alertId) => {
    setProcessingId(alertId);
    try {
      const { error } = await acknowledgeSos(alertId);
      if (error) {
        showToast('Failed to acknowledge: ' + error.message);
      } else {
        showToast('✓ SOS Acknowledged. Patient has been notified.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  // 5. Handle Caretaker Resolve / Clear
  const handleResolve = async (alertId) => {
    setProcessingId(alertId);
    try {
      const { error } = await resolveSos(alertId);
      if (error) {
        showToast('Failed to resolve: ' + error.message);
      } else {
        showToast('Emergency alert resolved.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleTestAlarm = async () => {
    if (alarmStatus.isPlaying) {
      sosAlarm.stop();
      showToast('🔊 Alarm stopped.');
    } else {
      showToast('🚨 Playing Emergency Alarm Test...');
      await sosAlarm.enableAudioByUser();
    }
  };

  return (
    <AppLayout mode="caretaker">
      <TopBar
        title="Emergency SOS Monitor"
        rightAction={
          <Button
            variant={alarmStatus.isPlaying ? 'danger' : 'outline'}
            onClick={handleTestAlarm}
            style={{ fontSize: '12px', padding: '4px 10px', minHeight: '32px' }}
            title="Test the audible emergency siren on this device"
          >
            {alarmStatus.isPlaying ? '⏹ Stop Alarm' : '🔊 Test Alarm'}
          </Button>
        }
      />

      <div style={{ marginTop: 8 }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient monitor status...</p>
          </Card>
        ) : !patient ? (
          <Card className="empty-state-card" style={{ backgroundColor: '#fff3e0', borderColor: '#ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to monitor emergency distress signals.
            </p>
          </Card>
        ) : (
          <>
            {sosError && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--error-container)',
                  color: 'var(--on-error-container)',
                  fontSize: '14px',
                  marginBottom: 16,
                }}
              >
                {sosError.message || 'Error communicating with SOS service.'}
              </div>
            )}

            {/* Push Notification Setup & Status Card */}
            {pushSupported && (
              <Card
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '14px 18px',
                  marginBottom: 16,
                  backgroundColor: pushSubscribed ? 'var(--mint-soft)' : '#fff8e1',
                  border: `1px solid ${pushSubscribed ? 'var(--primary)' : '#ffe082'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '24px' }}>{pushSubscribed ? '🔔' : '🔕'}</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: pushSubscribed ? 'var(--primary)' : '#e65100' }}>
                      {pushSubscribed
                        ? 'Instant Emergency Push Alerts Active'
                        : 'Enable Instant Push Notifications on this Device'}
                    </h4>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--outline)' }}>
                      {pushSubscribed
                        ? 'This device will receive loud SOS notifications even when this browser tab is closed.'
                        : 'Grant permission to get immediate OS/browser alerts the moment your patient triggers SOS.'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={pushSubscribed ? 'outline' : 'primary'}
                  onClick={handleTogglePush}
                  disabled={pushLoading}
                  style={{ fontSize: '13px', padding: '6px 14px' }}
                >
                  {pushLoading
                    ? 'Updating...'
                    : pushSubscribed
                    ? 'Disable on this Device'
                    : 'Enable Push Alerts'}
                </Button>
              </Card>
            )}

            <div className="grid-responsive-2" style={{ alignItems: 'start' }}>
              {/* Left Column: Live Status Card & History */}
              <div>
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
                    padding: '28px 20px',
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      margin: '0 auto 14px',
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
                      fontSize: '22px',
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
                      fontSize: '15px',
                    }}
                  >
                    {isEmergency
                      ? `Patient ${patientName} triggered an emergency SOS at ${new Date(currentActive.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                      : isAcknowledged
                      ? `You acknowledged this alert at ${new Date(currentActive.acknowledged_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Response in progress.`
                      : `Currently monitoring ${patientName}. No active distress signals.`}
                  </p>

                  {/* Autoplay blocked fallback audio button */}
                  {isEmergency && alarmStatus.isAutoplayBlocked && (
                    <div
                      style={{
                        marginTop: 14,
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#fff',
                        border: '2px solid var(--error)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--error)' }}>
                        🔊 Click to enable emergency alarm
                      </span>
                      <Button
                        variant="danger"
                        onClick={() => sosAlarm.enableAudioByUser()}
                        style={{ fontSize: '12px', padding: '6px 14px' }}
                      >
                        Start Alarm Sound
                      </Button>
                    </div>
                  )}

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
                    <div style={{ marginTop: 18 }}>
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

                {/* Recent SOS History */}
                <h3 className="label-lg" style={{ marginBottom: 12, color: 'var(--outline)', letterSpacing: '0.5px' }}>
                  RECENT EMERGENCY ALERTS HISTORY
                </h3>

                {loadingAlerts ? (
                  <Card style={{ textAlign: 'center', padding: 16 }}>
                    <p className="body-md" style={{ color: 'var(--outline)' }}>Loading alert logs...</p>
                  </Card>
                ) : history.length === 0 ? (
                  <Card style={{ textAlign: 'center', padding: 20 }}>
                    <p className="body-md" style={{ color: 'var(--outline)' }}>No emergency alert history recorded.</p>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {history.map((h) => (
                      <Card key={h.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: 'var(--radius-pill)',
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

                        <span style={{ fontSize: '12px', color: 'var(--outline)', fontWeight: 600 }}>
                          {h.acknowledged_at ? '✓ Acknowledged' : h.status === 'resolved' ? 'Resolved' : 'Broadcasting'}
                        </span>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Live Map Container for Distress Origin */}
              <div>
                <LiveTrackingMap
                  latitude={currentActive?.latitude ? Number(currentActive.latitude) : null}
                  longitude={currentActive?.longitude ? Number(currentActive.longitude) : null}
                  lastUpdated={currentActive?.triggered_at}
                  title={currentActive ? "Distress Signal Location Origin" : "Patient Satellite Radar"}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
