import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { getAssignedPatients } from '@/services/patients';
import { getGalleryImages, deleteGalleryImage, subscribeToGalleryImages } from '@/services/gallery';
import { IconPlus } from '@/components/icons';

export default function GalleryPage() {
  const navigate = useNavigate();
  const { showToast } = useAppData();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

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

  // 2. Fetch gallery images
  const loadImages = useCallback(() => {
    if (!patientId) return;
    setLoadingImages(true);
    setErrorMsg('');

    getGalleryImages(patientId)
      .then(({ data, error }) => {
        if (error) {
          setErrorMsg(error.message || 'Could not load gallery photos.');
        } else {
          setImages(data || []);
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Network error.');
      })
      .finally(() => {
        setLoadingImages(false);
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

  // 4. Delete photo
  const handleDelete = async (imageId, storagePath, imageName) => {
    if (!window.confirm(`Delete "${imageName}" from the album?`)) return;

    setDeletingId(imageId);
    try {
      const { error } = await deleteGalleryImage(imageId, storagePath);
      if (error) {
        showToast('Failed to delete photo: ' + error.message);
      } else {
        showToast('Photo removed from album.');
        loadImages();
      }
    } catch {
      showToast('Error removing photo.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Caretaker Photo Album" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient photo album...</p>
          </Card>
        ) : !patient ? (
          <Card style={{ textAlign: 'center', padding: 24, backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to manage their family album.
            </p>
          </Card>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button
                variant="primary"
                onClick={() => navigate('/caretaker/gallery/add')}
                style={{ width: '100%' }}
              >
                <IconPlus size={20} /> Add Family Memory Photo
              </Button>
            </div>

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

            <h3 className="label-lg" style={{ marginBottom: 12, color: 'var(--outline)' }}>
              MEMORY PHOTOS FOR {patientName.toUpperCase()} ({images.length})
            </h3>

            {loadingImages ? (
              <Card style={{ textAlign: 'center', padding: 24 }}>
                <p className="body-md" style={{ color: 'var(--outline)' }}>Loading cloud photos...</p>
              </Card>
            ) : images.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 28 }}>
                <h4 className="headline-sm" style={{ marginBottom: 6 }}>No Photos Uploaded Yet</h4>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: '14px' }}>
                  Tap the button above to upload family portraits and familiar faces for cognitive stimulation.
                </p>
              </Card>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {images.map((img) => (
                  <Card key={img.id} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
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

                    <div style={{ padding: '10px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <p className="headline-sm" style={{ fontSize: 15, marginBottom: 8, wordBreak: 'break-word' }}>
                        {img.file_name}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleDelete(img.id, img.storage_path, img.file_name)}
                        disabled={deletingId === img.id}
                        style={{
                          background: 'none',
                          border: '1px solid var(--error)',
                          color: 'var(--error)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '4px 8px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          width: '100%',
                        }}
                      >
                        {deletingId === img.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
