import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import PageLoader from './components/ui/PageLoader';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import useAuthStore from './store/authStore';

function App() {
  const { checkAuth, isCheckingAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return <PageLoader />;
  }

  return (
    <BrowserRouter>
      {/* Global clean background */}
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
          
          {/* OTP Route (Requires login, but blocks verified users from seeing it again) */}
          <Route 
            path="/verify-email" 
            element={
              !isAuthenticated ? <Navigate to="/login" /> : 
              user?.isVerified ? <Navigate to="/dashboard" /> : 
              <VerifyOtp />
            } 
          />
          
          {/* Protected Routes Wrapper */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={
              <div className="h-full w-full rounded-2xl border-2 border-dashed border-slate-200 bg-white/50 flex items-center justify-center">
                <p className="text-slate-400 font-medium tracking-wide">Kanban Board Canvas</p>
              </div>
            } />
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
