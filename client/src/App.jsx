import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import Workspace from './components/kanban/Workspace';
import TicketDetail from './pages/TicketDetail';
import MyTasks from './pages/MyTasks';
import TeamManagement from './pages/TeamManagement';
import AcceptInvite from './pages/AcceptInvite';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import Analytics from './pages/Analytics';
import Messages from './pages/Messages';
import useAuthStore from './store/authStore';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Premium App Shell Skeleton for initial Auth check
const AppShellSkeleton = () => (
  <div className="min-h-screen bg-[#F8F9FA] overflow-hidden">
    {/* Header Skeleton */}
    <div className="fixed top-3 sm:top-4 left-0 right-0 z-40 px-3 sm:px-6 lg:px-8">
      <div className="max-w-[1600px] mx-auto w-full h-12 bg-white/90 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse flex items-center justify-between px-4">
        <div className="w-48 h-6 bg-slate-200/60 rounded-lg"></div>
        <div className="hidden lg:flex gap-2">
          <div className="w-16 h-6 bg-slate-200/60 rounded-lg"></div>
          <div className="w-16 h-6 bg-slate-200/60 rounded-lg"></div>
          <div className="w-16 h-6 bg-slate-200/60 rounded-lg"></div>
        </div>
        <div className="w-40 h-6 bg-slate-200/60 rounded-lg"></div>
      </div>
    </div>

    {/* Main Content Area Skeleton */}
    <div className="absolute inset-0 z-0 pointer-events-none" style={{
      backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}></div>
  </div>
);

function App() {
  const { checkAuth, isCheckingAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <AppShellSkeleton />;
  }

  return (
    <BrowserRouter>
      {/* Premium Toast System */}
      <Toaster position="bottom-right" toastOptions={{
        className: 'bg-slate-900 text-white border-slate-800 shadow-xl font-medium rounded-lg',
      }} />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      {/* Global clean background */}
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
          
          {/* OTP Route (Blocks verified users from seeing it again) */}
          <Route 
            path="/verify-email" 
            element={
              user?.isVerified ? <Navigate to="/dashboard" /> : 
              <VerifyOtp />
            } 
          />
          
          {/* Invitation Acceptance Routes */}
          <Route path="/invitation/accept/:token" element={<AcceptInvite />} />
          <Route path="/accept-invite/:token" element={<AcceptInvite />} />
          
          {/* Isolated Onboarding Route */}
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Protected Routes Wrapper */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Workspace />} />
            <Route path="/dashboard/ticket/:id" element={<TicketDetail />} />
            <Route path="/my-tasks" element={<MyTasks />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
