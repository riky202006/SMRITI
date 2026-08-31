import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { PageLayout } from '@/components/layout/DeviceFrame';
import { getPatientByProfileId } from '@/services/patients';
import {
  getMedications,
  getMedicationLogs,
  logMedicationIntake,
  subscribeMedications,
  subscribeMedicationLogs,
} from '@/services/medications';

export default function MedicationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'visits' ? 'visits' : 'meds');
  const { appData, showToast } = useApp();
  const { user, patientRecord } = useAuth();

  const [patientId, setPatientId] = useState(patientRecord?.id || null);
  const [medications, setMedications] = useState([]);
  const [medLogs, setMedLogs] = useState([]);
  const [loadingMeds, setLoadingMeds] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (patientRecord?.id) {
      setPatientId(patientRecord.id);
    } else if (user?.id) {
      getPatientByProfileId(user.id).then(({ data }) => {
        if (data?.id) setPatientId(data.id);
      });
    }
  }, [patientRecord?.id, user?.id]);

  const loadData = useCallback(() => {
    if (!patientId) return;
    setLoadingMeds(true);
    Promise.all([
      getMedications(patientId),
      getMedicationLogs(patientId, todayStr, todayStr),
    ])
      .then(([medsRes, logsRes]) => {
        setMedications(medsRes.data || []);
        setMedLogs(logsRes.data || []);
      })
      .finally(() => {
        setLoadingMeds(false);
      });
  }, [patientId, todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!patientId) return undefined;
    const sub1 = subscribeMedications(patientId, () => loadData());
    const sub2 = subscribeMedicationLogs(patientId, () => loadData());
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
    };
  }, [patientId, loadData]);

  const takeMed = async (medId, time) => {
    if (!patientId) return;
    try {
      const { error } = await logMedicationIntake({
        medicationId: medId,
        patientId,
        scheduledDate: todayStr,
        scheduledTime: time,
        taken: true,
        takenAt: new Date().toISOString(),
      });

      if (error) {
        showToast('Failed to record dose: ' + error.message);
      } else {
        showToast('Medicine marked as TAKEN');
        loadData();
      }
    } catch {
      showToast('Error recording intake.');
    }
  };

  const isDoseTaken = (medId, time) => {
    const formattedTime = time.length === 5 ? `${time}:00` : time;
    const log = medLogs.find(
      (l) => l.medication_id === medId && (l.scheduled_time === formattedTime || l.scheduled_time === time)
    );
    return log?.taken || false;
  };

  return (
    <>
      <PageLayout title="Meds & Visits" onBack={() => navigate('/patient/home')}>
        <div className="tab-bar" style={{ margin: '-16px -20px 16px' }}>
          <button type="button" className={`tab-bar__item${tab === 'meds' ? ' tab-bar__item--active' : ''}`} onClick={() => setTab('meds')}>
            MEDICINES
          </button>
          <button type="button" className={`tab-bar__item${tab === 'visits' ? ' tab-bar__item--active' : ''}`} onClick={() => setTab('visits')}>
            VISITS &amp; APPOINTMENTS
          </button>
        </div>

        {tab === 'meds' && (
          <>
            {loadingMeds ? (
              <p className="empty-msg">Loading cloud prescriptions...</p>
            ) : medications.length === 0 ? (
              <p className="empty-msg">No medicines scheduled by your caretaker.</p>
            ) : (
              medications.map((m) => (
                <div key={m.id} className="card" style={{ padding: 16, marginBottom: 12 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 17, color: 'var(--teal-dark)' }}>{m.name}</h3>
                  <p style={{ margin: '0 0 10px', color: 'var(--gray)', fontSize: 14 }}>
                    {m.type || 'Tablet'} • {m.dosage || '-'} • {m.frequency || 1}x Daily
                  </p>
                  {(m.times || []).map((t) => {
                    const taken = isDoseTaken(m.id, t);
                    return (
                      <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #eee' }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{t}</span>
                        {taken ? (
                          <span style={{ color: '#2e7d32', fontWeight: 800, fontSize: 13 }}>✓ TAKEN</span>
                        ) : (
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => takeMed(m.id, t)}>
                            TAKE
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </>
        )}

        {tab === 'visits' && (
          <>
            {(appData.visits || []).length === 0 ? (
              <p className="empty-msg">No upcoming visits or appointments.</p>
            ) : (
              appData.visits.map((v) => {
                const isDoctor = v.kind === 'doctor' || !v.kind;
                return (
                  <div key={v.id} className="card" style={{ padding: 16, borderLeft: `5px solid ${isDoctor ? 'var(--primary)' : 'var(--secondary)'}`, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: isDoctor ? 'var(--primary)' : 'var(--secondary)' }}>
                      {isDoctor ? '👨‍⚕️ Doctor Appointment' : '👥 Upcoming Visitor'}
                    </span>
                    <h3 style={{ margin: '4px 0', fontSize: 18 }}>{v.name}</h3>
                    {isDoctor && v.specialization && <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--primary)', fontWeight: 700 }}>{v.specialization}</p>}
                    {!isDoctor && v.relation && <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--gray)' }}>Relation: {v.relation}</p>}
                    {v.location && <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--gray)' }}>📍 {v.location}</p>}
                    {v.purpose && <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--gray)' }}>Purpose: {v.purpose}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 8, borderTop: '1px solid #eee' }}>
                      <span style={{ fontWeight: 800, fontSize: 14 }}>📅 {v.date} • {v.time}</span>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => showToast('Appointment noted!')}
                      >
                        ✓ Noted
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </PageLayout>
    </>
  );
}
