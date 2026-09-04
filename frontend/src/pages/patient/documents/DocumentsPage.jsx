import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import { IconDocument } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from '@/context/ToastContext';

export default function DocumentsPage() {
  const { patientRecord } = useAuth();
  const { showToast } = useToast();

  const patientId = patientRecord?.id;

  const {
    documents,
    loading,
    error,
    getDownloadUrl,
  } = useDocuments(patientId);

  const handleOpenDoc = async (storagePath, fileName) => {
    try {
      // getDocumentDownloadUrl() returns:
      // { url, error }
      const { url, error: err } = await getDownloadUrl(storagePath);

      if (err || !url) {
        console.error('Document download error:', err);
        showToast('Unable to generate secure download link.');
        return;
      }

      // Open the signed URL
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Error opening document:', err);
      showToast('Error opening document.');
    }
  };

  return (
    <AppLayout mode="patient">
      <TopBar title="My Medical Documents" />

      <div style={{ marginTop: 8 }}>
        <p
          className="body-md"
          style={{
            color: 'var(--outline)',
            marginBottom: 20,
          }}
        >
          Important prescriptions, lab reports, and medical records stored
          safely in your cloud vault.
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
            {error.message || 'Error loading documents.'}
          </div>
        )}

        {loading ? (
          <Card
            style={{
              textAlign: 'center',
              padding: '36px 20px',
            }}
          >
            <div className="spinner" />

            <p
              className="body-md"
              style={{
                color: 'var(--outline)',
              }}
            >
              Loading your medical records...
            </p>
          </Card>
        ) : documents.length === 0 ? (
          <Card className="empty-state-card">
            <div
              style={{
                fontSize: 36,
                marginBottom: 10,
              }}
            >
              📄
            </div>

            <h3
              className="headline-sm"
              style={{
                marginBottom: 6,
              }}
            >
              No Documents Uploaded
            </h3>

            <p
              className="body-md"
              style={{
                color: 'var(--outline)',
              }}
            >
              Your caretaker has not uploaded any medical documents or lab
              reports yet.
            </p>
          </Card>
        ) : (
          <div className="grid-responsive-2">
            {documents.map((doc) => (
              <Card
                key={doc.id}
                onClick={() =>
                  handleOpenDoc(
                    doc.storage_path,
                    doc.file_name
                  )
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  padding: '20px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{
                    padding: 14,
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'var(--mint-soft)',
                    color: 'var(--primary)',
                    flexShrink: 0,
                  }}
                >
                  <IconDocument size={28} />
                </div>

                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <h3
                    className="headline-sm"
                    style={{
                      fontSize: 17,
                      marginBottom: 4,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {doc.file_name}
                  </h3>

                  <p
                    className="body-md"
                    style={{
                      color: 'var(--outline)',
                      fontSize: 13,
                    }}
                  >
                    Uploaded on{' '}
                    {new Date(doc.created_at).toLocaleDateString()} • Tap to
                    View
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