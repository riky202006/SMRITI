import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { PageLayout } from '@/components/layout/DeviceFrame';
import { getTodayStr } from '@/services/storage';

export default function MedicationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('tab') === 'visits' ? 'visits' : 'meds');
  const { appData, setAppData, showToast } = useApp();
  const todayStr = getTodayStr();

  const takeMed = (medId, time) => {
    setAppData((prev) => ({
      ...prev,
      medicine: prev.medicine.map((m) => {
        if (m.id !== medId) return m;
        const history = { ...(m.history || {}) };
        if (!history[todayStr]) history[todayStr] = {};
        history[todayStr][time] = 'TAKEN';
        return { ...m, history };
      }),
    }));
    showToast('Medicine marked as TAKEN');
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
            {(appData.medicine || []).length === 0 ? (
              <p className="empty-msg">No medicines scheduled.</p>
            ) : (
              appData.medicine.map((m) => {
                const hist = m.history?.[todayStr] || {};
                return (
                  <div key={m.id} className="card" style={{ padding: 16 }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 17, color: 'var(--teal-dark)' }}>{m.name}</h3>
                    <p style={{ margin: '0 0 10px', color: 'var(--gray)', fontSize: 14 }}>
                      {m.type || 'Tablet'} • {m.dosage || '-'} • {m.frequency || 1}x Daily
                    </p>
                    {(m.times || []).map((t) => (
                      <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderTop: '1px solid #eee' }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{t}</span>
                        {hist[t] === 'TAKEN' ? (
                          <span style={{ color: '#2e7d32', fontWeight: 800, fontSize: 13 }}>✓ TAKEN</span>
                        ) : (
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => takeMed(m.id, t)}>
                            TAKE
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })
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
