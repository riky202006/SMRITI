import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import { useAppData } from '@/hooks/useAppData';

export default function GalleryPage() {
  const { appData } = useAppData();
  const images = appData.images || [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Family Photo Album" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 16 }}>
          Photos of your loved ones and happy memories.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {images.map((img) => (
            <Card key={img.id} style={{ padding: 0, overflow: 'hidden' }}>
              <img
                src={img.dataUrl}
                alt={img.name}
                style={{ width: '100%', height: 140, objectFit: 'cover' }}
              />
              <div style={{ padding: 12, textAlign: 'center' }}>
                <p className="headline-sm" style={{ fontSize: 18 }}>{img.name}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
