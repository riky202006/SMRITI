import Card from '@/components/ui/Card';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning ☀️';
  if (hour < 17) return 'Good Afternoon 🌤️';
  return 'Good Evening 🌙';
}

export default function HeroCard({ name }) {
  const greeting = getGreeting();
  const displayName = name ? `${name} 👋` : 'Welcome 👋';

  return (
    <Card style={{
      backgroundColor: 'var(--primary)',
      color: 'var(--white)',
      borderRadius: 'var(--radius-xl)',
      padding: '24px',
      boxShadow: '0 8px 24px rgba(0, 94, 83, 0.16)',
      border: 'none',
    }}>
      <p style={{ color: 'var(--mint-soft)', fontWeight: 600, margin: 0, fontSize: 14 }}>
        {greeting}
      </p>

      <h2 style={{ color: 'var(--white)', margin: '6px 0 10px', fontSize: 'clamp(22px, 3.5vw, 28px)', fontWeight: 800 }}>
        {displayName}
      </h2>

      <p style={{ color: 'var(--mint-soft)', opacity: 0.95, margin: 0, fontSize: 15, lineHeight: 1.5 }}>
        Hope you are feeling wonderful today. Remember to stay hydrated and check your reminders below.
      </p>
    </Card>
  );
}
