import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
              <div className="flex h-screen items-center justify-center text-xl">
                Login Page Placeholder
              </div>
            } 
          />
          
          {/* Protected Route (Dashboard) */}
          <Route 
            path="/" 
            element={
              <div className="flex h-screen items-center justify-center text-3xl font-bold text-blue-600">
                NEXUS Dashboard Placeholder
              </div>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
