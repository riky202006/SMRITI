import { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { getPatientByProfileId } from '@/services/patients';
import { getGalleryImages, subscribeToGalleryImages } from '@/services/gallery';

export default function GalleryPage() {
  const { user, patientRecord } = useAuth();

  const [patientId, setPatientId] = useState(patientRecord?.id || null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Resolve patient ID
  useEffect(() => {
    if (patientRecord?.id) {
      setPatientId(patientRecord.id);
    } else if (user?.id) {
      getPatientByProfileId(user.id).then(({ data }) => {
        if (data?.id) setPatientId(data.id);
      });
    }
  }, [patientRecord?.id, user?.id]);

  // 2. Fetch gallery images
  const loadImages = useCallback(() => {
    if (!patientId) return;
    setLoading(true);
    setErrorMsg('');

    getGalleryImages(patientId)
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg('Could not load family photos from cloud.');
        } else {
          setImages(data || []);
        }
      })
      .catch(() => {
        setErrorMsg('Network error connecting to photo album.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [patientId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  // 3. Realtime subscription
  useEffect(() => {
    if (!patientId) return undefined;

    const sub = subscribeToGalleryImages(patientId, () => {
      loadImages();
    });

    return () => {
      sub.unsubscribe();
    };
  }, [patientId, loadImages]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Family Photo Album" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 16 }}>
          Photos of your loved ones and happy memories uploaded by your caretaker.
        </p>

        {errorMsg && (
          <div
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--error-container)',
              color: 'var(--on-error-container)',
              fontSize: '13px',
              marginBottom: 16,
            }}
          >
            {errorMsg}
          </div>
        )}

        {loading ? (
          <Card style={{ textAlign: 'center', padding: 28 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading your photo album...</p>
          </Card>
        ) : images.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 32 }}>
            <h3 className="headline-sm" style={{ marginBottom: 6 }}>Photo Album Empty</h3>
            <p className="body-md" style={{ color: 'var(--outline)', fontSize: '14px' }}>
              Your caretaker has not uploaded any memory photos yet.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {images.map((img) => (
              <Card key={img.id} style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ width: '100%', height: 140, backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
                  <img
                    src={img.url}
                    alt={img.file_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500';
                    }}
                  />
                </div>
                <div style={{ padding: 12, textAlign: 'center' }}>
                  <p className="headline-sm" style={{ fontSize: 16, wordBreak: 'break-word' }}>
                    {img.file_name}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
