import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hexagon, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 403) {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] font-sans">
      {/* Left Side - Brand / Editorial */}
      <div className="hidden lg:flex w-1/2 bg-blue-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-blue-800/40 via-transparent to-transparent"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <Hexagon className="h-8 w-8 text-amber-500" strokeWidth={2.5} />
          <span className="font-serif text-3xl font-bold tracking-tight text-white">NEXUS</span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="font-serif text-5xl italic text-amber-500 mb-6 leading-tight">
            "Focus is not about saying yes. It is about saying no to a hundred other good ideas."
          </h2>
          <p className="text-blue-200 text-lg font-light">
            Welcome back to your sanctuary of deep work.
          </p>
        </div>

        <div className="relative z-10 text-blue-400 text-sm">
          © 2026 NEXUS Workspace
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <Hexagon className="h-8 w-8 text-blue-900" strokeWidth={2.5} />
            <span className="font-serif text-3xl font-bold tracking-tight text-blue-900">NEXUS</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-8">Enter your credentials to access your workspace.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-sm bg-white text-slate-900 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
                placeholder="you@company.com"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-blue-900 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border border-slate-200 rounded-sm bg-white text-slate-900 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-blue-900 text-white py-3.5 font-bold rounded-sm hover:bg-blue-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-blue-900 hover:underline">
              Start for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
