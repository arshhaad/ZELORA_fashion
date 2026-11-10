import { Navigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAdmin();
  const { user: customerUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0B0B0E',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#C6A664',
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '1px'
      }}>
        VERIFYING EXECUTIVE CREDENTIALS...
      </div>
    );
  }

  // Strict role check: Customers cannot access admin portal pages
  if (customerUser && !customerUser.is_staff && !customerUser.is_superuser && !isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location, error: 'Access restricted: Administrator credentials required.' }} replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}

