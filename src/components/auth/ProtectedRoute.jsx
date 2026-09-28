import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Acceso Restringido</h2>
        <p>No tienes los permisos requeridos ({requiredRole}) para acceder a este módulo.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
