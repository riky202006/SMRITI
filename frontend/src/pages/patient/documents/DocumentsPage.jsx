import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import { useAppData } from '@/hooks/useAppData';
import { IconDocument } from '@/components/icons';

export default function DocumentsPage() {
  const { appData } = useAppData();
  const docs = appData.documents || [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="My Documents" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 16 }}>
          Important medical reports and records stored safely.
        </p>

        {docs.map((doc) => (
          <Card key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ padding: 12, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}>
              <IconDocument size={28} />
            </div>
            <div>
              <h3 className="headline-sm" style={{ fontSize: 18 }}>{doc.name}</h3>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: 14 }}>
                Added on {doc.date}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
