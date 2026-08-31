import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';

export default function PatientProfilePage() {
  const { appData, setAppData, showToast } = useAppData();
  const [name, setName] = useState(appData.patientName || '');
  const [phone, setPhone] = useState(appData.patientPhone || '');
  const [address, setAddress] = useState(appData.patientAddress || '');

  const handleSave = (e) => {
    e.preventDefault();
    setAppData((prev) => ({
      ...prev,
      patientName: name,
      patientPhone: phone,
      patientAddress: address,
    }));
    showToast('Patient profile updated!');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Patient Profile Setup" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card>
          <form onSubmit={handleSave}>
            <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Full Name</label>
            <input
              type="text"
              className="body-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 16 }}
            />

            <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Emergency Phone</label>
            <input
              type="text"
              className="body-md"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 16 }}
            />

            <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>Home Address</label>
            <textarea
              className="body-md"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 24 }}
            />

            <Button type="submit" variant="primary">
              Save Profile
            </Button>
          </form>
        </Card>
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
