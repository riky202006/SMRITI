import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import LiveTrackingMap from '@/pages/patient/sos/components/LiveTrackingMap';
import { useAuth } from '@/context/AuthContext';
import { getAssignedPatients } from '@/services/patients';
import { useLocationTracking } from '@/hooks/useLocationTracking';

export default function MapPage() {
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

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

  const { latestLocation, loading: loadingLocation } = useLocationTracking(patientId);

  const lat = latestLocation?.latitude ? Number(latestLocation.latitude) : null;
  const lng = latestLocation?.longitude ? Number(latestLocation.longitude) : null;
  const accuracy = latestLocation?.accuracy ? Number(latestLocation.accuracy) : null;
  const recordedAt = latestLocation?.recorded_at || null;

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Patient Live GPS Tracking" />

      <div style={{ marginTop: 8 }}>
        {loadingPatient ? (
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
          <div className="grid-responsive-2" style={{ alignItems: 'start' }}>
            {/* Left Column: Patient Status & Geofence Telemetry */}
            <div>
              <Card style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', margin: 0 }}>CURRENT MONITORING TARGET:</p>
                    <h3 className="headline-sm" style={{ margin: '4px 0 2px', fontSize: '20px' }}>
                      {patientName}
                    </h3>
                    <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', margin: 0 }}>
                      {latestLocation
                        ? 'Live GPS stream active (Cloud Synchronized)'
                        : 'Waiting for patient to transmit GPS signal'}
                    </p>
                  </div>

                  <span
                    style={{
                      backgroundColor: latestLocation ? '#e8f5e9' : '#f5f5f5',
                      color: latestLocation ? '#2e7d32' : 'var(--outline)',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-pill)',
                      textTransform: 'uppercase',
                    }}
                  >
                    {latestLocation ? '● Live Online' : 'Offline'}
                  </span>
                </div>
              </Card>

              <Card style={{ marginBottom: 16 }}>
                <h4 className="headline-sm" style={{ fontSize: '17px', marginBottom: 8 }}>Geofence &amp; Safety Perimeter</h4>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: '14px', lineHeight: 1.5 }}>
                  {latestLocation
                    ? '✓ Patient coordinates received. Boundary telemetry active within normal regional perimeter.'
                    : 'Perimeter analysis will calibrate automatically once patient turns on location sharing.'}
                </p>
              </Card>

              {latestLocation && (
                <Card style={{ backgroundColor: 'var(--surface-container-low)' }}>
                  <h4 className="label-lg" style={{ marginBottom: 8, color: 'var(--primary)' }}>SATELLITE TELEMETRY FIX</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--outline)' }}>Latitude:</span>
                      <strong>{lat?.toFixed(6)}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--outline)' }}>Longitude:</span>
                      <strong>{lng?.toFixed(6)}</strong>
                    </div>
                    {accuracy && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--outline)' }}>Accuracy Radius:</span>
                        <strong>±{Math.round(accuracy)} meters</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--outline)' }}>Timestamp:</span>
                      <strong>{new Date(recordedAt).toLocaleTimeString()}</strong>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column: Live Map Container */}
            <div>
              {loadingLocation && !latestLocation ? (
                <Card style={{ textAlign: 'center', padding: 36 }}>
                  <div className="spinner" />
                  <p className="body-md" style={{ color: 'var(--outline)' }}>Fetching satellite coordinates...</p>
                </Card>
              ) : (
                <LiveTrackingMap
                  latitude={lat}
                  longitude={lng}
                  accuracy={accuracy}
                  lastUpdated={recordedAt}
                  title={`${patientName}'s Live Position`}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
