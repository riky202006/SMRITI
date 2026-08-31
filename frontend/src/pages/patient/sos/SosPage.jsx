import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LiveTrackingMap from './components/LiveTrackingMap';
import { useAppData } from '@/hooks/useAppData';
import { IconSos, IconPhone } from '@/components/icons';

export default function SosPage() {
  const { appData, triggerSos } = useAppData();
  const contacts = appData.emergencyContacts || [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Emergency SOS" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto', textAlign: 'center' }}>
        <div style={{ margin: '0 auto 24px' }}>
          <Button
            variant="danger"
            onClick={triggerSos}
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              fontSize: 24,
              fontWeight: 800,
              boxShadow: '0 12px 30px rgba(186, 26, 26, 0.4)',
              margin: '0 auto',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconSos size={40} />
              SOS
            </div>
          </Button>
          <p className="body-md" style={{ color: 'var(--outline)', marginTop: 12 }}>
            Tap the red button to alert your caretaker immediately.
          </p>
        </div>

        <LiveTrackingMap />

        <h3 className="label-lg" style={{ marginTop: 24, marginBottom: 12, textAlign: 'left', color: 'var(--outline)' }}>
          EMERGENCY CONTACTS
        </h3>

        {contacts.map((c, i) => (
          <Card key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ textAlign: 'left' }}>
              <p className="headline-sm" style={{ fontSize: 18 }}>{c.name}</p>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: 14 }}>{c.rel} • {c.phone}</p>
            </div>
            <a href={`tel:${c.phone}`} className="icon-btn" style={{ backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}>
              <IconPhone size={24} />
            </a>
          </Card>
        ))}
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
