import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useCaretaker } from '@/context/CaretakerContext';
import {
  IconUser,
  IconMedication,
  IconMap,
  IconStats,
  IconGallery,
  IconDocument,
  IconCalendar,
  IconSos,
  IconCheck,
} from '@/components/icons';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const {
    assignedPatients,
    activePatient,
    activePatientId,
    loadingPatients,
    selectPatient,
    connectPatient,
  } = useCaretaker();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [patientCodeInput, setPatientCodeInput] = useState('');
  const [relationshipInput, setRelationshipInput] = useState('Guardian');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');

  const handleConnectPatient = async (e) => {
    e.preventDefault();
    setConnectError('');
    setConnecting(true);

    try {
      const { error } = await connectPatient({
        patientCode: patientCodeInput.trim(),
        relationship: relationshipInput,
      });

      if (error) {
        setConnectError(error.message || 'Failed to connect patient.');
        return;
      }

      showToast('Patient connected successfully! Switched to new patient.');
      setPatientCodeInput('');
      setShowConnectModal(false);
    } catch (err) {
      setConnectError(err.message || 'An unexpected error occurred.');
    } finally {
      setConnecting(false);
    }
  };

  const handleSelectPatient = (pId) => {
    selectPatient(pId);
    const selected = assignedPatients.find((p) => p.patient_id === pId);
    const name = selected?.patient?.profiles?.full_name || 'Patient';
    showToast(`Switched active monitoring to ${name}`);
    setShowConnectModal(false);
  };

  const patientDisplayName = activePatient?.patient?.profiles?.full_name || 'Assigned Patient';
  const caretakerDisplayName = profile?.full_name || user?.email?.split('@')[0] || 'Caretaker';
  const relationshipBadge = activePatient?.relationship || 'Guardian';

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Caretaker Hub" showBack={false} />

      <div style={{ marginTop: 8 }}>
        {/* Caregiver Status Banner */}
{/* Caregiver Status Banner */}
<Card
  style={{
    backgroundColor: "#00695C", // Same teal green as Patient Dashboard
    color: "#FFFFFF",
    borderRadius: "28px",
    padding: "30px 28px",
    marginBottom: 24,
    boxShadow: "0 8px 24px rgba(0,95,86,0.18)",
  }}
>
  {/* Top Section */}
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      flexWrap: "wrap",
      gap: 12,
    }}
  >
    <div>
      <p
        style={{
          color: "#A8F5E5",
          margin: 0,
          fontSize: "15px",
          fontWeight: 700,
        }}
      >
        Care Companion Active
      </p>

      <h2
        style={{
          color: "#FFFFFF",
          margin: "8px 0 0",
          fontSize: "42px",
          fontWeight: 800,
          lineHeight: 1.1,
        }}
      >
        {caretakerDisplayName}
      </h2>
    </div>

    {activePatient && (
      <span
        style={{
          backgroundColor: "rgba(255,255,255,0.18)",
          color: "#FFFFFF",
          fontSize: "13px",
          fontWeight: 700,
          padding: "8px 16px",
          borderRadius: "999px",
        }}
      >
        {relationshipBadge}
      </span>
    )}
  </div>

  {/* Divider */}
  <div
    style={{
      marginTop: 22,
      marginBottom: 22,
      borderTop: "1px solid rgba(255,255,255,0.18)",
    }}
  />

  {/* Bottom Section */}
  {loadingPatients ? (
    <p style={{ color: "#D6FFF3" }}>Loading assigned patient...</p>
  ) : activePatient ? (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div>
        <p
          style={{
            color: "#A8F5E5",
            fontSize: "14px",
            margin: 0,
            fontWeight: 600,
          }}
        >
          Currently Monitoring Patient
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 6,
          }}
        >
          <h3
            style={{
              color: "#FFFFFF",
              fontSize: "28px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {patientDisplayName}
          </h3>

          {assignedPatients.length > 1 && (
            <span
              style={{
                backgroundColor: "#0B7A6C",
                color: "#D8FFF5",
                fontSize: "11px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "999px",
              }}
            >
              {assignedPatients.length} Connected
            </span>
          )}
        </div>
      </div>

      {/* Right Side Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {assignedPatients.length > 1 && (
          <select
            value={activePatientId || ""}
            onChange={(e) => handleSelectPatient(e.target.value)}
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.35)",
              borderRadius: "999px",
              padding: "10px 16px",
              fontSize: "13px",
              fontWeight: 600,
              outline: "none",
            }}
          >
            {assignedPatients.map((p) => (
              <option
                key={p.patient_id}
                value={p.patient_id}
                style={{
                  backgroundColor: "#00695C",
                  color: "#FFFFFF",
                }}
              >
                {p.patient?.profiles?.full_name || "Patient"} (
                {p.relationship || "Guardian"})
              </option>
            ))}
          </select>
        )}

        <Button
          variant="outline"
          onClick={() => setShowConnectModal(true)}
          style={{
            padding: "10px 18px",
            fontSize: "13px",
            color: "#FFFFFF",
            backgroundColor: "rgba(255,255,255,0.08)",
            borderColor: "rgba(255,255,255,0.35)",
            borderRadius: "999px",
          }}
        >
          {assignedPatients.length > 1
            ? "Manage / Switch"
            : "Switch / Link Code"}
        </Button>
      </div>
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 12,
      }}
    >
      <p
        style={{
          color: "#D6FFF3",
          margin: 0,
          fontSize: "14px",
        }}
      >
        ⚠️ No patient connected yet. Enter Patient Connection Code.
      </p>

      <Button
        variant="primary"
        onClick={() => setShowConnectModal(true)}
        style={{
          backgroundColor: "#FFFFFF",
          color: "#00695C",
          fontWeight: 700,
          padding: "10px 18px",
          borderRadius: "999px",
        }}
      >
        + Link Patient
      </Button>
    </div>
  )}
</Card>
        {/* Link / Switch Patient Modal */}
        {showConnectModal && (
          <Card
            style={{
              marginBottom: 24,
              border: '2px solid var(--primary)',
              backgroundColor: 'var(--surface-container-lowest)',
            }}
          >
            {assignedPatients.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 className="headline-sm" style={{ marginBottom: 8, fontSize: '18px' }}>
                  Connected Patients ({assignedPatients.length})
                </h3>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', marginBottom: 12 }}>
                  Select which patient to monitor throughout the app:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {assignedPatients.map((p) => {
                    const isSelected = p.patient_id === activePatientId;
                    const name = p.patient?.profiles?.full_name || 'Patient';
                    const code = p.patient?.connection_code || '';
                    return (
                      <div
                        key={p.patient_id}
                        onClick={() => handleSelectPatient(p.patient_id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                          backgroundColor: isSelected ? 'var(--mint-soft)' : 'var(--surface-container-low)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              backgroundColor: isSelected ? 'var(--primary)' : 'var(--outline-variant)',
                              color: 'var(--white)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                            }}
                          >
                            <IconUser size={20} />
                          </div>
                          <div>
                            <p className="label-lg" style={{ margin: 0, fontWeight: 700 }}>
                              {name}
                            </p>
                            <p className="body-md" style={{ color: 'var(--outline)', fontSize: '12px', margin: 0 }}>
                              {p.relationship} {code ? `• Code: ${code}` : ''}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <span
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              color: 'var(--primary)',
                              fontWeight: 700,
                              fontSize: '13px',
                            }}
                          >
                            <IconCheck size={18} /> Active
                          </span>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPatient(p.patient_id);
                            }}
                            style={{ fontSize: '12px', padding: '4px 12px' }}
                          >
                            Switch to This Patient
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <hr style={{ margin: '20px 0', borderColor: 'var(--outline-variant)' }} />
              </div>
            )}

            <h3 className="headline-sm" style={{ marginBottom: 6, fontSize: '18px' }}>
              Link Patient by Connection Code
            </h3>
            <p className="body-md" style={{ color: 'var(--outline)', fontSize: '14px', marginBottom: 16 }}>
              Enter the short SMRITI Connection Code from the patient&apos;s Account screen (e.g. SMRITI-X7K9P2):
            </p>

            {connectError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--error-container)',
                  color: 'var(--on-error-container)',
                  fontSize: '13px',
                  marginBottom: 16,
                }}
              >
                {connectError}
              </div>
            )}

            <form onSubmit={handleConnectPatient} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Patient Connection Code (SMRITI-XXXXXX)</label>
                <input
                  type="text"
                  className="form-input"
                  value={patientCodeInput}
                  onChange={(e) => setPatientCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SMRITI-X7K9P2"
                  style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 600, letterSpacing: '1px' }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Relationship to Patient</label>
                <select
                  value={relationshipInput}
                  onChange={(e) => setRelationshipInput(e.target.value)}
                  className="form-select"
                >
                  <option value="Guardian">Guardian</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Nurse">Nurse / Caregiver</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Family Member">Family Member</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button type="submit" variant="primary" disabled={connecting} style={{ flex: 1 }}>
                  {connecting ? 'Connecting...' : 'Connect Patient'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowConnectModal(false);
                    setConnectError('');
                  }}
                  style={{ flex: 0.4 }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <h3 className="label-lg" style={{ marginBottom: 14, color: 'var(--outline)', letterSpacing: '0.5px' }}>
          CARE MANAGEMENT HUB
        </h3>

        {/* Responsive Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
        <div className="grid-responsive-4">
          <Card onClick={() => navigate('/caretaker/patient-profile')} style={{ cursor: 'pointer', padding: '20px' }}>
            <IconUser size={30} style={{ color: 'var(--primary)', marginBottom: 10 }} />
            <p className="label-lg" style={{ fontSize: '16px' }}>Patient Profile</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/medications')} style={{ cursor: 'pointer', padding: '20px' }}>
            <IconMedication size={30} style={{ color: 'var(--secondary)', marginBottom: 10 }} />
            <p className="label-lg" style={{ fontSize: '16px' }}>Medicine Setup</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/visits')} style={{ cursor: 'pointer', padding: '20px' }}>
            <IconCalendar size={30} style={{ color: '#54534e', marginBottom: 10 }} />
            <p className="label-lg" style={{ fontSize: '16px' }}>Appointments</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/live-tracking')} style={{ cursor: 'pointer', padding: '20px' }}>
            <IconMap size={30} style={{ color: '#00796b', marginBottom: 10 }} />
            <p className="label-lg" style={{ fontSize: '16px' }}>Live GPS Map</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/analytics')} style={{ cursor: 'pointer', padding: '20px' }}>
            <IconStats size={30} style={{ color: '#2e7d32', marginBottom: 10 }} />
            <p className="label-lg" style={{ fontSize: '16px' }}>Cognitive Analytics</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/gallery')} style={{ cursor: 'pointer', padding: '20px' }}>
            <IconGallery size={30} style={{ color: '#e67e22', marginBottom: 10 }} />
            <p className="label-lg" style={{ fontSize: '16px' }}>Memory Album</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/documents')} style={{ cursor: 'pointer', padding: '20px' }}>
            <IconDocument size={30} style={{ color: '#1565c0', marginBottom: 10 }} />
            <p className="label-lg" style={{ fontSize: '16px' }}>Medical Docs</p>
          </Card>

          <Card
            onClick={() => navigate('/caretaker/sos')}
            style={{ cursor: 'pointer', padding: '20px', backgroundColor: 'var(--error-container)' }}
          >
            <IconSos size={30} style={{ color: 'var(--error)', marginBottom: 10 }} />
            <p className="label-lg" style={{ color: 'var(--on-error-container)', fontSize: '16px' }}>SOS Monitor</p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
