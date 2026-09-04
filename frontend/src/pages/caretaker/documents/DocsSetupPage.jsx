import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAssignedPatients } from '@/services/patients';
import { useDocuments } from '@/hooks/useDocuments';
import { IconDocument } from '@/components/icons';

export default function DocsSetupPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [docTitle, setDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
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
    documents,
    loading: loadingDocs,
    error: docsError,
    uploadDocument,
    deleteDocument,
    getDownloadUrl,
  } = useDocuments(patientId);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !patientId) return;

    setUploading(true);
    try {
      const fileName = docTitle.trim() || selectedFile.name;
      const { error } = await uploadDocument({
        file: selectedFile,
        fileName,
        mimeType: selectedFile.type || 'application/pdf',
      });

      if (error) {
        showToast('Upload failed: ' + error.message);
      } else {
        showToast('Medical document saved to secure cloud!');
        setDocTitle('');
        setSelectedFile(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDoc = async (storagePath) => {
    try {
      const { data, error } = await getDownloadUrl(storagePath);
      if (error || !data?.signedUrl) {
        showToast('Could not generate download URL');
      } else {
        window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      showToast('Error opening document.');
    }
  };

  const handleDeleteDoc = async (docId, storagePath, fileName) => {
    if (!window.confirm(`Delete document "${fileName}" from patient records?`)) return;

    setDeletingId(docId);
    try {
      const { error } = await deleteDocument(docId, storagePath);
      if (error) {
        showToast('Failed to delete: ' + error.message);
      } else {
        showToast('Document removed.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Medical Records & Documents" />

      <div style={{ marginTop: 8 }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient document records...</p>
          </Card>
        ) : !patient ? (
          <Card className="empty-state-card" style={{ backgroundColor: '#fff3e0', borderColor: '#ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>No Patient Connected</h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to manage their medical reports.
            </p>
          </Card>
        ) : (
          <>
            {/* Active Patient Card */}
            <Card style={{ marginBottom: 20, backgroundColor: 'var(--mint-soft)', border: '1.5px solid var(--primary)', padding: '16px 20px' }}>
              <p className="body-md" style={{ color: 'var(--primary)', fontSize: '13px', margin: 0, fontWeight: 600 }}>MEDICAL VAULT FOR:</p>
              <h2 className="headline-sm" style={{ marginTop: 2, fontSize: '20px' }}>
                {patientName}
              </h2>
            </Card>

            {docsError && (
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
                {docsError.message || 'Error communicating with Supabase.'}
              </div>
            )}

            {/* Responsive 2-Column Grid */}
            <div className="grid-responsive-2" style={{ alignItems: 'start' }}>
              {/* Left Column: Upload Document Form */}
              <div>
                <Card style={{ padding: '24px' }}>
                  <h3 className="headline-sm" style={{ marginBottom: 16, fontSize: '18px' }}>Upload Medical Report / PDF</h3>
                  <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Document Title</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Brain MRI Evaluation 2026"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Select File (PDF, Images, Docs max 10MB)</label>
                      <input
                        type="file"
                        className="form-input"
                        onChange={handleFileChange}
                        style={{ padding: '8px 12px' }}
                        required
                      />
                    </div>

                    <Button type="submit" variant="primary" disabled={uploading} style={{ width: '100%', marginTop: 6 }}>
                      {uploading ? 'Uploading to Supabase Storage...' : '+ Upload Document to Cloud Vault'}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Right Column: Uploaded Documents List */}
              <div>
                <h3 className="label-lg" style={{ marginBottom: 14, color: 'var(--outline)', letterSpacing: '0.5px' }}>
                  STORED MEDICAL RECORDS ({documents.length})
                </h3>

                {loadingDocs ? (
                  <Card style={{ textAlign: 'center', padding: 24 }}>
                    <div className="spinner" />
                    <p className="body-md" style={{ color: 'var(--outline)' }}>Loading documents from cloud...</p>
                  </Card>
                ) : documents.length === 0 ? (
                  <Card className="empty-state-card">
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                    <h4 style={{ fontSize: 17, fontWeight: 700 }}>No Documents in Vault</h4>
                    <p>Upload lab results, doctor prescriptions, and medical reports for easy reference.</p>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {documents.map((doc) => (
                      <Card key={doc.id} style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                            <div style={{ padding: 10, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)', flexShrink: 0 }}>
                              <IconDocument size={24} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p className="headline-sm" style={{ fontSize: 16, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {doc.file_name}
                              </p>
                              <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, margin: '2px 0 0' }}>
                                Uploaded {new Date(doc.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => handleOpenDoc(doc.storage_path)}
                              className="btn btn-sm btn-outline"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDoc(doc.id, doc.storage_path, doc.file_name)}
                              disabled={deletingId === doc.id}
                              className="btn btn-sm btn-danger"
                            >
                              {deletingId === doc.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
