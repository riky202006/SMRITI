import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { IconSos } from '@/components/icons';

export default function SosPage() {
  const { appData, setAppData, showToast } = useAppData();
  const isSosActive = appData.sosActive || false;

  const handleClearSos = () => {
    setAppData((prev) => ({
      ...prev,
      sosActive: false,
    }));
    showToast('Emergency SOS alert acknowledged and cleared.');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Caretaker SOS Monitor" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ backgroundColor: isSosActive ? 'var(--error-container)' : 'var(--mint-soft)', textAlign: 'center', padding: 24, marginBottom: 20 }}>
          <div style={{ margin: '0 auto 12px', width: 64, height: 64, borderRadius: '50%', backgroundColor: isSosActive ? 'var(--error)' : 'var(--primary)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconSos size={36} />
          </div>
          <h2 className="headline-md" style={{ color: isSosActive ? 'var(--on-error-container)' : 'var(--primary)' }}>
            {isSosActive ? 'EMERGENCY ALERT TRIGGERED!' : 'Status: Normal & Safe'}
          </h2>
          <p className="body-md" style={{ color: isSosActive ? 'var(--on-error-container)' : 'var(--outline)', marginTop: 8 }}>
            {isSosActive
              ? `Patient ${appData.patientName || 'Ravi'} triggered SOS at ${appData.sosTimestamp || 'recently'}`
              : 'No active emergency distress signals at this moment.'}
          </p>

          {isSosActive && (
            <div style={{ marginTop: 20 }}>
              <Button variant="danger" onClick={handleClearSos}>
                Acknowledge & Dismiss Alert
              </Button>
            </div>
          )}
        </Card>
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
