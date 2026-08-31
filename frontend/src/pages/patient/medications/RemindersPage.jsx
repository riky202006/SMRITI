import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import MedListItem from './components/MedListItem';
import { useAppData } from '@/hooks/useAppData';

export default function RemindersPage() {
  const { appData, toggleMedication } = useAppData();
  const medicineList = appData.medicine || [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Daily Medications" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 20 }}>
          Here are your scheduled doses for today. Tap "Mark as Taken" when you take your pills.
        </p>

        {medicineList.map((med) => (
          <MedListItem key={med.id} medicine={med} onToggle={toggleMedication} />
        ))}
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
