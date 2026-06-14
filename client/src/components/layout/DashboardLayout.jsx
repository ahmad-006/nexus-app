import { useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import FloatingDock from './Sidebar/FloatingDock';
import CommandPill from './Header/CommandPill';
import useAuthStore from '../../store/authStore';
import { useMyTeams } from '../../hooks/useTeams';
import { socket } from '../../api/socket';
import { useNotificationSocket } from '../../hooks/useNotifications';
import Onboarding from '../../pages/Onboarding';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const { teams = [], isLoading: isLoadingTeams } = useMyTeams({
    enabled: isAuthenticated && !!user?.isVerified,
  });

  // Connect WebSocket when authenticated and clean up on unmount / logout
  useEffect(() => {
    if (isAuthenticated) {
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  // Global socket listener for new_notification events
  useNotificationSocket(navigate);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  const isOrphanedUser = !isLoadingTeams && teams.length === 0 && location.pathname !== '/settings';

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] overflow-hidden font-sans selection:bg-slate-200 selection:text-slate-900">
      {/* Spatial UI Overlays */}
      <CommandPill />
      <FloatingDock />
      
      {/* Edge-to-Edge Canvas Area */}
      <main className="relative w-full h-screen overflow-y-auto lg:pl-28 pt-28 pb-28 lg:pb-8 pr-4 pl-4 lg:pr-12">
        <div className="w-full h-full max-w-[1600px] mx-auto">
          {isLoadingTeams && teams.length === 0 ? (
            <div className="h-[70vh] flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin mb-3" />
              <span className="text-xs font-medium tracking-wide">Synchronizing workspace telemetry...</span>
            </div>
          ) : isOrphanedUser ? (
            <Onboarding />
          ) : (
            <Outlet />
          )}
        </div>
      </main>
      
    </div>
  );
};

export default DashboardLayout;
