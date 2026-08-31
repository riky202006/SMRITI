import { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppData } from '@/hooks/useAppData';
import { useAuth } from '@/context/AuthContext';
import { getAssignedPatients, connectPatientByCode, unlinkPatientFromCaretaker } from '@/services/patients';
import { IconUser, IconPhone } from '@/components/icons';

export default function PatientProfilePage() {
  const { appData, showToast } = useAppData();
  const { user } = useAuth();

  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
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

      showToast('Patient linked successfully!');
      setPatientCodeInput('');
      loadPatients();
    } catch (err) {
      setConnectError(err.message || 'An error occurred.');
    } finally {
      setConnecting(false);
    }
  };

  const handleUnlink = async (patientId) => {
    if (!window.confirm('Are you sure you want to disconnect from this patient?')) return;
    try {
      await unlinkPatientFromCaretaker({ caretakerId: user.id, patientId });
      showToast('Patient disconnected.');
      loadPatients();
    } catch {
      showToast('Failed to disconnect.');
    }
  };

  const currentPatient = assignedPatients[0];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Patient Profile & Link" />

      <div style={{ flex: 1, padding: 'var(--gutter)', overflowY: 'auto' }}>
        {loading ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient record from Supabase...</p>
          </Card>
        ) : currentPatient ? (
          <>
            <Card style={{ textAlign: 'center', padding: 24, marginBottom: 16 }}>
              <div style={{ margin: '0 auto 12px', width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconUser size={36} />
              </div>
              <h2 className="headline-md">
                {currentPatient.patient?.profiles?.full_name || appData.patientName || 'Assigned Patient'}
              </h2>
              <p className="body-md" style={{ color: 'var(--outline)' }}>
                {currentPatient.patient?.profiles?.phone || '+91 9876543210'}
              </p>
              <div style={{ marginTop: 8 }}>
                <span
                  style={{
                    backgroundColor: '#e8f5e9',
                    color: '#2e7d32',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  Relationship: {currentPatient.relationship || 'Caregiver'}
                </span>
              </div>
            </Card>

            <Card style={{ marginBottom: 16 }}>
              <h3 className="label-lg" style={{ color: 'var(--outline)', marginBottom: 8 }}>PATIENT DETAILS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px' }}>Patient Connection ID (UUID):</p>
                  <p className="body-md" style={{ fontFamily: 'monospace', fontWeight: 600, wordBreak: 'break-all', fontSize: '13px' }}>
                    {currentPatient.patient_id}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <IconPhone size={20} style={{ color: 'var(--primary)' }} />
                  <div>
                    <p className="body-md" style={{ color: 'var(--outline)', fontSize: '12px' }}>Emergency Contact</p>
                    <p className="label-lg">{currentPatient.patient?.profiles?.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Button
              variant="outline"
              onClick={() => handleUnlink(currentPatient.patient_id)}
              style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)' }}
            >
              Disconnect Patient
            </Button>
          </>
        ) : (
          <Card>
            <h2 className="headline-md" style={{ marginBottom: 6 }}>Link Patient Account</h2>
            <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 16, fontSize: '14px' }}>
              Connect with a patient using their 36-character Patient Connection Code (UUID) found in their Account screen.
            </p>

            {connectError && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--error-container)',
                  color: 'var(--on-error-container)',
                  fontSize: '13px',
                  marginBottom: 16,
                  wordBreak: 'break-word',
                }}
              >
                {connectError}
              </div>
            )}

            <form onSubmit={handleConnectPatient}>
              <div style={{ marginBottom: 14 }}>
                <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>
                  Patient Connection Code (UUID)
                </label>
                <input
                  type="text"
                  value={patientCodeInput}
                  onChange={(e) => setPatientCodeInput(e.target.value)}
                  placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--outline)',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="label-lg" style={{ display: 'block', marginBottom: 6 }}>
                  Your Relationship
                </label>
                <select
                  value={relationshipInput}
                  onChange={(e) => setRelationshipInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
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

              <Button type="submit" variant="primary" disabled={connecting} style={{ width: '100%' }}>
                {connecting ? 'Linking Patient...' : 'Link to Patient'}
              </Button>
            </form>
          </Card>
        )}
      </div>

      <BottomNav mode="caretaker" />
    </div>
  );
}
