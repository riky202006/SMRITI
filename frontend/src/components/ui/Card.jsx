export default function Card({ children, className = '', onClick, style, ...props }) {
  return (
    <div
      className={`card ${className}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
