import SidebarNav from './SidebarNav';
import BottomNav from './BottomNav';

export default function AppLayout({
  children,
  mode = 'patient',
  showNav = true,
  fullWidth = false,
}) {
  return (
    <div className="app-shell">
      {showNav && <SidebarNav mode={mode} />}

      <div className="app-main-wrapper">
        <main
          className={fullWidth ? '' : 'app-container'}
          style={fullWidth ? { flex: 1, display: 'flex', flexDirection: 'column', width: '100%' } : {}}
        >
          {children}
        </main>

        {showNav && <BottomNav mode={mode} />}
      </div>
    </div>
  );
}
