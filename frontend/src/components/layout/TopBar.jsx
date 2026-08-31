import { useNavigate } from 'react-router-dom';
import { IconChevronLeft } from '../icons';

export default function TopBar({ title, showBack = true, rightAction = null }) {
  const navigate = useNavigate();

  return (
    <header className="top-bar">
      <div style={{ width: 40, display: 'flex', alignItems: 'center' }}>
        {showBack && (
          <button
            type="button"
            className="icon-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <IconChevronLeft size={24} />
          </button>
        )}
      </div>
      <h1 className="top-bar-title">{title}</h1>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>
        {rightAction}
      </div>
    </header>
  );
}
