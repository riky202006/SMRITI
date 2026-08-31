export default function IconButton({ icon: Icon, onClick, label, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      onClick={onClick}
      aria-label={label}
      {...props}
    >
      {Icon && <Icon size={24} />}
    </button>
  );
}
