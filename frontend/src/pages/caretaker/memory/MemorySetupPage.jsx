import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MemoryActivityChart from '@/components/charts/MemoryActivityChart';
import { useAppData } from '@/hooks/useAppData';

export default function MemorySetupPage() {
  const navigate = useNavigate();
  const { appData, showToast } = useAppData();
  const reports = appData.analyticsReports || [];

  const handleSave = () => {
    showToast('Memory game parameters updated!');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Memory Game & Performance" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <h3 className="label-lg" style={{ marginBottom: 12, color: 'var(--outline)' }}>
          PATIENT PERFORMANCE REPORT CHART
        </h3>

        <div style={{ marginBottom: 20 }}>
          <MemoryActivityChart reports={reports} />
        </div>

        <Card style={{ marginBottom: 16 }}>
          <h3 className="headline-sm" style={{ marginBottom: 8 }}>Difficulty &amp; Challenge Settings</h3>
          <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 16 }}>
            Adjust how many distractor names are shown during family photo recognition rounds.
          </p>

          <Button variant="primary" onClick={handleSave}>
            Save Difficulty (Medium - 4 choices)
          </Button>
        </Card>

        <Card style={{ textAlign: 'center', backgroundColor: 'var(--surface-container-low)' }}>
          <h4 className="headline-sm" style={{ margin: '0 0 4px' }}>Want Full Analytics &amp; Notes?</h4>
          <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, marginBottom: 12 }}>
            View detailed session logs and record custom caretaker observations.
          </p>
          <Button variant="outline" onClick={() => navigate('/caretaker/analytics')}>
            Go to Full Analytics Page →
          </Button>
        </Card>
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
