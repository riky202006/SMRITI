import { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAssignedPatients, connectPatientByCode, unlinkPatientFromCaretaker } from '@/services/patients';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { IconUser, IconPhone } from '@/components/icons';

export default function PatientProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientCodeInput, setPatientCodeInput] = useState('');
  const [relationshipInput, setRelationshipInput] = useState('Guardian');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');

  // Emergency contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRel, setContactRel] = useState('Family Member');
  const [addingContact, setAddingContact] = useState(false);

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

  const currentPatient = assignedPatients[0];
  const patientId = currentPatient?.patient_id;

  const {
    contacts,
    loading: loadingContacts,
    addContact,
    deleteContact,
  } = useEmergencyContacts(patientId);

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

  const handleUnlink = async (targetPatientId) => {
    if (!window.confirm('Are you sure you want to disconnect from this patient?')) return;
    try {
      await unlinkPatientFromCaretaker({ caretakerId: user.id, patientId: targetPatientId });
      showToast('Patient disconnected.');
      loadPatients();
    } catch {
      showToast('Failed to disconnect.');
    }
  };

  const handleAddEmergencyContact = async (e) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim() || !patientId) return;

    setAddingContact(true);
    try {
      const { error } = await addContact({
        name: contactName.trim(),
        phone: contactPhone.trim(),
        relationship: contactRel,
        isPrimary: contacts.length === 0,
      });

      if (error) {
        showToast('Error adding contact: ' + error.message);
      } else {
        showToast('Emergency contact added!');
        setContactName('');
        setContactPhone('');
      }
    } finally {
      setAddingContact(false);
    }
  };

  const handleDeleteEmergencyContact = async (contactId, name) => {
    if (!window.confirm(`Remove emergency contact "${name}"?`)) return;
    try {
      await deleteContact(contactId);
      showToast('Emergency contact removed.');
    } catch {
      showToast('Failed to delete contact.');
    }
  };

  return (
    <AppLayout mode="caretaker">
      <TopBar title="Patient Profile & Link" />

      <div style={{ marginTop: 8 }}>
        {loading ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient record from Supabase...</p>
          </Card>
        ) : currentPatient ? (
          <div className="grid-responsive-2" style={{ alignItems: 'start' }}>
            {/* Left Column: Profile Card & Unlink */}
            <div>
              <Card style={{ textAlign: 'center', padding: '28px 24px', marginBottom: 20 }}>
                <div style={{ margin: '0 auto 16px', width: 72, height: 72, borderRadius: '50%', backgroundColor: 'var(--mint-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconUser size={40} />
                </div>
                <h2 className="headline-md" style={{ fontSize: '24px', margin: '0 0 4px' }}>
                  {currentPatient.patient?.profiles?.full_name || 'Assigned Patient'}
                </h2>
                <p className="body-md" style={{ color: 'var(--outline)', margin: '0 0 12px' }}>
                  {currentPatient.patient?.profiles?.phone || 'No phone registered'}
                </p>
                <div>
                  <span
                    style={{
                      backgroundColor: '#e8f5e9',
                      color: '#2e7d32',
                      fontSize: '13px',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-pill)',
                    }}
                  >
                    Relationship: {currentPatient.relationship || 'Caregiver'}
                  </span>
                </div>
              </Card>

              <Card style={{ marginBottom: 20 }}>
                <h3 className="label-lg" style={{ color: 'var(--outline)', marginBottom: 12, letterSpacing: '0.5px' }}>PATIENT CONNECTION METRICS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', margin: 0 }}>Patient ID (UUID):</p>
                    <p style={{ fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', fontSize: '13px', margin: '2px 0 0', color: 'var(--ink)' }}>
                      {currentPatient.patient_id}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <IconPhone size={22} style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="body-md" style={{ color: 'var(--outline)', fontSize: '12px', margin: 0 }}>Primary Contact</p>
                      <p className="label-lg" style={{ margin: 0 }}>{currentPatient.patient?.profiles?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Button
                variant="outline"
                onClick={() => handleUnlink(currentPatient.patient_id)}
                style={{ width: '100%', borderColor: 'var(--error)', color: 'var(--error)', marginBottom: 20 }}
              >
                Disconnect Patient Link
              </Button>
            </div>

            {/* Right Column: Emergency Contacts Management */}
            <div>
              <Card style={{ padding: '24px', marginBottom: 20 }}>
                <h3 className="headline-sm" style={{ marginBottom: 6, fontSize: '18px' }}>Emergency Contacts Setup</h3>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', marginBottom: 16 }}>
                  Contacts configured here appear on the patient&apos;s SOS screen for one-tap calling.
                </p>

                <form onSubmit={handleAddEmergencyContact} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Dr. Priya Sen or Ramesh (Son)"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 98765 43210"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Relationship / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Primary Physician, Son, Neighbor"
                      value={contactRel}
                      onChange={(e) => setContactRel(e.target.value)}
                    />
                  </div>

                  <Button type="submit" variant="primary" disabled={addingContact} style={{ width: '100%', marginTop: 4 }}>
                    {addingContact ? 'Saving...' : '+ Add Emergency Contact'}
                  </Button>
                </form>
              </Card>

              {/* Emergency Contacts List */}
              <h3 className="label-lg" style={{ marginBottom: 12, color: 'var(--outline)', letterSpacing: '0.5px' }}>
                CONFIGURED EMERGENCY NUMBERS ({contacts.length})
              </h3>

              {loadingContacts ? (
                <Card style={{ textAlign: 'center', padding: 20 }}>
                  <div className="spinner" />
                </Card>
              ) : contacts.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: 20 }}>
                  <p className="body-md" style={{ color: 'var(--outline)' }}>No emergency numbers added yet.</p>
                </Card>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {contacts.map((c) => (
                    <Card key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                      <div>
                        <p className="headline-sm" style={{ fontSize: '16px', margin: 0 }}>{c.name}</p>
                        <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', margin: '2px 0 0' }}>
                          {c.relationship} • {c.phone}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteEmergencyContact(c.id, c.name)}
                        className="btn btn-sm btn-danger"
                      >
                        Remove
                      </button>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}>
            <Card style={{ padding: '28px 24px' }}>
              <h2 className="headline-md" style={{ marginBottom: 6, fontSize: '22px' }}>Link Patient Account</h2>
              <p className="body-md" style={{ color: 'var(--outline)', marginBottom: 20, fontSize: '14px' }}>
                Connect with a patient using their short SMRITI Connection Code (e.g. SMRITI-X7K9P2) found in their Account screen.
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

              <form onSubmit={handleConnectPatient} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">
                    Patient Connection Code (SMRITI-XXXXXX)
                  </label>
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
                  <label className="form-label">
                    Your Relationship
                  </label>
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

                <Button type="submit" variant="primary" disabled={connecting} style={{ width: '100%', marginTop: 4 }}>
                  {connecting ? 'Linking Patient...' : 'Link to Patient'}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
