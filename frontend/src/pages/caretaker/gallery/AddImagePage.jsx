import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';

export default function AddImagePage() {
  const navigate = useNavigate();
  const { addGalleryImage } = useAppData();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleUpload = (e) => {
    e.preventDefault();
    const finalUrl = url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500';
    if (name) {
      addGalleryImage({
        name,
        dataUrl: finalUrl,
      });
      navigate('/caretaker/gallery');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Add Family Photo" />

      <div style={{ flex: 1, padding: 'var(--gutter)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Card>
          <h2 className="headline-md" style={{ marginBottom: 16 }}>Upload Photo for Games</h2>
          <form onSubmit={handleUpload}>
            <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Person's Name</label>
            <input
              type="text"
              placeholder="e.g. Granddaughter Ananya"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 16 }}
              required
            />

            <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 24 }}
            />

            <Button type="submit" variant="primary">
              Save Photo to Album
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
