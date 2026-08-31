import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { IconDocument } from '@/components/icons';

export default function DocsSetupPage() {
  const { appData, setAppData, showToast } = useAppData();
  const [docName, setDocName] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (docName) {
      const newDoc = {
        id: `doc_${Date.now()}`,
        name: docName.endsWith('.pdf') ? docName : `${docName}.pdf`,
        type: 'application/pdf',
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      };
      setAppData((prev) => ({
        ...prev,
        documents: [newDoc, ...(prev.documents || [])],
      }));
      setDocName('');
      showToast('Document uploaded successfully!');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Document Management" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ marginBottom: 20 }}>
          <h3 className="headline-sm" style={{ marginBottom: 16 }}>Upload Patient Medical Report</h3>
          <form onSubmit={handleAdd}>
            <input
              type="text"
              placeholder="Document Title (e.g. MRI Scan 2026.pdf)"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 16 }}
              required
            />
            <Button type="submit" variant="primary">
              Upload Document
            </Button>
          </form>
        </Card>

        <h3 className="label-lg" style={{ marginBottom: 12, color: 'var(--outline)' }}>EXISTING DOCUMENTS</h3>

        {(appData.documents || []).map((doc) => (
          <Card key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ padding: 10, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}>
              <IconDocument size={24} />
            </div>
            <div>
              <p className="headline-sm" style={{ fontSize: 18 }}>{doc.name}</p>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: 14 }}>Uploaded {doc.date}</p>
            </div>
          </Card>
        ))}
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
