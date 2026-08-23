import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Hexagon, Loader2, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';

const VerifyOtp = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const resendOtp = useAuthStore((state) => state.resendOtp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (!emailParam) {
      navigate('/signup');
    }
  }, [emailParam, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      return setError('Please enter a 6-digit code.');
    }
    try {
      await verifyOtp(emailParam, otp);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError(null);
    setSuccessMsg(null);
    try {
      await resendOtp(emailParam);
      setSuccessMsg('A new code has been sent to your email.');
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] font-sans">
      {/* Left Side - Graphic/Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#F8F9FA] flex-col justify-between p-12 relative overflow-hidden border-r border-slate-200">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-200/50 via-transparent to-transparent"></div>
        
        <Link to="/" className="relative z-10 flex items-center gap-3 hover:opacity-90 transition-opacity w-fit">
          <Hexagon className="h-8 w-8 text-slate-900" strokeWidth={2.5} />
          <span className="font-serif text-3xl font-bold tracking-tight text-slate-900">NEXUS</span>
        </Link>

        <div className="relative z-10 max-w-lg">
          <h2 className="font-serif text-5xl italic text-slate-900 mb-6 leading-tight">
            "Security is not a product, but a process."
          </h2>
          <p className="text-slate-500 text-lg font-light">
            We employ military-grade verification to ensure your workspace remains a sanctuary.
          </p>
        </div>

        <div className="relative z-10 text-slate-400 text-sm">
          © 2026 NEXUS Workspace
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity w-fit">
            <Hexagon className="h-8 w-8 text-blue-900" strokeWidth={2.5} />
            <span className="font-serif text-3xl font-bold tracking-tight text-blue-900">NEXUS</span>
          </Link>

          <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-blue-900 uppercase tracking-wider mb-8 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Check your email</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            We sent a 6-digit verification code to <br/>
            <span className="font-bold text-slate-800">{emailParam}</span>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-sm">
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider" htmlFor="otp">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-4 border border-slate-200 rounded-sm bg-white text-slate-900 text-2xl font-bold tracking-[0.5em] text-center focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-colors"
                placeholder="------"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-blue-900 text-white font-bold py-3.5 rounded-sm hover:bg-blue-800 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Account"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={!canResend || isLoading}
              className={`font-medium ${canResend ? 'text-blue-900 hover:underline cursor-pointer' : 'text-slate-400 cursor-not-allowed'}`}
            >
              {canResend ? 'Click to resend' : `Resend in ${countdown}s`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
