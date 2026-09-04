import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useGallery } from '@/hooks/useGallery';

export default function GalleryPage() {
  const { patientRecord } = useAuth();
  const patientId = patientRecord?.id;

  const { images, loading, error } = useGallery(patientId);

  return (
    <AppLayout mode="patient">
      <TopBar title="Family Photo Album" />

      <div style={{ marginTop: 8 }}>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 20 }}>
          Photos of your loved ones and happy memories uploaded by your caretaker.
        </p>

        {error && (
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
            {error.message || 'Error loading photos.'}
          </div>
        )}

        {loading ? (
          <Card style={{ textAlign: 'center', padding: '36px 20px' }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading your photo album...</p>
          </Card>
        ) : images.length === 0 ? (
          <Card className="empty-state-card">
            <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
            <h3 className="headline-sm" style={{ marginBottom: 6 }}>Photo Album Empty</h3>
            <p className="body-md" style={{ color: 'var(--outline)' }}>
              Your caretaker has not uploaded any family memory photos yet.
            </p>
          </Card>
        ) : (
          <div className="grid-responsive-4">
            {images.map((img) => (
              <Card key={img.id} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '100%', height: '180px', backgroundColor: 'var(--surface-container-high)', overflow: 'hidden' }}>
                  <img
                    src={img.url}
                    alt={img.file_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <p className="headline-sm" style={{ fontSize: 16, wordBreak: 'break-word', margin: 0 }}>
                    {img.file_name}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
