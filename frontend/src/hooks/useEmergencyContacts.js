import { useState, useEffect, useCallback } from 'react';
import {
  getEmergencyContacts,
  addEmergencyContact as apiAddEmergencyContact,
  updateEmergencyContact as apiUpdateEmergencyContact,
  deleteEmergencyContact as apiDeleteEmergencyContact,
} from '@/services/emergencyContacts';

export function useEmergencyContacts(patientId) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(Boolean(patientId));
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!patientId) {
      setContacts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await getEmergencyContacts(patientId);
      if (err) {
        setError(err);
      } else {
        setContacts(data || []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = async (contactData) => {
    if (!patientId) return { data: null, error: new Error('Patient ID missing') };
    const res = await apiAddEmergencyContact(patientId, contactData);
    if (!res.error) refresh();
    return res;
  };

  const update = async (contactId, updates) => {
    const res = await apiUpdateEmergencyContact(contactId, updates);
    if (!res.error) refresh();
    return res;
  };

  const remove = async (contactId) => {
    const res = await apiDeleteEmergencyContact(contactId);
    if (!res.error) refresh();
    return res;
  };

  const primaryContact = contacts.find((c) => c.is_primary) || contacts[0] || null;

  return {
    contacts,
    primaryContact,
    loading,
    error,
    refresh,
    addContact: add,
    updateContact: update,
    deleteContact: remove,
  };
}
