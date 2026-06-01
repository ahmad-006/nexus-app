import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      {/* Tailwind classes applied globally to ensure full height and modern font */}
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          {/* Public Route */}
          <Route 
            path="/login" 
            element={
              <div className="flex h-screen flex-col items-center justify-center gap-4 text-xl">
                <div>Login Page Placeholder</div>
                <p className="text-sm text-gray-500">Go back to "/" and watch me block you.</p>
              </div>
            } 
          />
          
          {/* Protected Routes Wrapper */}
          <Route element={<ProtectedRoute />}>
            {/* Everything inside here is blocked unless authenticated */}
            <Route 
              path="/" 
              element={
                <div className="flex h-screen items-center justify-center text-3xl font-bold text-blue-600">
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
