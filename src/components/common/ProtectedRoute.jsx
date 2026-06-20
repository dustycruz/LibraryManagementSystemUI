import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.some(r => user.roles.includes(r)))
    return <Navigate to="/dashboard" replace />;

  return children;
}