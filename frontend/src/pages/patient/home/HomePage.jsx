import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import HeroCard from './components/HeroCard';
import MedReminderCard from './components/MedReminderCard';
import AppointmentReminderCard from './components/AppointmentReminderCard';
import SmritiAssistantCard from '@/components/assistant/SmritiAssistantCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useMedications } from '@/hooks/useMedications';
import { useAppointments } from '@/hooks/useAppointments';
import {
  IconGamepad,
  IconSos,
  IconGallery,
  IconDocument,
  IconCalendar,
  IconMedication,
} from '@/components/icons';

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, patientRecord } = useAuth();
  const { showToast } = useToast();
  const patientId = patientRecord?.id;

  const {
    medications,
    loading: loadingMeds,
    toggleIntake,
    isTakenToday,
  } = useMedications(patientId);

  const {
    todayAppointments,
    loading: loadingAppts,
    acknowledgeAppointment,
  } = useAppointments(patientId);

  const [reminderTab, setReminderTab] = useState('all'); // 'all', 'meds', 'visits'

  const handleAcknowledgeVisit = async (visitId) => {
    await acknowledgeAppointment(visitId);
    showToast('Appointment noted!');
  };

  const handleToggleMed = async (medId, time, state) => {
    const { error } = await toggleIntake(medId, time, state);
    if (error) {
      showToast('Failed to update dose status');
    } else {
      showToast(state ? 'Dose marked as TAKEN ✓' : 'Dose marked as NOT TAKEN');
    }
  };

  const isLoading = loadingMeds || loadingAppts;
  const hasNoReminders = !isLoading && medications.length === 0 && todayAppointments.length === 0;

  return (
    <AppLayout mode="patient">
      <TopBar title="SMRITI Companion" showBack={false} />

      <div style={{ marginTop: 8 }}>
        <HeroCard name={profile?.full_name} />

        {/* SMRITI Assistant AI Guide (Patient Only) */}
        <div style={{ marginTop: 20 }}>
          <SmritiAssistantCard />
        </div>

        {/* Dashboard Responsive Grid: Reminders on Left/Main, Quick Actions on Right */}
        <div className="home-dashboard-grid" style={{ marginTop: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <h3 className="label-lg" style={{ color: 'var(--outline)', margin: 0, letterSpacing: '0.5px' }}>
                TODAY&apos;S REMINDERS
              </h3>
              <button
                type="button"
                onClick={() => navigate('/patient/medications')}
                style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}
              >
                View All Schedule →
              </button>
            </div>

            {/* Tab selector for Reminders */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                className={`btn btn-sm ${reminderTab === 'all' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setReminderTab('all')}
              >
                All Today ({medications.length + todayAppointments.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${reminderTab === 'visits' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setReminderTab('visits')}
              >
                📅 Appointments ({todayAppointments.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${reminderTab === 'meds' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setReminderTab('meds')}
              >
                💊 Medicines ({medications.length})
              </button>
            </div>

            {/* Display Appointments */}
            {(reminderTab === 'all' || reminderTab === 'visits') && (
              <div style={{ marginBottom: 12 }}>
                {reminderTab === 'all' && todayAppointments.length > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                    <IconCalendar size={16} /> Appointments Today
                  </div>
                )}
                {todayAppointments.map((v) => (
                  <AppointmentReminderCard key={v.id} visit={v} onAcknowledge={handleAcknowledgeVisit} />
                ))}
              </div>
            )}

            {/* Display Medicines */}
            {(reminderTab === 'all' || reminderTab === 'meds') && (
              <div style={{ marginBottom: 12 }}>
                {reminderTab === 'all' && medications.length > 0 && (
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                    <IconMedication size={16} /> Prescriptions Today
                  </div>
                )}
                {medications.map((m) => {
                  const primaryTime = m.times && m.times[0] ? m.times[0] : '08:00';
                  const taken = isTakenToday(m.id, primaryTime);
                  return (
                    <MedReminderCard
                      key={m.id}
                      medication={m}
                      isTaken={taken}
                      onToggle={handleToggleMed}
                    />
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {hasNoReminders && (
              <Card className="empty-state-card">
                <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
                <h4 style={{ fontSize: 17, fontWeight: 700 }}>All Caught Up for Today!</h4>
                <p>No pending medicine doses or doctor appointments scheduled for today.</p>
              </Card>
            )}
          </div>

          {/* Quick Actions Shortcuts */}
          <div>
            <h3 className="label-lg" style={{ marginBottom: 14, color: 'var(--outline)', letterSpacing: '0.5px' }}>
              QUICK COMPANION SHORTCUTS
            </h3>

            <div className="grid-responsive-2">
              <Card
                onClick={() => navigate('/patient/games')}
                style={{ textAlign: 'center', cursor: 'pointer', padding: '20px 16px' }}
              >
                <div style={{ margin: '0 auto 10px', width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <IconGamepad size={28} />
                </div>
                <p className="label-lg" style={{ fontSize: '15px' }}>Memory Game</p>
              </Card>

              <Card
                onClick={() => navigate('/patient/gallery')}
                style={{ textAlign: 'center', cursor: 'pointer', padding: '20px 16px' }}
              >
                <div style={{ margin: '0 auto 10px', width: 52, height: 52, borderRadius: '50%', backgroundColor: '#fff3e0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                  <IconGallery size={28} />
                </div>
                <p className="label-lg" style={{ fontSize: '15px' }}>Family Photos</p>
              </Card>

              <Card
                onClick={() => navigate('/patient/documents')}
                style={{ textAlign: 'center', cursor: 'pointer', padding: '20px 16px' }}
              >
                <div style={{ margin: '0 auto 10px', width: 52, height: 52, borderRadius: '50%', backgroundColor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2e7d32' }}>
                  <IconDocument size={28} />
                </div>
                <p className="label-lg" style={{ fontSize: '15px' }}>Medical Docs</p>
              </Card>

              <Card
                onClick={() => navigate('/patient/sos')}
                style={{ textAlign: 'center', cursor: 'pointer', padding: '20px 16px', backgroundColor: 'var(--error-container)' }}
              >
                <div style={{ margin: '0 auto 10px', width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--white)' }}>
                  <IconSos size={28} />
                </div>
                <p className="label-lg" style={{ color: 'var(--on-error-container)', fontSize: '15px' }}>Emergency SOS</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
