import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAssignedPatients, connectPatientByCode } from '@/services/patients';
import {
  IconUser,
  IconMedication,
  IconMap,
  IconStats,
  IconGallery,
  IconDocument,
  IconCalendar,
  IconSos,
} from '@/components/icons';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { showToast } = useToast();

  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [patientCodeInput, setPatientCodeInput] = useState('');
  const [relationshipInput, setRelationshipInput] = useState('Guardian');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');

  const loadPatients = () => {
    if (user?.id) {
      setLoading(true);
      getAssignedPatients(user.id)
        .then(({ data }) => {
          setAssignedPatients(data || []);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    loadPatients();
  }, [user?.id]);

  const handleConnectPatient = async (e) => {
    e.preventDefault();
    setConnectError('');
    setConnecting(true);

    try {
      const { error } = await connectPatientByCode({
        patientCode: patientCodeInput.trim(),
        relationship: relationshipInput,
      });

      if (error) {
        setConnectError(error.message || 'Failed to connect patient.');
        return;
      }

      showToast('Patient connected successfully!');
      setPatientCodeInput('');
      setShowConnectModal(false);
      loadPatients();
    } catch (err) {
      setConnectError(err.message || 'An unexpected error occurred.');
    } finally {
      setConnecting(false);
    }
  };

  const currentPatient = assignedPatients[0];
  const patientDisplayName = currentPatient?.patient?.profiles?.full_name || 'Assigned Patient';
  const caretakerDisplayName = profile?.full_name || user?.email?.split('@')[0] || 'Caretaker';
  const relationshipBadge = currentPatient?.relationship || 'Guardian';

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Caretaker Hub" showBack={false} />

      <div style={{ marginTop: 8 }}>
        {/* Caregiver Status Banner */}
        <Card style={{ backgroundColor: 'var(--ink)', color: 'var(--white)', borderRadius: 'var(--radius-xl)', padding: '28px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p className="body-md" style={{ color: 'var(--mint)', margin: 0, fontSize: 14, fontWeight: 600 }}>Care Companion Active</p>
              <h2 className="headline-lg" style={{ color: 'var(--white)', marginTop: 4, fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 800 }}>
                {caretakerDisplayName}
              </h2>
            </div>
            {currentPatient && (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'var(--white)',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {relationshipBadge}
              </span>
            )}
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
            {loading ? (
              <p className="body-md" style={{ opacity: 0.8 }}>Loading assigned patient...</p>
            ) : currentPatient ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <p className="body-md" style={{ opacity: 0.8, fontSize: '13px', margin: 0 }}>Currently Monitoring Patient:</p>
                  <p className="headline-sm" style={{ color: 'var(--white)', fontSize: '20px', margin: '2px 0 0' }}>
                    {patientDisplayName}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowConnectModal(true)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '13px',
                    color: 'var(--white)',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  Switch / Link Code
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <p className="body-md" style={{ color: '#ffcc80', fontSize: '14px', margin: 0 }}>
                  ⚠️ No patient connected yet. Enter Patient Connection Code.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowConnectModal(true)}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  + Link Patient
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Link Patient Modal / Form */}
        {showConnectModal && (
          <Card style={{ marginBottom: 24, border: '2px solid var(--primary)', backgroundColor: 'var(--surface-container-lowest)' }}>
            <h3 className="headline-sm" style={{ marginBottom: 6, fontSize: '18px' }}>Link Patient by Connection Code</h3>
            <p className="body-md" style={{ color: 'var(--outline)', fontSize: '14px', marginBottom: 16 }}>
              Enter the UUID Patient Connection Code from the patient&apos;s Account screen:
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
                <label className="form-label">Patient Connection Code (UUID)</label>
                <input
                  type="text"
                  className="form-input"
                  value={patientCodeInput}
                  onChange={(e) => setPatientCodeInput(e.target.value)}
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  style={{ fontFamily: 'monospace', fontSize: '14px' }}
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
                <Button type="button" variant="outline" onClick={() => setShowConnectModal(false)} style={{ flex: 0.4 }}>
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

          <Card onClick={() => navigate('/caretaker/sos')} style={{ cursor: 'pointer', padding: '20px', backgroundColor: 'var(--error-container)' }}>
            <IconSos size={30} style={{ color: 'var(--error)', marginBottom: 10 }} />
            <p className="label-lg" style={{ color: 'var(--on-error-container)', fontSize: '16px' }}>SOS Monitor</p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
