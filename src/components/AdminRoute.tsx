import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { FullPageSpinner } from './Spinner';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!isAdmin) return <Navigate to="/home" replace />;

  return <>{children}</>;
}
