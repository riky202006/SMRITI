import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { useCaretaker } from '@/context/CaretakerContext';
import { useEmergencyContacts } from '@/hooks/useEmergencyContacts';
import { IconUser, IconPhone, IconPlus, IconCheck } from '@/components/icons';

export default function PatientProfilePage() {
  const { showToast } = useToast();
  const {
    assignedPatients,
    activePatient,
    activePatientId,
    loadingPatients,
    selectPatient,
    connectPatient,
    unlinkPatient,
  } = useCaretaker();

  const [patientCodeInput, setPatientCodeInput] = useState('');
  const [relationshipInput, setRelationshipInput] = useState('Guardian');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Emergency contact form state
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRel, setContactRel] = useState('Family Member');
  const [addingContact, setAddingContact] = useState(false);

  const patientId = activePatient?.patient_id;

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
      const { error } = await connectPatient({
        patientCode: patientCodeInput.trim(),
        relationship: relationshipInput,
      });

      if (error) {
        setConnectError(error.message || 'Failed to connect patient.');
        return;
      }

      showToast('Patient linked successfully! Switched to new patient.');
      setPatientCodeInput('');
      setShowAddForm(false);
    } catch (err) {
      setConnectError(err.message || 'An error occurred.');
    } finally {
      setConnecting(false);
    }
  };

  const handleUnlink = async (targetPatientId) => {
    if (!window.confirm('Are you sure you want to disconnect from this patient?')) return;
    try {
      const { error } = await unlinkPatient(targetPatientId);
      if (error) {
        showToast('Failed to disconnect: ' + error.message);
      } else {
        showToast('Patient disconnected.');
      }
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
        {loadingPatients ? (
          <Card style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner" />
            <p className="body-md" style={{ color: 'var(--outline)' }}>Loading patient record from Supabase...</p>
          </Card>
        ) : activePatient ? (
          <div>
            {/* Multi-patient Selector Bar if multiple patients */}
            {assignedPatients.length > 1 && (
              <Card style={{ marginBottom: 20, padding: '16px 20px', backgroundColor: 'var(--surface-container-low)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', margin: 0, fontWeight: 600 }}>
                      CONNECTED PATIENTS ({assignedPatients.length}):
                    </p>
                    <p className="body-md" style={{ fontSize: '12px', margin: 0, color: 'var(--outline)' }}>
                      Click any patient tab to switch active monitoring.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{ fontSize: '12px', padding: '4px 12px' }}
                  >
                    {showAddForm ? 'Close Link Form' : '+ Link Another Patient'}
                  </Button>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                  {assignedPatients.map((p) => {
                    const isSelected = p.patient_id === activePatientId;
                    const name = p.patient?.profiles?.full_name || 'Patient';
                    return (
                      <button
                        key={p.patient_id}
                        type="button"
                        onClick={() => selectPatient(p.patient_id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-pill)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--outline-variant)',
                          backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface-container-lowest)',
                          color: isSelected ? 'var(--white)' : 'var(--ink)',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <IconUser size={16} />
                        <span>{name}</span>
                        {isSelected && <IconCheck size={16} />}
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Quick Action to Link Another Patient if only 1 patient */}
            {assignedPatients.length === 1 && !showAddForm && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <Button variant="outline" size="sm" onClick={() => setShowAddForm(true)}>
                  <IconPlus size={16} style={{ marginRight: 4 }} /> Link Another Patient Code
                </Button>
              </div>
            )}

            {/* Add Patient Collapsible / Inline Form */}
            {showAddForm && (
              <Card
                style={{
                  marginBottom: 24,
                  border: '2px solid var(--primary)',
                  backgroundColor: 'var(--surface-container-lowest)',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 className="headline-sm" style={{ margin: 0, fontSize: '18px' }}>
                    Link Additional Patient Account
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', fontSize: '18px' }}
                  >
                    ✕
                  </button>
                </div>
                <p className="body-md" style={{ color: 'var(--outline)', fontSize: '14px', marginBottom: 16 }}>
                  Enter the SMRITI Connection Code from the patient&apos;s Account screen (e.g. SMRITI-X7K9P2).
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
                    <label className="form-label">Your Relationship</label>
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
                      {connecting ? 'Linking Patient...' : 'Link Patient'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} style={{ flex: 0.4 }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            <div className="grid-responsive-2" style={{ alignItems: 'start' }}>
              {/* Left Column: Profile Card & Unlink */}
              <div>
                <Card style={{ textAlign: 'center', padding: '28px 24px', marginBottom: 20 }}>
                  <div
                    style={{
                      margin: '0 auto 16px',
                      width: 72,
                      height: 72,
                      borderRadius: '50%',
                      backgroundColor: 'var(--mint-soft)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconUser size={40} />
                  </div>
                  <h2 className="headline-md" style={{ fontSize: '24px', margin: '0 0 4px' }}>
                    {activePatient.patient?.profiles?.full_name || 'Assigned Patient'}
                  </h2>
                  <p className="body-md" style={{ color: 'var(--outline)', margin: '0 0 12px' }}>
                    {activePatient.patient?.profiles?.phone || 'No phone registered'}
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
                      Relationship: {activePatient.relationship || 'Caregiver'}
                    </span>
                  </div>
                </Card>

                <Card style={{ marginBottom: 20 }}>
                  <h3 className="label-lg" style={{ color: 'var(--outline)', marginBottom: 12, letterSpacing: '0.5px' }}>
                    PATIENT CONNECTION METRICS
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {activePatient.patient?.connection_code && (
                      <div>
                        <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', margin: 0 }}>
                          SMRITI Connection Code:
                        </p>
                        <p style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '15px', margin: '2px 0 0', color: 'var(--primary)', letterSpacing: '1px' }}>
                          {activePatient.patient.connection_code}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="body-md" style={{ color: 'var(--outline)', fontSize: '13px', margin: 0 }}>Patient ID (UUID):</p>
                      <p style={{ fontFamily: 'monospace', fontWeight: 700, wordBreak: 'break-all', fontSize: '13px', margin: '2px 0 0', color: 'var(--ink)' }}>
                        {activePatient.patient_id}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <IconPhone size={22} style={{ color: 'var(--primary)' }} />
                      <div>
                        <p className="body-md" style={{ color: 'var(--outline)', fontSize: '12px', margin: 0 }}>Primary Contact</p>
                        <p className="label-lg" style={{ margin: 0 }}>{activePatient.patient?.profiles?.phone || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                </Card>

                <Button
                  variant="outline"
                  onClick={() => handleUnlink(activePatient.patient_id)}
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
                    Contacts configured here appear on {activePatient.patient?.profiles?.full_name || "the patient"}&apos;s SOS screen for one-tap calling.
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
