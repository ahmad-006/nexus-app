import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* We can add more routes here like /login, /signup, /dashboard etc. */}
        <Route path="/dashboard" element={
          <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
            <h1 className="text-3xl font-bold text-[#7cafff]">Nexus Dashboard (Protected)</h1>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
