import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import HeroCard from './components/HeroCard';
import MedReminderCard from './components/MedReminderCard';
import AppointmentReminderCard from './components/AppointmentReminderCard';
import { useAppData } from '@/hooks/useAppData';
import { isTodayDate } from '@/services/storage';
import { IconGamepad, IconSos, IconGallery, IconDocument, IconCalendar, IconMedication } from '@/components/icons';

export default function HomePage() {
  const navigate = useNavigate();
  const { appData, toggleMedication, showToast } = useAppData();
  const [reminderTab, setReminderTab] = useState('all'); // 'all', 'meds', 'visits'

  const allVisits = appData.visits || [];
  // Day-wise filtering: Only show appointments for TODAY on Home screen
  const todayVisits = allVisits.filter((v) => isTodayDate(v.date));
  const medicines = appData.medicine || [];

  const handleAcknowledgeVisit = (visitId) => {
    showToast('Appointment acknowledged!');
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Smriti Companion" showBack={false} />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        <HeroCard name={appData.patientName} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 12 }}>
          <h3 className="label-lg" style={{ color: 'var(--outline)', margin: 0 }}>
            TODAY&apos;S REMINDERS
          </h3>
          <button
            type="button"
            onClick={() => navigate('/patient/medications')}
            style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            View All →
          </button>
        </div>

        {/* Tab selector for Reminders */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, maxWidth: '100%', boxSizing: 'border-box' }}>
          <button
            type="button"
            className={`btn btn-sm ${reminderTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: 11, padding: '3px 10px', height: 26, borderRadius: 'var(--radius-pill)', width: 'auto', flex: '0 0 auto' }}
            onClick={() => setReminderTab('all')}
          >
            All Today ({medicines.length + todayVisits.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${reminderTab === 'visits' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: 11, padding: '3px 10px', height: 26, borderRadius: 'var(--radius-pill)', width: 'auto', flex: '0 0 auto' }}
            onClick={() => setReminderTab('visits')}
          >
            📅 Appointments ({todayVisits.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${reminderTab === 'meds' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: 11, padding: '3px 10px', height: 26, borderRadius: 'var(--radius-pill)', width: 'auto', flex: '0 0 auto' }}
            onClick={() => setReminderTab('meds')}
          >
            💊 Medicines ({medicines.length})
          </button>
        </div>

        {/* Display Day-wise Appointments when 'all' or 'visits' tab selected */}
        {(reminderTab === 'all' || reminderTab === 'visits') && (
          <div style={{ marginBottom: 12 }}>
            {reminderTab === 'all' && todayVisits.length > 0 && (
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <IconCalendar size={14} /> Today&apos;s Appointments
              </div>
            )}
            {todayVisits.length > 0 ? (
              todayVisits.map((v) => (
                <AppointmentReminderCard key={v.id} visit={v} onAcknowledge={handleAcknowledgeVisit} />
              ))
            ) : reminderTab === 'visits' ? (
              <Card style={{ textAlign: 'center', padding: 14, color: 'var(--outline)', fontSize: 13 }}>
                No appointments scheduled for today.
              </Card>
            ) : null}
          </div>
        )}

        {/* Display Medicines when 'all' or 'meds' tab selected */}
        {(reminderTab === 'all' || reminderTab === 'meds') && medicines.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {reminderTab === 'all' && (
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <IconMedication size={14} /> Today&apos;s Medicines
              </div>
            )}
            <MedReminderCard medicine={medicines} onToggle={toggleMedication} />
          </div>
        )}

        {/* Empty State */}
        {todayVisits.length === 0 && medicines.length === 0 && (
          <Card style={{ textAlign: 'center', padding: 16, color: 'var(--outline)', fontSize: 13 }}>
            No reminders scheduled for today.
          </Card>
        )}

        <h3 className="label-lg" style={{ marginTop: 24, marginBottom: 12, color: 'var(--outline)' }}>
          QUICK ACTIONS
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card onClick={() => navigate('/patient/games')} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ margin: '0 auto 8px', width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <IconGamepad size={28} />
            </div>
            <p className="label-lg">Memory Game</p>
          </Card>

          <Card onClick={() => navigate('/patient/gallery')} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ margin: '0 auto 8px', width: 48, height: 48, borderRadius: '50%', backgroundColor: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
              <IconGallery size={28} />
            </div>
            <p className="label-lg">Family Photos</p>
          </Card>

          <Card onClick={() => navigate('/patient/documents')} style={{ textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ margin: '0 auto 8px', width: 48, height: 48, borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
              <IconDocument size={28} />
            </div>
            <p className="label-lg">Documents</p>
          </Card>

          <Card onClick={() => navigate('/patient/sos')} style={{ textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--error-container)' }}>
            <div style={{ margin: '0 auto 8px', width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)' }}>
              <IconSos size={28} />
            </div>
            <p className="label-lg" style={{ color: 'var(--on-error-container)' }}>Emergency SOS</p>
          </Card>
        </div>
      </div>

      <BottomNav mode="patient" />
    </div>
  );
}
