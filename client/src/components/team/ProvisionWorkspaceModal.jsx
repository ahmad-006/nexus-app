import { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Zap,
  Globe,
  Plus,
} from 'lucide-react';
import { useCreateTeam } from '../../hooks/useTeams';
import { toast } from 'sonner';

const INDUSTRIES = [
  'Software Engineering',
  'Product & Design',
  'DevOps & Infra',
  'Marketing',
  'Agency',
  'Other',
];

export default function ProvisionWorkspaceModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [industry, setIndustry] = useState('Software Engineering');
  const [description, setDescription] = useState('');
  const [plan, setPlan] = useState('free');
  const [invites, setInvites] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');

  const createTeamMutation = useCreateTeam();

  // Automatically derive slug from name unless manually edited
  useEffect(() => {
    if (!isCustomSlug) {
      const generated = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generated);
    }
  }, [name, isCustomSlug]);

  // Reset form upon close/open
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setName('');
      setSlug('');
      setIsCustomSlug(false);
      setIndustry('Software Engineering');
      setDescription('');
      setPlan('free');
      setInvites([]);
      setInviteEmail('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddInvite = (e) => {
    if (e) e.preventDefault();
    const clean = inviteEmail.toLowerCase().trim();
    if (!clean) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (invites.includes(clean)) {
      toast.error('Operative email already added');
      return;
    }

    setInvites([...invites, clean]);
    setInviteEmail('');
  };

  const handleRemoveInvite = (emailToRemove) => {
    setInvites(invites.filter((e) => e !== emailToRemove));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Workspace name is required');
      setStep(1);
      return;
    }

    createTeamMutation.mutate(
      {
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        industry,
        plan,
        invites,
      },
      {
        onSuccess: (newTeam) => {
          if (onSuccess) onSuccess(newTeam);
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header & Progress Indicator */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Provision New Workspace</h2>
              <p className="text-xs text-slate-500">Step {step} of 4 &bull; Organization Setup</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1 shrink-0">
          <div
            className="bg-slate-900 h-1 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Workspace Identity & Slug */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp, Core Systems, Alpha Studio"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm"
                  maxLength={60}
                  autoFocus
                  required
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Between 2 and 60 characters. This will be your organization's primary display name.
                </span>
              </div>

              {/* URL Slug Preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Workspace URL Identifier
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-500 focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-slate-900 focus-within:bg-white transition-all shadow-inner">
                  <Globe size={14} className="text-slate-400 mr-2 shrink-0" />
                  <span className="text-slate-400 select-none">nexus.app/w/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setIsCustomSlug(true);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    }}
                    placeholder="acme-corp"
                    className="w-full bg-transparent text-slate-900 font-medium focus:outline-none text-sm ml-0.5"
                  />
                </div>
              </div>

              {/* Industry / Purpose Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Primary Domain / Focus
                </label>
                <div className="flex flex-wrap gap-2">
                  {INDUSTRIES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setIndustry(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        industry === item
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Purpose / Mission (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe what this workspace is building..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all resize-none shadow-sm h-20"
                  maxLength={200}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Plan & Tier Selection */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50 duration-200">
              <p className="text-xs text-slate-500 mb-4">
                Select your organization's operational capacity tier. You can upgrade or reconfigure anytime.
              </p>

              {/* Free Starter Tier */}
              <div
                onClick={() => setPlan('free')}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                  plan === 'free'
                    ? 'border-slate-900 bg-slate-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Starter Workspace</span>
                    <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Active Plan
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">$0 / mo</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Ideal for small agile engineering squads, side projects, and startup MVPs.
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Up to 5 Operative seats included</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Full Kanban task boards with drag-and-drop</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    <span>Socket.io live notification center</span>
                  </li>
                </ul>
              </div>

              {/* Pro Scale Tier (Placeholder / Coming Soon) */}
              <div
                onClick={() => {
                  toast.info('Pro Plan billing is scheduled for upcoming release. Starting on Free Tier!');
                }}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 opacity-75 relative cursor-pointer hover:border-slate-300 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">Enterprise Pro</span>
                    <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles size={10} />
                      Coming Soon
                    </span>
                  </div>
                  <span className="font-bold text-slate-500 text-sm">$12 / operative</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Advanced governance, multi-sprint throughput, and cycle time analytics.
                </p>
                <ul className="text-xs text-slate-400 space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-slate-300 shrink-0" />
                    <span>Unlimited operative seats & organizations</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-slate-300 shrink-0" />
                    <span>Advanced Velocity & Productivity analytics</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-slate-300 shrink-0" />
                    <span>50GB ImageKit CDN asset cloud</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 3: Initial Operative Team Invites */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Assemble Your Team</h3>
                <p className="text-xs text-slate-500">
                  Invite collaborators to join your new workspace. Any registered operatives will receive invitations immediately.
                </p>
              </div>

              <form onSubmit={handleAddInvite} className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@example.com"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </form>

              {invites.length > 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Operatives to Invite ({invites.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {invites.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-800 shadow-sm"
                      >
                        <span>{email}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInvite(email)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <Users size={24} className="mx-auto text-slate-300 mb-1" />
                  <p className="text-xs text-slate-400">
                    No operatives added yet. You can invite team members at any time later from /team.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review & Launch */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in-50 duration-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Review & Initialize</h3>
                <p className="text-xs text-slate-500">
                  Confirm your workspace configuration before deploying your collaborative environment.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center shadow-sm">
                    {name.charAt(0).toUpperCase() || 'W'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{name}</h4>
                    <span className="text-xs text-slate-500 font-mono">nexus.app/w/{slug || 'workspace'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Focus Domain</span>
                    <span className="font-semibold text-slate-800">{industry}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">Selected Plan</span>
                    <span className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] bg-slate-200 px-2 py-0.5 rounded">
                      {plan} Tier ($0/mo)
                    </span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200/60">
                    <span className="text-slate-400 block mb-0.5">Initial Operatives</span>
                    <span className="font-semibold text-slate-800">
                      {invites.length > 0
                        ? `${invites.length} operative invitation${invites.length !== 1 ? 's' : ''} queued`
                        : 'Solo deployment (Creator as Admin)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 && name.trim().length < 2}
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <span>{step === 3 && invites.length === 0 ? 'Skip for now' : 'Continue'}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled={createTeamMutation.isPending}
              onClick={handleSubmit}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {createTeamMutation.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Initializing...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Initialize Workspace</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
