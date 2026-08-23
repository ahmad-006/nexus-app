import { Outlet, Navigate } from 'react-router-dom';
import FloatingDock from './Sidebar/FloatingDock';
import CommandPill from './Header/CommandPill';
import useAuthStore from '../../store/authStore';

const DashboardLayout = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] overflow-hidden font-sans selection:bg-slate-200 selection:text-slate-900">
      
      {/* 
        Ultra-minimalist canvas:
        No heavy background gradients. Just pure, clean #F8F9FA.
        This provides the highest contrast for the white ticket cards we will build.
      */}

      {/* Spatial UI Overlays */}
      <CommandPill />
      <FloatingDock />
      
      {/* Edge-to-Edge Canvas Area */}
      <main className="relative w-full h-screen overflow-y-auto lg:pl-28 pt-28 pb-28 lg:pb-8 pr-4 pl-4 lg:pr-12">
        <div className="w-full h-full max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
      
    </div>
  );
};

export default DashboardLayout;
