import { useApp } from '@/context/AppContext';

export function useAppData() {
  const { appData, setAppData, showToast } = useApp();

  const updatePatientName = (name) => {
    setAppData((prev) => ({ ...prev, patientName: name }));
  };

  const updateCaretakerName = (name) => {
    setAppData((prev) => ({ ...prev, caretakerName: name }));
  };

  const setRole = (role) => {
    setAppData((prev) => ({ ...prev, role }));
  };

  const toggleMedication = (medId, timeStr, dateStr) => {
    setAppData((prev) => {
      const updatedMeds = (prev.medicine || []).map((m) => {
        if (m.id === medId) {
          const histKey = `${dateStr}_${timeStr}`;
          const currentHist = m.history || {};
          const isTaken = !!currentHist[histKey];
          return {
            ...m,
            history: {
              ...currentHist,
              [histKey]: !isTaken,
            },
          };
        }
        return m;
      });
      return { ...prev, medicine: updatedMeds };
    });
  };

  const addMedication = (medObj) => {
    setAppData((prev) => ({
      ...prev,
      medicine: [...(prev.medicine || []), { ...medObj, id: Date.now() }],
    }));
    showToast('Medication added successfully');
  };

  const addVisit = (visitObj) => {
    setAppData((prev) => ({
      ...prev,
      visits: [...(prev.visits || []), { ...visitObj, id: Date.now() }],
    }));
    showToast('Appointment added successfully');
  };

  const addGalleryImage = (imageObj) => {
    setAppData((prev) => ({
      ...prev,
      images: [{ ...imageObj, id: Date.now().toString() }, ...(prev.images || [])],
    }));
    showToast('Photo uploaded successfully');
  };
const removeGalleryImage = (imageId) => {
  setAppData((prev) => ({
    ...prev,
    images: (prev.images || []).filter((img) => img.id !== imageId),
  }));
  showToast('Photo removed successfully');
};
  const triggerSos = () => {
    setAppData((prev) => ({
      ...prev,
      sosActive: true,
      sosTimestamp: new Date().toISOString(),
    }));
    showToast('EMERGENCY SOS ALERT SENT!');
  };

  return {
    appData,
    setAppData,
    updatePatientName,
    updateCaretakerName,
    setRole,
    toggleMedication,
    addMedication,
    addVisit,
    addGalleryImage,
    removeGalleryImage,
    triggerSos,
    showToast,
  };
}
