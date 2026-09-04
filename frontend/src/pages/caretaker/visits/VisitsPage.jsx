import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAssignedPatients } from '@/services/patients';
import { useAppointments } from '@/hooks/useAppointments';
import { formatTime } from '@/utils/formatters';
import { IconCalendar, IconCheck } from '@/components/icons';

export default function VisitsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [kind, setKind] = useState('doctor');
  const [specialization, setSpecialization] = useState('');
  const [relation, setRelation] = useState('');
  const [purpose, setPurpose] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch assigned patient
  useEffect(() => {
    if (user?.id) {
      setLoadingPatient(true);
      getAssignedPatients(user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setPatient(data[0]);
          } else {
            setPatient(null);
          }
        })
        .finally(() => {
          setLoadingPatient(false);
        });
    }
  }, [user?.id]);

  const patientId = patient?.patient_id;

  const {
    appointments,
    loading: loadingAppts,
    error: apptsError,
    addAppointment,
    deleteAppointment,
  } = useAppointments(patientId);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim() || !patientId) return;

    setSubmitting(true);
    try {
      const { error } = await addAppointment({
        name: name.trim(),
        kind,
        specialization: kind === 'doctor' ? specialization.trim() : null,
        relation: kind === 'visitor' ? relation.trim() : null,
        purpose: purpose.trim(),
        date,
        time,
        location: location.trim(),
      });

      if (error) {
        showToast('Failed to schedule: ' + error.message);
        return;
      }

      showToast('Appointment scheduled in Supabase!');
      setName('');
      setSpecialization('');
      setRelation('');
      setPurpose('');
      setLocation('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (apptId, apptName) => {
    if (!window.confirm(`Cancel and delete appointment for "${apptName}"?`)) return;

    try {
      const { error } = await deleteAppointment(apptId);
      if (error) {
        showToast('Failed to delete: ' + error.message);
      } else {
        showToast('Appointment removed.');
      }
    } catch {
      showToast('Error deleting appointment.');
    }
  };

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Doctor & Visitor Appointments" />

      <div style={{ marginTop: 8 }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient details...</p>
          </Card>
        ) : !patient ? (
          <Card className="empty-state-card" style={{ backgroundColor: '#fff3e0', borderColor: '#ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 6 }}>
              No Patient Connected
            </h3>
            <p className="body-md" style={{ color: '#e65100' }}>
              Please link a patient account from your Dashboard to manage their appointments.
            </p>
          </Card>
        ) : (
          <>
            {/* Active Patient Card */}
            <Card style={{ marginBottom: 20, backgroundColor: 'var(--mint-soft)', border: '1.5px solid var(--primary)', padding: '16px 20px' }}>
              <p className="body-md" style={{ color: 'var(--primary)', fontSize: '13px', margin: 0, fontWeight: 600 }}>MANAGING APPOINTMENTS FOR:</p>
              <h2 className="headline-sm" style={{ marginTop: 2, fontSize: '20px' }}>
                {patient.patient?.profiles?.full_name || 'Assigned Patient'}
              </h2>
            </Card>

            {apptsError && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--error-container)',
                  color: 'var(--on-error-container)',
                  fontSize: '14px',
                  marginBottom: 16,
                }}
              >
                {apptsError.message || 'Error communicating with Supabase.'}
              </div>
            )}

            {/* Responsive 2-Column Grid */}
            <div className="grid-responsive-2" style={{ alignItems: 'start' }}>
              {/* Left Column: Schedule Appointment Form */}
              <div>
                <Card style={{ padding: '24px' }}>
                  <h3 className="headline-sm" style={{ marginBottom: 16, fontSize: '18px' }}>Schedule New Appointment</h3>
                  <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Appointment Category</label>
                      <select
                        value={kind}
                        onChange={(e) => setKind(e.target.value)}
                        className="form-select"
                      >
                        <option value="doctor">👨‍⚕️ Doctor / Clinical Visit</option>
                        <option value="visitor">👥 Family / Friend Visitor</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">{kind === 'doctor' ? 'Doctor Name' : 'Visitor Name'}</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={kind === 'doctor' ? 'e.g. Dr. Priya Sen' : 'e.g. Rahul (Grandson)'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    {kind === 'doctor' ? (
                      <div className="form-group">
                        <label className="form-label">Specialization / Department</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Neurologist / Memory Clinic"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="form-group">
                        <label className="form-label">Relationship to Patient</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Grandson / Neighbor"
                          value={relation}
                          onChange={(e) => setRelation(e.target.value)}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 12 }}>
                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Date</label>
                        <input
                          type="date"
                          className="form-input"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Time</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 10:30 AM"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Location / Clinic</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. City Hospital, Room 302"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Purpose / Notes</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Routine Cognitive Evaluation"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                      />
                    </div>

                    <Button type="submit" variant="primary" disabled={submitting} style={{ width: '100%', marginTop: 6 }}>
                      {submitting ? 'Saving to Cloud...' : '+ Save Appointment'}
                    </Button>
                  </form>
                </Card>
              </div>

              {/* Right Column: Scheduled Appointments List */}
              <div>
                <h3 className="label-lg" style={{ marginBottom: 14, color: 'var(--outline)', letterSpacing: '0.5px' }}>
                  SCHEDULED VISITS ({appointments.length})
                </h3>

                {loadingAppts ? (
                  <Card style={{ textAlign: 'center', padding: 24 }}>
                    <div className="spinner" />
                    <p className="body-md" style={{ color: 'var(--outline)' }}>Loading appointments from Supabase...</p>
                  </Card>
                ) : appointments.length === 0 ? (
                  <Card className="empty-state-card">
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📅</div>
                    <h4 style={{ fontSize: 17, fontWeight: 700 }}>No Appointments Scheduled</h4>
                    <p>Schedule doctor visits and family reminders to keep the patient informed.</p>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {appointments.map((v) => {
                      const isDoctor = v.kind === 'doctor' || !v.kind;

                      return (
                        <Card
                          key={v.id}
                          style={{
                            padding: '18px 20px',
                            borderLeft: `4px solid ${isDoctor ? 'var(--primary)' : 'var(--secondary)'}`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div
                                style={{
                                  padding: 10,
                                  borderRadius: 'var(--radius-pill)',
                                  backgroundColor: isDoctor ? 'var(--mint-soft)' : '#fff3e0',
                                  color: isDoctor ? 'var(--primary)' : 'var(--secondary)',
                                }}
                              >
                                <IconCalendar size={22} />
                              </div>
                              <div>
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 800,
                                    color: isDoctor ? 'var(--primary)' : 'var(--secondary)',
                                    textTransform: 'uppercase',
                                  }}
                                >
                                  {isDoctor ? '👨‍⚕️ Doctor Appointment' : '👥 Visitor Visit'}
                                </span>
                                <h4 className="headline-sm" style={{ fontSize: 17, margin: '2px 0 0' }}>
                                  {v.name}
                                </h4>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleDelete(v.id, v.name)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          </div>

                          <div style={{ fontSize: 13, color: 'var(--outline)', marginTop: 8, lineHeight: 1.5 }}>
                            <p style={{ margin: 0, color: 'var(--ink)' }}>
                              📅 <strong>{v.date}</strong> at <strong>{formatTime(v.time)}</strong>
                            </p>
                            {v.specialization && <p style={{ margin: '2px 0 0' }}>Dept: {v.specialization}</p>}
                            {v.relation && <p style={{ margin: '2px 0 0' }}>Relation: {v.relation}</p>}
                            {v.location && <p style={{ margin: '2px 0 0' }}>📍 {v.location}</p>}
                            {v.purpose && <p style={{ margin: '2px 0 0' }}>Purpose: {v.purpose}</p>}
                          </div>

                          <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid var(--surface-container)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                            <span style={{ color: v.acknowledged ? '#2e7d32' : 'var(--outline)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                              {v.acknowledged ? <><IconCheck size={14} /> Acknowledged by Patient</> : 'Pending Patient Notice'}
                            </span>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
