import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, UserPlus, X, Loader2, Send, ShieldCheck } from 'lucide-react';
import ReactDOM from 'react-dom';
import { useAddTeamMember } from '../../hooks/useTeams';

const InviteMemberModal = ({ isOpen, onClose, teamId }) => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const addMemberMutation = useAddTeamMember(teamId);

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (validationError) {
      setValidationError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setValidationError('Please provide the operative’s email address.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setValidationError('Please provide a valid, complete email address (e.g. operative@nexus.io).');
      return;
    }

    try {
      await addMemberMutation.mutateAsync({ email: cleanEmail });
      setEmail('');
      setValidationError('');
      onClose();
    } catch (err) {
      // Error toast is handled inside the mutation hook
    }
  };

  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', duration: 0.35, bounce: 0.2 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-[0_16px_50px_rgb(0,0,0,0.12)] border border-slate-200 overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Invite Operative</h3>
                    <p className="text-xs text-slate-500">
                      Send a secure workspace access link to an operative
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label
                    htmlFor="operativeEmail"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
                  >
                    Operative Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="operativeEmail"
                      type="email"
                      autoFocus
                      placeholder="e.g. alex.chen@acme.corp"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border ${
                        validationError ? 'border-red-400 focus:ring-red-500/10' : 'border-slate-200 focus:ring-slate-900/10'
                      } rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-slate-900 transition-all`}
                    />
                  </div>
                  {validationError && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {validationError}
                    </p>
                  )}
                </div>

                {/* Privacy & Security Note */}
                <div className="mb-6 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    NEXUS enforces strict domain privacy. Operative registries are never browsable. The recipient must be an existing registered user and will receive a signed 7-day cryptographic invite token via email.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addMemberMutation.isPending || !email.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    {addMemberMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default InviteMemberModal;
