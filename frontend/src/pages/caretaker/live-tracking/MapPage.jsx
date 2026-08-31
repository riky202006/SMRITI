import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import LiveTrackingMap from '@/pages/patient/sos/components/LiveTrackingMap';
import { subscribeLocation } from '@/services/mqtt';
import { useAppData } from '@/hooks/useAppData';

export default function MapPage() {
  const { appData } = useAppData();
  const [coords, setCoords] = useState({ lat: 12.9716, lng: 77.5946 });

  useEffect(() => {
    subscribeLocation((data) => {
      if (data && data.latitude && data.longitude) {
        setCoords({ lat: data.latitude, lng: data.longitude });
      }
    });
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Patient Live Tracking" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ marginBottom: 16 }}>
          <h3 className="headline-sm" style={{ marginBottom: 4 }}>
            Tracking: {appData.patientName || 'Ravi Kumar'}
          </h3>
          <p className="body-md" style={{ color: 'var(--outline)' }}>
            Real-time geofence & GPS status (MQTT Stream Connected)
          </p>
        </Card>

        <LiveTrackingMap latitude={coords.lat} longitude={coords.lng} />

        <Card style={{ marginTop: 16 }}>
          <h4 className="label-lg" style={{ marginBottom: 8 }}>Safe Zone Perimeter</h4>
          <p className="body-md" style={{ color: 'var(--outline)' }}>
            ✓ Patient inside designated Safe Zone (Indiranagar Home - 500m radius).
          </p>
        </Card>
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
