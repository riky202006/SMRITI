export const STORAGE_KEY = 'meca_data_v2';

const DEFAULT_IMAGES = [
  { id: '1', dataUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500', name: 'Anita' },
  { id: '2', dataUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500', name: 'Rahul' },
  { id: '3', dataUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500', name: 'Priya' },
  { id: '4', dataUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500', name: 'Sanjay' },
  { id: '5', dataUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500', name: 'Kiran' },
];

export function getDefaultAppData() {
  return {
    patientName: 'Ravi Kumar',
    patientPhone: '+91 9876543210',
    patientEmail: 'ravi.kumar@example.com',
    patientAddress: '123 Park Street, Indiranagar, Bengaluru',
    caretakerName: 'Anita Sharma',
    caretakerPhone: '+91 9876543211',
    caretakerEmail: 'anita.caretaker@example.com',
    caretakerRole: 'Guardian',
    role: null,
    images: [...DEFAULT_IMAGES],
    medicine: [
      { id: 1, name: 'Paracetamol', type: 'Tablet', dosage: '500 mg', frequency: 2, times: ['08:00', '20:00'], history: {} },
      { id: 2, name: 'Vitamin D3', type: 'Capsule', dosage: '60,000 IU', frequency: 1, times: ['09:00'], history: {} },
      { id: 3, name: 'Blood Pressure Med', type: 'Tablet', dosage: '10 mg', frequency: 1, times: ['21:00'], history: {} },
    ],
    visits: [
      { id: 1, kind: 'doctor', name: 'Dr. Ananya Sharma', specialization: 'Neurologist / Memory Care', location: 'Apollo Hospital, Clinic 4B', date: getTodayStr(), time: '11:30 AM', purpose: 'Routine Cognitive Review' },
      { id: 2, kind: 'visitor', name: 'Rahul Sharma', relation: 'Son', date: getTodayStr(), time: '05:00 PM', purpose: 'Family Visit' },
      { id: 3, kind: 'doctor', name: 'Dr. Mehta', specialization: 'Cardiologist', location: 'City Clinic', date: '2026-09-05', time: '10:00 AM', purpose: 'Heart & BP Check' },
    ],
    prescriptions: [
      { id: 'rx1', med: 'Donepezil 5mg', dose: '1 tablet daily at bedtime', time: '09:00 PM', doctor: 'Dr. Ananya Sharma', date: '15 Aug 2026' },
      { id: 'rx2', med: 'Multivitamin Complex', dose: '1 tablet after breakfast', time: '09:30 AM', doctor: 'Dr. Mehta', date: '10 Aug 2026' },
    ],
    documents: [
      { id: 'doc1', name: 'Brain MRI Scan Report.pdf', type: 'application/pdf', date: '12 Aug 2026' },
      { id: 'doc2', name: 'Comprehensive Blood Test.pdf', type: 'application/pdf', date: '05 Aug 2026' },
      { id: 'doc3', name: 'Neurologist Consultation Notes.pdf', type: 'application/pdf', date: '15 Aug 2026' },
    ],
    emergencyContacts: [
      { rel: 'Son', name: 'Rahul Sharma', phone: '+919876543210' },
      { rel: 'Daughter', name: 'Priya Sharma', phone: '+919876543211' },
      { rel: 'Primary Caretaker', name: 'Anita Sharma', phone: '+919876543212' },
    ],
    patientProfile: {},
    stats: { games: 5, score: 180, correct: 18, incorrect: 7 },
    analyticsReports: [
      { id: 'rpt_1', date: 'Aug 26', timestamp: '10:15 AM', totalRounds: 5, correctCount: 3, accuracy: 60, score: 30, summary: 'Recognized 3 of 5 family members correctly (60% accuracy).' },
      { id: 'rpt_2', date: 'Aug 27', timestamp: '11:00 AM', totalRounds: 5, correctCount: 4, accuracy: 80, score: 40, summary: 'Recognized 4 of 5 family members correctly (80% accuracy).' },
      { id: 'rpt_3', date: 'Aug 28', timestamp: '04:30 PM', totalRounds: 5, correctCount: 3, accuracy: 60, score: 30, summary: 'Recognized 3 of 5 family members correctly (60% accuracy).' },
      { id: 'rpt_4', date: 'Aug 29', timestamp: '09:45 AM', totalRounds: 5, correctCount: 5, accuracy: 100, score: 50, summary: 'Recognized 5 of 5 family members correctly (100% accuracy).' },
      { id: 'rpt_5', date: 'Aug 30', timestamp: '02:15 PM', totalRounds: 5, correctCount: 4, accuracy: 80, score: 40, summary: 'Recognized 4 of 5 family members correctly (80% accuracy).' },
    ],
    currentGameCorrect: 0,
    liveLocation: { active: false },
    notifications: [],
    settings: { aiEnabled: true, difficulty: 'Medium' },
  };
}

export function loadAppData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultAppData();
    const parsed = JSON.parse(stored);
    const defaults = getDefaultAppData();
    if (!parsed.images || parsed.images.length === 0) parsed.images = defaults.images;
    if (!parsed.analyticsReports || parsed.analyticsReports.length === 0) parsed.analyticsReports = defaults.analyticsReports;
    return { ...defaults, ...parsed };
  } catch {
    return getDefaultAppData();
  }
}

export function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 17) return 'Good afternoon,';
  return 'Good evening,';
}

export function getCaretakerGreeting(name) {
  const hour = new Date().getHours();
  let timeOfDay = 'morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else if (hour >= 21 || hour < 4) timeOfDay = 'night';
  return { timeOfDay: `Good ${timeOfDay},`, name: name || 'Caretaker' };
}

export function isTodayDate(dateStr) {
  if (!dateStr) return true;
  const todayStr = getTodayStr();
  if (dateStr === todayStr) return true;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0] === todayStr;
    }
  } catch {}
  return false;
}
