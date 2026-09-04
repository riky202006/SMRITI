import { useNavigate } from 'react-router-dom';
import { IconChevronLeft } from '../icons';

export default function TopBar({
  title,
  showBack = true,
  onBack,
  rightAction = null,
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="top-bar">
      <div style={{ minWidth: 40, display: 'flex', alignItems: 'center' }}>
        {showBack && (
          <button
            type="button"
            className="icon-btn"
            onClick={handleBack}
            aria-label="Go back"
          >
            <IconChevronLeft size={22} />
          </button>
        )}
      </div>

      <h1 className="top-bar-title">{title}</h1>

      <div style={{ minWidth: 40, display: 'flex', justifyContent: 'flex-end' }}>
        {rightAction}
      </div>
    </header>
  );
}
