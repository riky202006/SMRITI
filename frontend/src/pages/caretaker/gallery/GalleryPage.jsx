import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { IconPlus } from '@/components/icons';

export default function GalleryPage() {
  const navigate = useNavigate();
  const { appData } = useAppData();
  const images = appData.images || [];
  

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Caretaker Photo Album" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <div style={{ marginBottom: 16 }}>
          <Button variant="primary" onClick={() => navigate('/caretaker/gallery/add')}>
            <IconPlus size={24} /> Add New Family Photo
          </Button>
        </div>

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

      <BottomNav mode="caretaker" />
    </div>
  );
}
