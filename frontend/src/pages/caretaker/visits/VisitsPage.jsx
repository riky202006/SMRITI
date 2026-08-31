import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { IconCalendar } from '@/components/icons';

export default function VisitsPage() {
  const { appData, addVisit } = useAppData();
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (name && purpose) {
      addVisit({
        name,
        purpose,
        date: date || '2026-09-10',
        time: '10:00 AM',
        kind: 'doctor',
      });
      setName('');
      setPurpose('');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Doctor & Visitors" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <Card style={{ marginBottom: 20 }}>
          <h3 className="headline-sm" style={{ marginBottom: 16 }}>Schedule New Appointment</h3>
          <form onSubmit={handleAdd}>
            <input
              type="text"
              placeholder="Doctor / Visitor Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 12 }}
              required
            />
            <input
              type="text"
              placeholder="Purpose (e.g. Cognitive Checkup)"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 12 }}
              required
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 16 }}
            />
            <Button type="submit" variant="primary">
              Save Appointment
            </Button>
          </form>
        </Card>

        <h3 className="label-lg" style={{ marginBottom: 12, color: 'var(--outline)' }}>SCHEDULED VISITS</h3>

        {(appData.visits || []).map((v) => (
          <Card key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ padding: 10, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}>
              <IconCalendar size={24} />
            </div>
            <div>
              <p className="headline-sm" style={{ fontSize: 18 }}>{v.name}</p>
              <p className="body-md" style={{ color: 'var(--outline)', fontSize: 14 }}>{v.purpose} • {v.date} ({v.time})</p>
            </div>
          </Card>
        ))}
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
