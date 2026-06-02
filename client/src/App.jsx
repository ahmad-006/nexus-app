import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import useAuthStore from './store/authStore';
import { Loader2 } from 'lucide-react';

function App() {
  const { checkAuth, isCheckingAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Global warm background and text colors */}
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
          
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/verify-email" element={!isAuthenticated ? <VerifyOtp /> : <Navigate to="/dashboard" />} />
          
          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute />}>
            {/* The actual workspace is moved to /dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <div className="flex h-screen items-center justify-center text-3xl font-bold text-rose-600">
                  NEXUS Dashboard Placeholder (PROTECTED)
                </div>
              } 
            />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
