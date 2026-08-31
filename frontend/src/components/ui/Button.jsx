export default function Button({
  children,
  variant = 'primary', // primary | secondary | outline | danger
  size = 'large',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  ...props
}) {
  const variantClass = `btn-${variant}`;
  return (
    <button
      type={type}
      className={`btn ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
