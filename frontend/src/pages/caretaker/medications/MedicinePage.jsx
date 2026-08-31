import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { IconMedication } from '@/components/icons';

export default function MedicinePage() {
  const { appData, addMedication } = useAppData();
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');

  const handleAdd = (e) => {
    e.preventDefault();
    if (name && dosage) {
      addMedication({
        name,
        dosage,
        type: 'Tablet',
        frequency: 1,
        times: [time],
        history: {},
      });
      setName('');
      setDosage('');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Medicine Schedule Setup" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ marginBottom: 20 }}>
          <h3 className="headline-sm" style={{ marginBottom: 16 }}>Add New Prescribed Medicine</h3>
          <form onSubmit={handleAdd}>
            <input
              type="text"
              placeholder="Medicine Name (e.g. Donepezil)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 12 }}
              required
            />
            <input
              type="text"
              placeholder="Dosage (e.g. 5 mg)"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 12 }}
              required
            />
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 16 }}
            />
            <Button type="submit" variant="primary">
              Add Prescription
            </Button>
          </form>
        </Card>

        <h3 className="label-lg" style={{ marginBottom: 12, color: 'var(--outline)' }}>CURRENT REMINDERS</h3>

        {(appData.medicine || []).map((m) => (
          <Card key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p className="headline-sm" style={{ fontSize: 18 }}>{m.name}</p>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: 14 }}>{m.dosage} • {(m.times || []).join(', ')}</p>
            </div>
            <div style={{ color: 'var(--primary)' }}>
              <IconMedication size={24} />
            </div>
          </Card>
        ))}
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
