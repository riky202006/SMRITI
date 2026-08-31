import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: 'var(--gutter)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: '4px solid var(--mint-soft)',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: 16,
          }}
        />
        <p className="headline-sm" style={{ color: 'var(--primary)' }}>
          Loading Smriti...
        </p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Not logged in -> redirect to root/login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check role protection
  const userRole = profile?.role || 'patient';
  if (allowedRole && userRole !== allowedRole) {
    if (userRole === 'caretaker') {
      return <Navigate to="/caretaker/dashboard" replace />;
    }
    return <Navigate to="/patient/home" replace />;
  }

  return children;
}
