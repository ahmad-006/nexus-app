import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = () => {
  // Subscribe to the global Zustand store
  const { isAuthenticated } = useAuthStore();

  // If they try to access a protected URL without logging in, kick them out instantly
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the children components (the Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;
