import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { useCaretaker } from '@/context/CaretakerContext';
import { useGallery } from '@/hooks/useGallery';

export default function AddImagePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { activePatient: patient, loadingPatients: loadingPatient } = useCaretaker();

  const [name, setName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const patientId = patient?.patient_id;
  const patientName = patient?.patient?.profiles?.full_name || 'Assigned Patient';

  const { uploadImage } = useGallery(patientId);

  const handleFileChange = (e) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMsg('Please select a JPG, PNG, or WEBP photo.');
      setSelectedFile(null);
      setPreviewUrl('');
      return;
    }

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
      const { error } = await uploadImage({
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
    <AppLayout mode="caretaker">
      <TopBar title="Add Family Photo" onBack={() => navigate('/caretaker/gallery')} />

      <div style={{ maxWidth: '540px', width: '100%', margin: '8px auto 0' }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient album info...</p>
          </Card>
        ) : !patient ? (
          <Card className="empty-state-card" style={{ backgroundColor: '#fff3e0', borderColor: '#ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to upload family memory photos.
            </p>
          </Card>
        ) : (
          <Card style={{ padding: '28px 24px' }}>
            <h2 className="headline-md" style={{ marginBottom: 4, fontSize: '22px' }}>Upload Photo for {patientName}</h2>
            <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 20, fontSize: '14px' }}>
              Add family members and familiar faces to stimulate memory recall.
            </p>

            {errorMsg && (
              <div
                style={{
                  padding: '12px 14px',
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

            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">
                  Person / Family Member Name
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Granddaughter Ananya"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Select Photo File (JPG, PNG, WEBP max 5MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="form-input"
                  style={{ padding: '8px 12px' }}
                  required
                />
              </div>

              {previewUrl && (
                <div style={{ textAlign: 'center', margin: '4px 0 12px' }}>
                  <p className="label-lg" style={{ color: 'var(--outline)', marginBottom: 6, fontSize: '12px' }}>
                    Photo Preview:
                  </p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxHeight: 200,
                      maxWidth: '100%',
                      borderRadius: 'var(--radius-md)',
                      objectFit: 'cover',
                      border: '2px solid var(--primary)',
                      margin: '0 auto',
                    }}
                  />
                </div>
              )}

              <Button type="submit" variant="primary" disabled={uploading} style={{ width: '100%', marginTop: 4 }}>
                {uploading ? 'Uploading to Supabase Storage...' : 'Save Photo to Cloud Album'}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
