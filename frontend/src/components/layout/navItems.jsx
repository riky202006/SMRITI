export const patientNavItems = [
  {
    to: '/patient/home',
    label: 'Home',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 11l9-8 9 8" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    to: '/patient/games',
    label: 'Games',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4a3 3 0 013 3v1a3 3 0 010 6h-1a3 3 0 01-3 3M12 4a3 3 0 00-3 3v1a3 3 0 000 6h1a3 3 0 003 3" />
        <path d="M12 4v13" />
      </svg>
    ),
  },
  {
    to: '/patient/medications',
    label: 'Meds',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M3 8l9-5 9 5" />
      </svg>
    ),
  },
  {
    to: '/patient/stats',
    label: 'Stats',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 15l4-5 3 3 5-7" />
      </svg>
    ),
  },
  {
    to: '/patient/account',
    label: 'Account',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export const caretakerNavItems = [
  {
    to: '/caretaker/dashboard',
    label: 'Home',
    end: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    to: '/caretaker/memory',
    label: 'Games',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 4a3 3 0 013 3v1a3 3 0 010 6h-1a3 3 0 01-3 3M12 4a3 3 0 00-3 3v1a3 3 0 000 6h1a3 3 0 003 3" />
      </svg>
    ),
  },
  {
    to: '/caretaker/visits',
    label: 'Visits',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M3 9h18M8 2v4M16 2v4" />
      </svg>
    ),
  },
  {
    to: '/caretaker/medications',
    label: 'Meds',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="8" width="18" height="12" rx="2" />
        <path d="M3 8l9-5 9 5" />
      </svg>
    ),
  },
  {
    to: '/caretaker/analytics',
    label: 'Stats',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 3v18h18" />
        <path d="M7 15l4-5 3 3 5-7" />
      </svg>
    ),
  },
];
