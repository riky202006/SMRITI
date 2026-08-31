import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
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
  const { appData, showToast } = useAppData();
  const { user, profile } = useAuth();

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
  const patientDisplayName = currentPatient?.patient?.profiles?.full_name || appData.patientName || 'Ravi Kumar';
  const caretakerDisplayName = profile?.full_name || appData.caretakerName || 'Anita';
  const relationshipBadge = currentPatient?.relationship || appData.caretakerRole || 'Guardian';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Caretaker Hub" showBack={false} />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        {/* Caregiver Status Banner */}
        <Card style={{ backgroundColor: 'var(--ink)', color: 'var(--white)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="body-md" style={{ color: 'var(--mint)' }}>Care Companion Active</p>
              <h2 className="headline-lg" style={{ color: 'var(--white)', marginTop: 4 }}>
                {caretakerDisplayName}
              </h2>
            </div>
            {currentPatient && (
              <span
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'var(--white)',
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {relationshipBadge}
              </span>
            )}
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.15)' }}>
            {loading ? (
              <p className="body-md" style={{ opacity: 0.8 }}>Loading assigned patient...</p>
            ) : currentPatient ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p className="body-md" style={{ opacity: 0.8, fontSize: '13px' }}>Monitoring Patient:</p>
                  <p className="headline-sm" style={{ color: 'var(--white)', fontSize: '18px' }}>
                    {patientDisplayName}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowConnectModal(true)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    color: 'var(--white)',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  }}
                >
                  Switch / Link
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="body-md" style={{ color: '#ffcc80', fontSize: '14px' }}>
                  ⚠️ No patient connected yet
                </p>
                <Button
                  variant="primary"
                  onClick={() => setShowConnectModal(true)}
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  + Link Patient
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Link Patient Modal / Inline Card */}
        {showConnectModal && (
          <Card style={{ marginTop: 16, border: '2px solid var(--primary)', backgroundColor: 'var(--surface-container-lowest)' }}>
            <h3 className="headline-sm" style={{ marginBottom: 6 }}>Link Patient by Connection Code</h3>
            <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', marginBottom: 14 }}>
              Enter the UUID Patient Connection Code from the patient's Account screen:
            </p>

            {connectError && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--error-container)',
                  color: 'var(--on-error-container)',
                  fontSize: '13px',
                  marginBottom: 14,
                }}
              >
                {connectError}
              </div>
            )}

            <form onSubmit={handleConnectPatient}>
              <div style={{ marginBottom: 12 }}>
                <label className="label-lg" style={{ display: 'block', marginBottom: 4, fontSize: '13px' }}>
                  Patient Connection Code (UUID)
                </label>
                <input
                  type="text"
                  value={patientCodeInput}
                  onChange={(e) => setPatientCodeInput(e.target.value)}
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--outline)',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="label-lg" style={{ display: 'block', marginBottom: 4, fontSize: '13px' }}>
                  Your Relationship to Patient
                </label>
                <select
                  value={relationshipInput}
                  onChange={(e) => setRelationshipInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--outline)',
                    fontSize: '14px',
                    backgroundColor: 'var(--surface)',
                    outline: 'none',
                  }}
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

              <div style={{ display: 'flex', gap: 10 }}>
                <Button type="submit" variant="primary" disabled={connecting} style={{ flex: 1 }}>
                  {connecting ? 'Connecting...' : 'Connect Patient'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowConnectModal(false)} style={{ flex: 0.5 }}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <h3 className="label-lg" style={{ marginTop: 24, marginBottom: 12, color: 'var(--outline)' }}>
          CARE MANAGEMENT
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card onClick={() => navigate('/caretaker/patient-profile')} style={{ cursor: 'pointer' }}>
            <IconUser size={28} style={{ color: 'var(--primary)', marginBottom: 8 }} />
            <p className="label-lg">Patient Profile</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/medications')} style={{ cursor: 'pointer' }}>
            <IconMedication size={28} style={{ color: 'var(--secondary)', marginBottom: 8 }} />
            <p className="label-lg">Medicine Setup</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/live-tracking')} style={{ cursor: 'pointer' }}>
            <IconMap size={28} style={{ color: '#00796b', marginBottom: 8 }} />
            <p className="label-lg">Live GPS Map</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/visits')} style={{ cursor: 'pointer' }}>
            <IconCalendar size={28} style={{ color: '#54534e', marginBottom: 8 }} />
            <p className="label-lg">Appointments</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/analytics')} style={{ cursor: 'pointer' }}>
            <IconStats size={28} style={{ color: '#2e7d32', marginBottom: 8 }} />
            <p className="label-lg">Analytics</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/gallery')} style={{ cursor: 'pointer' }}>
            <IconGallery size={28} style={{ color: '#e67e22', marginBottom: 8 }} />
            <p className="label-lg">Photo Gallery</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/documents')} style={{ cursor: 'pointer' }}>
            <IconDocument size={28} style={{ color: '#1565c0', marginBottom: 8 }} />
            <p className="label-lg">Documents</p>
          </Card>

          <Card onClick={() => navigate('/caretaker/sos')} style={{ cursor: 'pointer', backgroundColor: 'var(--error-container)' }}>
            <IconSos size={28} style={{ color: 'var(--error)', marginBottom: 8 }} />
            <p className="label-lg" style={{ color: 'var(--on-error-container)' }}>SOS Alerts</p>
          </Card>
        </div>
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
