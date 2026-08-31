import Card from '@/components/ui/Card';
import { getGreeting } from '@/services/storage';

export default function HeroCard({ name = 'Ravi Kumar' }) {
  const greeting = getGreeting();
  return (
    <Card style={{
      backgroundColor: 'var(--primary)',
      color: 'var(--white)',
      borderRadius: 'var(--radius-xl)',
      padding: '20px',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
    }}>
      <p className="body-md" style={{ color: 'var(--mint-soft)', fontWeight: 600, margin: 0, fontSize: 13 }}>
        {greeting}
      </p>

      <h2 className="headline-lg" style={{ color: 'var(--white)', margin: '4px 0 10px', fontSize: 24, fontWeight: 700 }}>
        {name} 👋
      </h2>

      <p className="body-md" style={{ color: 'var(--mint-soft)', opacity: 0.95, margin: 0, fontSize: 14, lineHeight: 1.5 }}>
        Hope you are feeling wonderful today. Remember to stay hydrated and check your reminders below.
      </p>
    </Card>
  );
}
