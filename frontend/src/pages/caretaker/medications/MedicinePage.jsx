import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAssignedPatients } from '@/services/patients';
import { useMedications } from '@/hooks/useMedications';
import { formatTime } from '@/utils/formatters';
import { IconMedication, IconCheck } from '@/components/icons';

export default function MedicinePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [type, setType] = useState('Tablet');
  const [time, setTime] = useState('08:00');
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editingMedId, setEditingMedId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editType, setEditType] = useState('Tablet');
  const [editTime, setEditTime] = useState('08:00');

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
    medications,
    loading: loadingMeds,
    error: medsError,
    addMedication,
    updateMedication,
    deleteMedication,
    getIntakeLog,
    isTakenToday,
  } = useMedications(patientId);

  // Handle Add Medication
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !patientId) return;

    setSubmitting(true);
    try {
      const { error } = await addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        type,
        frequency: 1,
        times: [time],
      });

      if (error) {
        showToast('Error: ' + error.message);
        return;
      }

      showToast('Medication added to cloud schedule!');
      setName('');
      setDosage('');
      setTime('08:00');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Medication
  const startEdit = (med) => {
    setEditingMedId(med.id);
    setEditName(med.name);
    setEditDosage(med.dosage || '');
    setEditType(med.type || 'Tablet');
    setEditTime(med.times?.[0] || '08:00');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingMedId || !editName.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await updateMedication(editingMedId, {
        name: editName.trim(),
        dosage: editDosage.trim(),
        type: editType,
        times: [editTime],
      });

      if (error) {
        showToast('Error updating: ' + error.message);
        return;
      }

      showToast('Medication updated successfully!');
      setEditingMedId(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Medication
  const handleDelete = async (medId, medName) => {
    if (!window.confirm(`Delete prescription for "${medName}"?`)) return;

    try {
      const { error } = await deleteMedication(medId);
      if (error) {
        showToast('Failed to delete: ' + error.message);
        return;
      }
      showToast('Medication removed.');
    } catch {
      showToast('Error deleting medication.');
    }
  };

  const getDoseStatus = (medId, scheduledTime) => {
    const isTaken = isTakenToday(medId, scheduledTime);
    const log = getIntakeLog(medId, scheduledTime);

    if (isTaken) {
      let timeLabel = '';
      if (log?.taken_at) {
        try {
          const d = new Date(log.taken_at);
          timeLabel = ` at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } catch {}
      }
      return { taken: true, text: `✓ Taken today${timeLabel}` };
    }
    return { taken: false, text: 'Pending intake' };
  };

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Medicine Schedule Setup" />

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
              Please link a patient account from your Dashboard to manage their medication schedules.
            </p>
          </Card>
        ) : (
          <>
            {/* Active Patient Indicator Banner */}
            <Card style={{ marginBottom: 20, backgroundColor: 'var(--mint-soft)', border: '1.5px solid var(--primary)', padding: '16px 20px' }}>
              <p className="body-md" style={{ color: 'var(--primary)', fontSize: '13px', margin: 0, fontWeight: 600 }}>MANAGING PRESCRIPTIONS FOR:</p>
              <h2 className="headline-sm" style={{ marginTop: 2, fontSize: '20px' }}>
                {patient.patient?.profiles?.full_name || 'Assigned Patient'}
              </h2>
            </Card>

            {medsError && (
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
                {medsError.message || 'Error communicating with Supabase.'}
              </div>
            )}

            {/* Responsive 2-Column Grid on Tablet/Desktop */}
            <div className="grid-responsive-2" style={{ alignItems: 'start' }}>
              {/* Left Column: Add / Edit Form */}
              <div>
                {editingMedId ? (
                  <Card style={{ border: '2px solid var(--secondary)', backgroundColor: 'var(--surface-container-lowest)', padding: '24px' }}>
                    <h3 className="headline-sm" style={{ marginBottom: 16, fontSize: '18px' }}>Edit Medication</h3>
                    <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="form-group">
                        <label className="form-label">Medicine Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Dosage</label>
                          <input
                            type="text"
                            className="form-input"
                            value={editDosage}
                            onChange={(e) => setEditDosage(e.target.value)}
                            placeholder="Dosage"
                            required
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Form</label>
                          <select
                            value={editType}
                            onChange={(e) => setEditType(e.target.value)}
                            className="form-select"
                          >
                            <option value="Tablet">Tablet</option>
                            <option value="Capsule">Capsule</option>
                            <option value="Syrup">Syrup</option>
                            <option value="Drops">Drops</option>
                            <option value="Injection">Injection</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Scheduled Time</label>
                        <input
                          type="time"
                          className="form-input"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <Button type="submit" variant="primary" disabled={submitting} style={{ flex: 1 }}>
                          {submitting ? 'Updating...' : 'Update Medication'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditingMedId(null)} style={{ flex: 0.4 }}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Card>
                ) : (
                  <Card style={{ padding: '24px' }}>
                    <h3 className="headline-sm" style={{ marginBottom: 16, fontSize: '18px' }}>Add Prescribed Medicine</h3>
                    <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <div className="form-group">
                        <label className="form-label">Medicine Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Donepezil"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Dosage</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. 5 mg"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                            required
                          />
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                          <label className="form-label">Form</label>
                          <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="form-select"
                          >
                            <option value="Tablet">Tablet</option>
                            <option value="Capsule">Capsule</option>
                            <option value="Syrup">Syrup</option>
                            <option value="Drops">Drops</option>
                            <option value="Injection">Injection</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Scheduled Daily Time</label>
                        <input
                          type="time"
                          className="form-input"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                        />
                      </div>

                      <Button type="submit" variant="primary" disabled={submitting} style={{ width: '100%', marginTop: 6 }}>
                        {submitting ? 'Saving to Cloud...' : '+ Save Prescription to Cloud'}
                      </Button>
                    </form>
                  </Card>
                )}
              </div>

              {/* Right Column: Prescribed Medications List & Intake Monitoring */}
              <div>
                <h3 className="label-lg" style={{ marginBottom: 14, color: 'var(--outline)', letterSpacing: '0.5px' }}>
                  SCHEDULED MEDICATIONS ({medications.length})
                </h3>

                {loadingMeds ? (
                  <Card style={{ textAlign: 'center', padding: 24 }}>
                    <div className="spinner" />
                    <p className="body-md" style={{ color: 'var(--outline)' }}>Synchronizing cloud prescriptions...</p>
                  </Card>
                ) : medications.length === 0 ? (
                  <Card className="empty-state-card">
                    <div style={{ fontSize: 32, marginBottom: 8 }}>💊</div>
                    <h4 style={{ fontSize: 17, fontWeight: 700 }}>No Prescriptions Added</h4>
                    <p>Use the form to schedule daily medications for this patient.</p>
                  </Card>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {medications.map((m) => {
                      const primaryTime = m.times?.[0] || '08:00';
                      const status = getDoseStatus(m.id, primaryTime);

                      return (
                        <Card key={m.id} style={{ padding: '18px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ padding: 10, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}>
                                <IconMedication size={24} />
                              </div>
                              <div>
                                <h4 className="headline-sm" style={{ fontSize: 17, margin: 0 }}>{m.name}</h4>
                                <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13, margin: '2px 0 0' }}>
                                  {m.dosage} • {m.type || 'Tablet'}
                                </p>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                type="button"
                                onClick={() => startEdit(m)}
                                className="btn btn-sm btn-outline"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(m.id, m.name)}
                                className="btn btn-sm btn-danger"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--surface-container)' }}>
                            <span style={{ fontSize: 14, fontWeight: 700 }}>
                              ⏰ {formatTime(primaryTime)}
                            </span>

                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: status.taken ? '#2e7d32' : '#e65100',
                                backgroundColor: status.taken ? '#e8f5e9' : '#fff3e0',
                                padding: '4px 10px',
                                borderRadius: 'var(--radius-pill)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              {status.taken && <IconCheck size={14} />}
                              {status.text}
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
