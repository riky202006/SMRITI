import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAssignedPatients } from '@/services/patients';
import { useGallery } from '@/hooks/useGallery';
import { IconPlus } from '@/components/icons';

export default function GalleryPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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

  const {
    images,
    loading: loadingImages,
    error: galleryError,
    deleteImage,
  } = useGallery(patientId);

  // Delete photo
  const handleDelete = async (imageId, storagePath, imageName) => {
    if (!window.confirm(`Delete "${imageName}" from the album?`)) return;

    setDeletingId(imageId);
    try {
      const { error } = await deleteImage(imageId, storagePath);
      if (error) {
        showToast('Failed to delete photo: ' + error.message);
      } else {
        showToast('Photo removed from album.');
      }
    } catch {
      showToast('Error removing photo.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Caretaker Photo Album" />

      <div style={{ marginTop: 8 }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient photo album...</p>
          </Card>
        ) : !patient ? (
          <Card className="empty-state-card" style={{ backgroundColor: '#fff3e0', borderColor: '#ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to manage their family album.
            </p>
          </Card>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <h3 className="label-lg" style={{ color: 'var(--outline)', margin: 0, letterSpacing: '0.5px' }}>
                  ALBUM FOR {patientName.toUpperCase()} ({images.length} PHOTOS)
                </h3>
              </div>

              <Button
                variant="primary"
                onClick={() => navigate('/caretaker/gallery/add')}
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                <IconPlus size={18} /> Add Family Photo
              </Button>
            </div>

            {galleryError && (
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
                {galleryError.message || 'Error loading photos.'}
              </div>
            )}

            {loadingImages ? (
              <Card style={{ textAlign: 'center', padding: 32 }}>
                <div className="spinner" />
                <p className="body-md" style={{ color: 'var(--outline)' }}>Loading cloud photos...</p>
              </Card>
            ) : images.length === 0 ? (
              <Card className="empty-state-card">
                <div style={{ fontSize: 36, marginBottom: 10 }}>🖼️</div>
                <h4 className="headline-sm" style={{ marginBottom: 6 }}>No Photos Uploaded Yet</h4>
                <p className="body-md" style={{ color: 'var(--outline)', maxWidth: 440, margin: '0 auto 16px' }}>
                  Upload family portraits and familiar faces so the patient can practice memory recall games.
                </p>
                <Button variant="primary" onClick={() => navigate('/caretaker/gallery/add')}>
                  Upload First Photo
                </Button>
              </Card>
            ) : (
              <div className="grid-responsive-4">
                {images.map((img) => (
                  <Card key={img.id} style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ width: '100%', height: 160, backgroundColor: 'var(--surface-container-high)', overflow: 'hidden' }}>
                      <img
                        src={img.url}
                        alt={img.file_name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10 }}>
                      <p className="headline-sm" style={{ fontSize: 16, margin: 0, wordBreak: 'break-word' }}>
                        {img.file_name}
                      </p>

                      <button
                        type="button"
                        onClick={() => handleDelete(img.id, img.storage_path, img.file_name)}
                        disabled={deletingId === img.id}
                        className="btn btn-sm btn-danger"
                        style={{ width: '100%' }}
                      >
                        {deletingId === img.id ? 'Deleting...' : 'Delete Photo'}
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
