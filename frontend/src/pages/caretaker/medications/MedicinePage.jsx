import { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { getAssignedPatients } from '@/services/patients';
import {
  getMedications,
  addMedication as apiAddMedication,
  updateMedication as apiUpdateMedication,
  deleteMedication as apiDeleteMedication,
  getMedicationLogs,
  subscribeMedications,
  subscribeMedicationLogs,
} from '@/services/medications';
import { formatTime } from '@/utils/formatters';
import { IconMedication, IconCheck } from '@/components/icons';

export default function MedicinePage() {
  const { showToast } = useAppData();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(true);
  const [medications, setMedications] = useState([]);
  const [medLogs, setMedLogs] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

  const todayStr = new Date().toISOString().split('T')[0];

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

  // 2. Fetch medications and today's intake logs
  const loadMedicationData = useCallback(() => {
    if (!patientId) return;
    setLoadingMeds(true);
    setErrorMsg('');

    Promise.all([
      getMedications(patientId),
      getMedicationLogs(patientId, todayStr, todayStr),
    ])
      .then(([medsRes, logsRes]) => {
        if (medsRes.error) {
          setErrorMsg(medsRes.error.message || 'Failed to load medications from Supabase.');
        } else {
          setMedications(medsRes.data || []);
        }

        if (logsRes.data) {
          setMedLogs(logsRes.data || []);
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Network error loading medications.');
      })
      .finally(() => {
        setLoadingMeds(false);
      });
  }, [patientId, todayStr]);

  useEffect(() => {
    loadMedicationData();
  }, [loadMedicationData]);

  // 3. Realtime subscriptions for medications & logs
  useEffect(() => {
    if (!patientId) return undefined;

    const subMeds = subscribeMedications(patientId, () => {
      loadMedicationData();
    });

    const subLogs = subscribeMedicationLogs(patientId, () => {
      loadMedicationData();
    });

    return () => {
      subMeds.unsubscribe();
      subLogs.unsubscribe();
    };
  }, [patientId, loadMedicationData]);

  // Handle Add Medication
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim() || !patientId) return;

    setSubmitting(true);
    setErrorMsg('');

    try {
      const { error } = await apiAddMedication(patientId, {
        name,
        dosage,
        type,
        frequency: 1,
        times: [time],
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to add medication to Supabase.');
        showToast('Error: ' + error.message);
        return;
      }

      showToast('Medication added to cloud schedule!');
      setName('');
      setDosage('');
      setTime('08:00');
      loadMedicationData();
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
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
      const { error } = await apiUpdateMedication(editingMedId, {
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
      loadMedicationData();
    } catch (err) {
      showToast('Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Medication
  const handleDelete = async (medId, medName) => {
    if (!window.confirm(`Delete prescription for "${medName}"?`)) return;

    try {
      const { error } = await apiDeleteMedication(medId);
      if (error) {
        showToast('Failed to delete: ' + error.message);
        return;
      }
      showToast('Medication removed.');
      loadMedicationData();
    } catch (err) {
      showToast('Error deleting medication.');
    }
  };

  // Helper to check dose intake status
  const getDoseStatus = (medId, scheduledTime) => {
    const formattedTime = scheduledTime.length === 5 ? `${scheduledTime}:00` : scheduledTime;
    const log = medLogs.find(
      (l) => l.medication_id === medId && (l.scheduled_time === formattedTime || l.scheduled_time === scheduledTime)
    );

    if (log && log.taken) {
      let timeLabel = '';
      if (log.taken_at) {
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Medicine Schedule Setup" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        {loadingPatient ? (
          <Card style={{ textAlign: 'center', padding: 20 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient details...</p>
          </Card>
        ) : !patient ? (
          <Card style={{ textAlign: 'center', padding: 24, backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
            <h3 className="headline-sm" style={{ color: '#e65100', marginBottom: 8 }}>
              No Patient Connected
            </h3>
            <p className="body-md" style={{ color: '#e65100', marginBottom: 16 }}>
              Please link a patient account from your Dashboard to manage their medication schedules.
            </p>
          </Card>
        ) : (
          <>
            {/* Active Patient Card */}
            <Card style={{ marginBottom: 16, backgroundColor: 'var(--mint-soft)', border: '1px solid var(--primary)' }}>
              <p className="body-md" style={{ color: 'var(--primary)', fontSize: '13px' }}>Managing Prescriptions for:</p>
              <h2 className="headline-sm" style={{ marginTop: 2 }}>
                {patient.patient?.profiles?.full_name || 'Assigned Patient'}
              </h2>
            </Card>

            {/* Error Message */}
            {errorMsg && (
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--error-container)',
                  color: 'var(--on-error-container)',
                  fontSize: '13px',
                  marginBottom: 16,
                }}
              >
                {errorMsg}
              </div>
            )}

            {/* Add Medication Form */}
            <Card style={{ marginBottom: 20 }}>
              <h3 className="headline-sm" style={{ marginBottom: 14 }}>Add Prescribed Medicine</h3>
              <form onSubmit={handleAdd}>
                <div style={{ marginBottom: 12 }}>
                  <label className="label-lg" style={{ display: 'block', marginBottom: 4, fontSize: '13px' }}>Medicine Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Donepezil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--outline)', fontSize: '14px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label className="label-lg" style={{ display: 'block', marginBottom: 4, fontSize: '13px' }}>Dosage</label>
                    <input
                      type="text"
                      placeholder="e.g. 5 mg"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--outline)', fontSize: '14px' }}
                      required
                    />
                  </div>

                  <div style={{ flex: 1 }}>
                    <label className="label-lg" style={{ display: 'block', marginBottom: 4, fontSize: '13px' }}>Form</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--outline)', fontSize: '14px', backgroundColor: 'var(--surface)' }}
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Drops">Drops</option>
                      <option value="Injection">Injection</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="label-lg" style={{ display: 'block', marginBottom: 4, fontSize: '13px' }}>Scheduled Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--outline)', fontSize: '14px' }}
                    required
                  />
                </div>

                <Button type="submit" variant="primary" disabled={submitting} style={{ width: '100%' }}>
                  {submitting ? 'Saving to Supabase...' : '+ Save Prescription to Cloud'}
                </Button>
              </form>
            </Card>

            {/* Edit Modal / Inline Edit */}
            {editingMedId && (
              <Card style={{ marginBottom: 20, border: '2px solid var(--secondary)', backgroundColor: 'var(--surface-container-lowest)' }}>
                <h3 className="headline-sm" style={{ marginBottom: 14 }}>Edit Medication</h3>
                <form onSubmit={handleUpdate}>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--outline)', marginBottom: 10 }}
                    required
                  />
                  <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <input
                      type="text"
                      value={editDosage}
                      onChange={(e) => setEditDosage(e.target.value)}
                      placeholder="Dosage"
                      style={{ flex: 1, padding: 10, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--outline)' }}
                      required
                    />
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      style={{ flex: 1, padding: 10, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--outline)', backgroundColor: 'var(--surface)' }}
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Drops">Drops</option>
                      <option value="Injection">Injection</option>
                    </select>
                  </div>
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--outline)', marginBottom: 14 }}
                    required
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button type="submit" variant="primary" disabled={submitting} style={{ flex: 1 }}>
                      {submitting ? 'Updating...' : 'Update Medication'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditingMedId(null)} style={{ flex: 0.5 }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <h3 className="label-lg" style={{ marginBottom: 12, color: 'var(--outline)' }}>
              LIVE PRESCRIBED MEDICINES ({medications.length})
            </h3>

            {loadingMeds ? (
              <Card style={{ textAlign: 'center', padding: 20 }}>
                <p className="body-md" style={{ color: 'var(--outline)' }}>Synchronizing medications from Supabase...</p>
              </Card>
            ) : medications.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 24 }}>
                <p className="body-md" style={{ color: 'var(--outline)' }}>No medicines scheduled yet for this patient.</p>
              </Card>
            ) : (
              medications.map((m) => {
                const primaryTime = m.times?.[0] || '08:00';
                const status = getDoseStatus(m.id, primaryTime);

                return (
                  <Card key={m.id} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ padding: 8, borderRadius: 'var(--radius-pill)', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)' }}>
                          <IconMedication size={22} />
                        </div>
                        <div>
                          <h4 className="headline-sm" style={{ fontSize: 17 }}>{m.name}</h4>
                          <p className="body-md" style={{ color: 'var(--outline)', fontSize: 13 }}>
                            {m.dosage} • {m.type || 'Tablet'}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          style={{ background: 'none', border: '1px solid var(--outline)', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m.id, m.name)}
                          style={{ background: 'none', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: 4, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--outline-variant)' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>
                        ⏰ {formatTime(primaryTime)}
                      </span>

                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: status.taken ? '#2e7d32' : '#e65100',
                          backgroundColor: status.taken ? '#e8f5e9' : '#fff3e0',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
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
              })
            )}
          </>
        )}
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
