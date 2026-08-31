import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MemoryActivityChart from '@/components/charts/MemoryActivityChart';
import { useAppData } from '@/hooks/useAppData';
import { IconStats, IconGamepad, IconDocument } from '@/components/icons';

export default function AnalyticsPage() {
  const { appData, setAppData, showToast } = useAppData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [customAccuracy, setCustomAccuracy] = useState('80');
  const [customNotes, setCustomNotes] = useState('');

  const reports = appData.analyticsReports || [];

  const handleCreateReport = (e) => {
    e.preventDefault();
    if (!customNotes) return;

    const acc = Math.min(100, Math.max(0, parseInt(customAccuracy, 10) || 80));
    const correctCount = Math.round((acc / 100) * 5);
    const score = correctCount * 10;

    const newRpt = {
      id: `rpt_caretaker_${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      accuracy: acc,
      correctCount,
      totalRounds: 5,
      score,
      summary: `[Caretaker Observation] ${customNotes}`,
    };

    setAppData((prev) => ({
      ...prev,
      analyticsReports: [newRpt, ...(prev.analyticsReports || [])],
    }));

    showToast('Patient memory report recorded!');
    setCustomNotes('');
    setShowAddForm(false);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Cognitive & Game Analytics" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        {/* Banner */}
        <Card style={{ backgroundColor: 'var(--primary)', color: 'var(--white)', padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <IconStats size={28} style={{ color: 'var(--mint-soft)' }} />
            <h2 className="headline-md" style={{ color: 'var(--white)', margin: 0 }}>Memory Activity Reports</h2>
          </div>
          <p className="body-md" style={{ color: 'var(--mint-soft)', margin: 0, fontSize: 13 }}>
            Track patient cognitive health trends, accuracy curves, and round performance across memory challenges.
          </p>
        </Card>

        {/* Chart View */}
        <div style={{ marginBottom: 20 }}>
          <MemoryActivityChart reports={reports} />
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 className="label-lg" style={{ color: 'var(--outline)', margin: 0 }}>
            PATIENT MEMORY LOGS ({reports.length})
          </h3>
          <Button
            variant={showAddForm ? 'secondary' : 'outline'}
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            {showAddForm ? 'Cancel Report' : '+ Create Caretaker Note'}
          </Button>
        </div>

        {/* Caretaker Manual Memory Observation Report Form */}
        {showAddForm && (
          <Card style={{ marginBottom: 16, border: '2px solid var(--primary)', backgroundColor: 'var(--mint-soft)' }}>
            <h4 className="headline-sm" style={{ margin: '0 0 12px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconDocument size={20} /> Create Patient Memory Report Entry
            </h4>
            <form onSubmit={handleCreateReport}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Estimated Accuracy (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={customAccuracy}
                onChange={(e) => setCustomAccuracy(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 12 }}
                required
              />

              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                Caretaker Notes &amp; Patient Response Observation
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Patient recognized daughter Anita in 3s, took longer with Sanjay..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline)', marginBottom: 12 }}
                required
              />

              <Button type="submit" variant="primary">
                Save &amp; Add to Analytics Chart
              </Button>
            </form>
          </Card>
        )}

        {/* List of Reports */}
        {reports.map((rpt) => (
          <Card key={rpt.id} style={{ marginBottom: 12, borderLeft: '6px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IconGamepad size={22} style={{ color: 'var(--primary)' }} />
                <span className="headline-sm" style={{ fontSize: 16 }}>
                  {rpt.summary?.includes('[Caretaker Observation]') ? 'Caretaker Note' : 'Memory Game Session'}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--outline)', fontWeight: 600 }}>
                {rpt.date || 'Today'} {rpt.timestamp}
              </span>
            </div>

            <p className="body-md" style={{ marginBottom: 10, fontSize: 14 }}>{rpt.summary}</p>

            <div style={{ display: 'flex', gap: 16, backgroundColor: 'var(--surface-container-low)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <p className="label-lg" style={{ color: 'var(--primary)', margin: 0 }}>{rpt.accuracy}%</p>
                <p className="body-md" style={{ fontSize: 11, color: 'var(--outline)', margin: 0 }}>Accuracy</p>
              </div>
              <div>
                <p className="label-lg" style={{ color: 'var(--secondary)', margin: 0 }}>{rpt.correctCount}/{rpt.totalRounds || 5}</p>
                <p className="body-md" style={{ fontSize: 11, color: 'var(--outline)', margin: 0 }}>Rounds Won</p>
              </div>
              <div>
                <p className="label-lg" style={{ color: '#2e7d32', margin: 0 }}>+{rpt.score}</p>
                <p className="body-md" style={{ fontSize: 11, color: 'var(--outline)', margin: 0 }}>Points</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
