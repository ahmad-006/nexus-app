import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Building2 } from 'lucide-react';
import { useAcceptInvite } from '../hooks/useTeams';
import useAuthStore from '../store/authStore';

const AcceptInvite = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const acceptInviteMutation = useAcceptInvite();

  const [status, setStatus] = useState('PROCESSING'); // 'PROCESSING' | 'SUCCESS' | 'ERROR'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('ERROR');
      setErrorMessage('No invitation token provided in the link.');
      return;
    }

    if (!isAuthenticated) {
      // If user is not logged in, redirect them to login with a returnUrl or prompt
      return;
    }

    let isMounted = true;

    const processInvitation = async () => {
      try {
        await acceptInviteMutation.mutateAsync(token);
        if (isMounted) {
          setStatus('SUCCESS');
        }
      } catch (err) {
        if (isMounted) {
          setStatus('ERROR');
          setErrorMessage(
            err.response?.data?.message || 'This invitation is invalid, has expired, or was already accepted.'
          );
        }
      }
    };

    processInvitation();

    return () => {
      isMounted = false;
    };
  }, [token, isAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_16px_50px_rgb(0,0,0,0.06)] text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Header */}
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg mx-auto mb-6 shadow-sm">
          NX
        </div>

        {!isAuthenticated ? (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Login to Join Workspace</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Please sign in to your NEXUS account to accept this invitation and access the team workspace.
            </p>
            <Link
              to="/login"
              className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Sign In to Continue
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : status === 'PROCESSING' ? (
          <div className="py-6">
            <Loader2 className="w-8 h-8 text-slate-900 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">Verifying Invitation...</h2>
            <p className="text-xs text-slate-500">
              Validating cryptographic security token and configuring workspace permissions.
            </p>
          </div>
        ) : status === 'SUCCESS' ? (
          <div className="py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Welcome to the Team!</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Your invitation has been verified. You now have full collaborative access to the team's boards, tasks, and discussions.
            </p>
            <button
              onClick={() => navigate('/team')}
              className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              Open Team Workspace
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          <div className="py-4">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Invitation Failed</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {errorMessage}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Go to Workspace
              </button>
              <button
                onClick={() => navigate('/team')}
                className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Building2 size={14} />
                Team Canvas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
