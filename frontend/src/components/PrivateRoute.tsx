
import { Navigate, Outlet } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

export default function PrivateRoute() {
  const token = useUserStore((s) => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
} 