import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { getAssignedPatients } from '@/services/patients';
import { uploadGalleryImage } from '@/services/gallery';

export default function AddImagePage() {
  const navigate = useNavigate();
  const { showToast } = useAppData();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please select a JPG, PNG, or WEBP photo.');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Photo must be smaller than 5MB.');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!patientId) {
      setErrorMsg('No assigned patient found. Please connect a patient first.');
      return;
    }

    if (!selectedFile) {
      setErrorMsg('Please select a photo from your device.');
      return;
    }

    setUploading(true);

    try {
      const { error } = await uploadGalleryImage({
        patientId,
        file: selectedFile,
        title: name.trim() || selectedFile.name,
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to upload photo to cloud storage.');
        showToast('Upload failed: ' + error.message);
        return;
      }

      showToast('Memory photo saved to cloud album!');
      navigate('/caretaker/gallery');
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Add Family Photo" onBack={() => navigate('/caretaker/gallery')} />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient album info...</p>
          </Card>
        ) : !patient ? (
          <Card style={{ textAlign: 'center', padding: 24, backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to upload family memory photos.
            </p>
          </Card>
        ) : (
          <Card>
            <h2 className="headline-md" style={{ marginBottom: 4 }}>Upload Photo for {patientName}</h2>
            <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 16, fontSize: '13px' }}>
              Add family members and familiar faces to stimulate memory recall.
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
                  lineHeight: 1.4,
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: 16 }}>
                <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>
                  Person / Relationship Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Granddaughter Ananya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--outline)',
                    fontSize: '14px',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>
                  Select Photo (JPG, PNG, WEBP max 5MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  style={{
                    width: '100%',
                    padding: '10px 0',
                    fontSize: '14px',
                  }}
                  required
                />
              </div>

              {previewUrl && (
                <div style={{ marginBottom: 20, textAlign: 'center' }}>
                  <p className="label-lg" style={{ color: 'var(--outline)', marginBottom: 6, fontSize: '12px' }}>
                    Photo Preview:
                  </p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxHeight: 180,
                      maxWidth: '100%',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      border: '1.5px solid var(--primary)',
                    }}
                  />
                </div>
              )}

              <Button type="submit" variant="primary" disabled={uploading} style={{ width: '100%' }}>
                {uploading ? 'Uploading to Supabase Storage...' : 'Save Photo to Cloud Album'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
