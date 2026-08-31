import { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import LiveTrackingMap from '@/pages/patient/sos/components/LiveTrackingMap';
import { useAuth } from '@/context/AuthContext';
import { getAssignedPatients } from '@/services/patients';
import { getLatestLocation, subscribeToPatientLocation } from '@/services/location';

export default function MapPage() {
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [locationRecord, setLocationRecord] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // 1. Fetch assigned patient for current caretaker
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

  // 2. Fetch latest location record whenever patientId is resolved
  const loadLocation = useCallback((idToLoad) => {
    const targetId = idToLoad || patientId;
    if (!targetId) return;

    setLoadingLocation(true);
    getLatestLocation(targetId)
      .then(({ data }) => {
        if (data) {
          setLocationRecord(data);
        } else {
          setLocationRecord(null);
        }
      })
      .finally(() => {
        setLoadingLocation(false);
      });
  }, [patientId]);

  // Trigger initial query as soon as patientId becomes available
  useEffect(() => {
    if (patientId) {
      loadLocation(patientId);
    }
  }, [patientId, loadLocation]);

  // 3. Start Realtime subscription only after patientId is ready and clean up correctly
  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToPatientLocation(patientId, (newLoc) => {
      if (newLoc && newLoc.latitude != null && newLoc.longitude != null) {
        setLocationRecord(newLoc);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId]);

  const lat = locationRecord?.latitude ? Number(locationRecord.latitude) : null;
  const lng = locationRecord?.longitude ? Number(locationRecord.longitude) : null;
  const accuracy = locationRecord?.accuracy ? Number(locationRecord.accuracy) : null;
  const recordedAt = locationRecord?.recorded_at || null;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Patient Live Tracking" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient details...</p>
          </Card>
        ) : !patient ? (
          <Card style={{ textAlign: 'center', padding: 24, backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to access live GPS tracking.
            </p>
          </Card>
        ) : (
          <>
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 className="headline-sm" style={{ marginBottom: 2 }}>
                    Tracking: {patientName}
                  </h3>
                  <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px' }}>
                    {locationRecord
                      ? 'Live GPS stream active (Cloud Synchronized)'
                      : 'Waiting for patient to enable location sharing'}
                  </p>
                </div>

                <span
                  style={{
                    backgroundColor: locationRecord ? '#e8f5e9' : '#f5f5f5',
                    color: locationRecord ? '#2e7d32' : 'var(--outline)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    textTransform: 'uppercase',
                  }}
                >
                  {locationRecord ? '● Online' : 'Offline'}
                </span>
              </div>
            </Card>

            {loadingLocation && !locationRecord ? (
              <Card style={{ textAlign: 'center', padding: 24 }}>
                <p className="body-md" style={{ color: 'var(--outline)' }}>Fetching latest satellite fix...</p>
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

            <Card style={{ marginTop: 16 }}>
              <h4 className="label-lg" style={{ marginBottom: 6 }}>Safe Zone Status</h4>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px' }}>
                {locationRecord
                  ? '✓ Patient telemetry received. Safe zone boundary monitoring active.'
                  : 'Safe zone analysis will activate once patient transmits their first GPS position.'}
              </p>
            </Card>
          </>
        )}
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
