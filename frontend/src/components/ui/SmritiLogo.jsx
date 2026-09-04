import { IconHeart } from '@/components/icons';

export default function SmritiLogo({
  size = 'large', // 'small' (44px), 'medium' (56px), 'large' (72px), 'sidebar' (38px + brand text)
  subtitle = '',
  className = '',
  style = {},
}) {
  if (size === 'sidebar') {
    return (
      <div className={`smriti-sidebar-brand ${className}`} style={{ display: 'flex', alignItems: 'center', gap: 12, ...style }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary)',
            color: 'var(--white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconHeart size={20} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px', lineHeight: 1.15, margin: 0 }}>
            SMRITI
          </span>
          {subtitle && (
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2, lineHeight: 1.15 }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  const dimensions = {
    small: { box: 44, icon: 22 },
    medium: { box: 56, icon: 28 },
    large: { box: 72, icon: 36 },
  }[size] || { box: 72, icon: 36 };

  return (
    <div
      className={`smriti-logo-badge ${className}`}
      style={{
        width: dimensions.box,
        height: dimensions.box,
        borderRadius: '50%',
        backgroundColor: 'var(--mint-soft)',
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        boxShadow: '0 4px 16px rgba(0, 94, 83, 0.1)',
        flexShrink: 0,
        ...style,
      }}
    >
      <IconHeart size={dimensions.icon} />
    </div>
  );
}
