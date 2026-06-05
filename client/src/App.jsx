import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import Workspace from './components/kanban/Workspace';
import useAuthStore from './store/authStore';

// Premium App Shell Skeleton for initial Auth check
const AppShellSkeleton = () => (
  <div className="min-h-screen bg-[#F8F9FA] overflow-hidden">
    {/* Header Skeleton */}
    <div className="fixed top-6 left-0 right-0 z-40 flex justify-between items-center px-4 sm:px-6 lg:px-12">
      <div className="hidden sm:block w-64 h-10 bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm animate-pulse"></div>
      <div className="w-full max-w-lg h-12 bg-white/90 rounded-full border border-slate-200/80 shadow-sm animate-pulse"></div>
      <div className="w-32 h-10 bg-white/80 rounded-2xl border border-slate-200/60 shadow-sm animate-pulse"></div>
    </div>
    
    {/* Sidebar Skeleton */}
    <div className="fixed top-1/2 -translate-y-1/2 left-6 z-50">
      <div className="w-14 h-96 bg-white/80 rounded-3xl border border-slate-200/60 shadow-sm animate-pulse"></div>
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
          
          {/* Protected Routes Wrapper */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Workspace />} />
            <Route path="/team" element={
              <div className="h-full w-full rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 flex items-center justify-center">
                <p className="text-slate-400 font-medium tracking-wide">Team Management Canvas</p>
              </div>
            } />
            <Route path="/analytics" element={
              <div className="h-full w-full rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 flex items-center justify-center">
                <p className="text-slate-400 font-medium tracking-wide">Analytics Canvas</p>
              </div>
            } />
            <Route path="/settings" element={
              <div className="h-full w-full rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 flex items-center justify-center">
                <p className="text-slate-400 font-medium tracking-wide">Settings Canvas</p>
              </div>
            } />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
