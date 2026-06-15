import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Sparkles,
  Plus,
  ArrowRight,
  CheckCircle2,
  Mail,
  Loader2,
  Kanban,
  Bell,
  ShieldCheck,
  LogOut,
  Globe,
  Users,
  Layers,
  Cpu,
  Zap,
  TrendingUp,
  X,
  Check,
  Briefcase,
  Shield,
  Clock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import {
  useMyTeams,
  useMyInvites,
  useAcceptInviteById,
  useDeclineInviteById,
  useCreateTeam,
} from '../hooks/useTeams';
import nexusLogo from '../assets/nexus_logo.png';
import { toast } from 'sonner';

const INDUSTRIES = [
  { id: 'Software Engineering', label: 'Software Engineering', icon: Cpu },
  { id: 'Product & Design', label: 'Product & Design', icon: Layers },
  { id: 'DevOps & Infra', label: 'DevOps & Infra', icon: Zap },
  { id: 'Marketing & Growth', label: 'Marketing & Growth', icon: TrendingUp },
  { id: 'Operations', label: 'Operations', icon: Briefcase },
];

export default function Onboarding() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { teams = [], isLoading: isLoadingTeams } = useMyTeams({
    enabled: isAuthenticated && !!user?.isVerified,
  });
  const { data: myInvites = [], isLoading: isLoadingInvites } = useMyInvites();

  const acceptInviteMutation = useAcceptInviteById();
  const declineInviteMutation = useDeclineInviteById();
  const createTeamMutation = useCreateTeam();

  const pendingInvites = myInvites.filter((inv) => inv.status === 'PENDING');

  // Track selection: 'invites' or 'deploy'
  const [activeTab, setActiveTab] = useState('deploy');

  // Form State for Workspace Creation
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [industry, setIndustry] = useState('Software Engineering');
  const [plan, setPlan] = useState('free');
  const [invites, setInvites] = useState([]);
  const [inviteInput, setInviteInput] = useState('');

  // Default to 'invites' if there are pending invitations
  useEffect(() => {
    if (pendingInvites.length > 0) {
      setActiveTab('invites');
    } else {
      setActiveTab('deploy');
    }
  }, [pendingInvites.length]);

  // Derive slug automatically from workspace name
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

  // Authentication & Verification guards
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Telemetry loading during initial team resolution
  if (isLoadingTeams && teams.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center text-slate-400 font-sans">
        <div className="w-9 h-9 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin mb-3" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Synchronizing Workspace Telemetry...
        </span>
      </div>
    );
  }

  // Strict reverse guard: Active operatives belong in the dashboard
  if (!isLoadingTeams && teams.length > 0) {
    return <Navigate to="/dashboard" replace />;
  }

  // Add email chip
  const handleAddInvite = (e) => {
    if (e) e.preventDefault();
    const clean = inviteInput.toLowerCase().trim();
    if (!clean) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      toast.error('Invalid email address format');
      return;
    }

    if (invites.includes(clean)) {
      toast.error('Operative email already added');
      return;
    }

    setInvites([...invites, clean]);
    setInviteInput('');
  };

  const handleRemoveInvite = (emailToRemove) => {
    setInvites(invites.filter((item) => item !== emailToRemove));
  };

  // Deploy Workspace Action
  const handleDeployWorkspace = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error('Workspace name must be at least 2 characters');
      return;
    }

    const payload = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      industry,
      plan,
      invites,
    };

    createTeamMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative flex flex-col font-sans selection:bg-slate-200 selection:text-slate-900 overflow-x-hidden">
      {/* Ambient Radial Gradient Mesh & Precision Dot Matrix */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-100/50 via-slate-100/40 to-transparent blur-3xl opacity-70" />
        <div
          className="absolute inset-0 opacity-[0.65]"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Modern Floating Navigation Bar */}
      <header className="sticky top-4 z-40 px-4 sm:px-8 max-w-7xl w-full mx-auto">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl px-5 py-3 shadow-[0_4px_24px_rgb(0,0,0,0.04)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={nexusLogo} alt="Nexus" className="h-6 object-contain" />
            <span className="text-slate-300 hidden sm:inline">/</span>
            <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200/70 text-[11px] font-semibold text-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway Mode</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
              <div className="w-6 h-6 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-[10px] shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-semibold text-slate-900 text-xs leading-none">{user?.name}</span>
                <span className="text-[10px] text-slate-400 font-mono leading-tight">{user?.email}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/60 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Studio Canvas */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-8 pb-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-sm"
          >
            <Sparkles size={13} className="text-amber-300" />
            <span>Workspace Provisioning Studio</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900"
          >
            Initialize your organization,{' '}
            <span className="font-serif italic font-normal text-slate-500">
              {user?.name?.split(' ')[0] || 'Operative'}.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-500 font-light leading-relaxed"
          >
            Every task, ticket, and telemetry stream inside NEXUS belongs to a collaborative workspace. Join an authorized team or configure your organization's board below.
          </motion.p>

          {/* Segmented Dual-Track Selector (Only shown if pending invites exist) */}
          {pendingInvites.length > 0 && (
            <div className="pt-4 flex justify-center">
              <div className="p-1 bg-slate-200/80 rounded-2xl flex items-center gap-1 border border-slate-300/60 shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveTab('invites')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'invites'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail size={14} className={activeTab === 'invites' ? 'text-blue-600' : ''} />
                  <span>Pending Authorizations</span>
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {pendingInvites.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('deploy')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'deploy'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 size={14} />
                  <span>Deploy Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Switcher: Invitations Track vs Deployment Studio */}
        <AnimatePresence mode="wait">
          {activeTab === 'invites' && pendingInvites.length > 0 ? (
            /* ========================================================================= */
            /* Track 1: Authorization Terminal (Pending Invites)                         */
            /* ========================================================================= */
            <motion.div
              key="invites-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto space-y-4"
            >
              <div className="text-center pb-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  <ShieldCheck size={14} />
                  <span>{pendingInvites.length} Authorization Clearance Ready</span>
                </div>
              </div>

              {pendingInvites.map((invite) => (
                <div
                  key={invite._id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-[0_12px_36px_rgb(0,0,0,0.06)] overflow-hidden transition-all hover:shadow-[0_16px_48px_rgb(0,0,0,0.09)]"
                >
                  {/* Top Security Banner */}
                  <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-slate-300">
                      <Shield size={13} className="text-emerald-400" />
                      <span>OPERATIVE CREDENTIAL // AUTHORIZED</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                      Valid 7 Days
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                        {invite.teamId?.name?.charAt(0).toUpperCase() || 'W'}
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-slate-900">
                          {invite.teamId?.name || 'Collaborative Workspace'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Invited by squad management &bull; Full operative privileges granted.
                        </p>
                      </div>
                    </div>

                    {/* Features included */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>Interactive Kanban</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>Real-time Alerts</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-700">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                        <span>Sprint Telemetry</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="button"
                        disabled={declineInviteMutation.isPending || acceptInviteMutation.isPending}
                        onClick={() => declineInviteMutation.mutate(invite._id)}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Decline Clearance
                      </button>

                      <button
                        type="button"
                        disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                        onClick={() => acceptInviteMutation.mutate(invite._id)}
                        className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer group"
                      >
                        {acceptInviteMutation.isPending ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>Authenticating & Entering Board...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            <span>Accept Clearance & Launch Workspace</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('deploy')}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold underline underline-offset-4 cursor-pointer transition-colors"
                >
                  Need to configure a new workspace instead? Go to Deployment Studio &rarr;
                </button>
              </div>
            </motion.div>
          ) : (
            /* ========================================================================= */
            /* Track 2: Workspace Deployment Studio (Interactive Form + Live Preview)   */
            /* ========================================================================= */
            <motion.div
              key="deploy-view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Interactive Configuration Form (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-[0_12px_40px_rgb(0,0,0,0.05)] p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Workspace Specification</h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Define the identity, slug, and operational limits of your new workspace.
                  </p>
                </div>

                <form onSubmit={handleDeployWorkspace} className="space-y-6">
                  {/* Field 1: Workspace Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                      <span>Workspace Name *</span>
                      <span className="text-[10px] text-slate-400 font-mono font-normal">
                        {name.length}/60 characters
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={60}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alpha Engineering or Acme Product"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                    />
                  </div>

                  {/* Field 2: Custom URL Slug */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Access Slug
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCustomSlug(!isCustomSlug)}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                      >
                        {isCustomSlug ? 'Auto-generate from name' : 'Customize slug'}
                      </button>
                    </div>

                    <div className="flex items-center rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-600 focus-within:ring-2 focus-within:ring-slate-900/10 focus-within:border-slate-900 transition-all font-mono">
                      <Globe size={14} className="mr-2 text-slate-400 shrink-0" />
                      <span className="text-slate-400 select-none">nexus.app/w/</span>
                      <input
                        type="text"
                        disabled={!isCustomSlug}
                        value={slug}
                        onChange={(e) => {
                          setIsCustomSlug(true);
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '')
                          );
                        }}
                        placeholder="your-slug"
                        className="w-full bg-transparent font-mono text-xs font-semibold text-slate-900 focus:outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Field 3: Industry Focus Chips */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Operational Focus
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRIES.map((ind) => {
                        const Icon = ind.icon;
                        const isSelected = industry === ind.id;
                        return (
                          <button
                            key={ind.id}
                            type="button"
                            onClick={() => setIndustry(ind.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <Icon size={13} className={isSelected ? 'text-amber-300' : 'text-slate-400'} />
                            <span>{ind.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Field 4: Plan Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Select Plan Tier
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Free Plan */}
                      <button
                        type="button"
                        onClick={() => setPlan('free')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                          plan === 'free'
                            ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900">Community Squad</span>
                          {plan === 'free' && <Check size={14} className="text-slate-900" />}
                        </div>
                        <span className="text-xs font-bold text-slate-600">Free forever</span>
                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                          Up to 5 operatives &bull; Full Kanban state machine &bull; Real-time Socket.io alerts.
                        </p>
                      </button>

                      {/* Pro Plan Placeholder */}
                      <button
                        type="button"
                        onClick={() => setPlan('pro')}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                          plan === 'pro'
                            ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm text-slate-900">Pro Syndicate</span>
                          {plan === 'pro' && <Check size={14} className="text-slate-900" />}
                        </div>
                        <span className="text-xs font-bold text-blue-600">Early Access Tier</span>
                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                          Up to 25 operatives &bull; Priority audit trails &bull; Advanced velocity telemetry.
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Field 5: Squad Invites (Optional) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center justify-between">
                      <span>Invite Operatives (Optional)</span>
                      <span className="text-[10px] text-slate-400">
                        {invites.length} teammate{invites.length === 1 ? '' : 's'} staged
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={inviteInput}
                        onChange={(e) => setInviteInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddInvite();
                          }
                        }}
                        placeholder="colleague@organization.com"
                        className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleAddInvite}
                        className="px-4 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>Add</span>
                      </button>
                    </div>

                    {invites.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {invites.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-medium"
                          >
                            <Mail size={11} className="text-slate-500" />
                            <span>{email}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveInvite(email)}
                              className="text-slate-400 hover:text-rose-600 ml-0.5 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Primary CTA Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={createTeamMutation.isPending || !name.trim()}
                      className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer group"
                    >
                      {createTeamMutation.isPending ? (
                        <>
                          <Loader2 size={16} className="animate-spin text-white" />
                          <span>Provisioning Workspace & Allocating Tenant...</span>
                        </>
                      ) : (
                        <>
                          <Building2 size={16} />
                          <span>Initialize Workspace & Launch Dashboard</span>
                          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Interactive Workspace Mockup (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Live Telemetry Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Interactive</span>
                </div>

                {/* Simulated Nexus Application Card */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-[0_20px_50px_rgb(0,0,0,0.15)] border border-slate-800 space-y-6">
                  {/* Simulated Browser Chrome */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-slate-800/90 text-[10px] font-mono text-slate-300 border border-slate-700/60 max-w-[200px] truncate">
                      nexus.app/w/{slug || 'my-squad'}
                    </div>
                    <div className="w-8" />
                  </div>

                  {/* Simulated Workspace Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
                        {name ? name.charAt(0).toUpperCase() : 'W'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white truncate max-w-[160px]">
                          {name || 'Workspace Preview'}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                          <span>{industry}</span>
                          <span>&bull;</span>
                          <span className="text-emerald-400 uppercase font-bold">{plan}</span>
                        </div>
                      </div>
                    </div>

                    {/* Member Avatars */}
                    <div className="flex -space-x-2 overflow-hidden">
                      <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      {invites.slice(0, 2).map((_, idx) => (
                        <div
                          key={idx}
                          className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-slate-700 text-[9px] font-bold text-slate-300 flex items-center justify-center"
                        >
                          +1
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Simulated Kanban Columns */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Column 1: TODO */}
                    <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>TODO</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">2</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/80 space-y-1.5 shadow-sm">
                        <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">
                          Configure squad sprint
                        </span>
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                            HIGH
                          </span>
                          <span>#NX-101</span>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: IN PROGRESS */}
                    <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700/50 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                        <span>IN PROGRESS</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">1</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700/80 space-y-1.5 shadow-sm">
                        <span className="text-[11px] font-semibold text-slate-200 line-clamp-1">
                          Deploy tenant nodes
                        </span>
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                            ACTIVE
                          </span>
                          <span>#NX-102</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Guaranteed Architecture Telemetry */}
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Zap size={12} className="text-amber-400" />
                        <span>State Machine Sync</span>
                      </span>
                      <span className="font-mono text-emerald-400 text-[10px]">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Shield size={12} className="text-indigo-400" />
                        <span>Multi-Tenant Partition</span>
                      </span>
                      <span className="font-mono text-emerald-400 text-[10px]">Isolated</span>
                    </div>
                  </div>
                </div>

                {/* Subtle reassurance quote */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
                  <Sparkles size={16} className="text-amber-500 shrink-0" />
                  <span>
                    You will be designated as the <strong>Workspace Owner</strong> with full administrator privileges.
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Subtle Bottom Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-2">
          <span>NEXUS Engineering Engine</span>
          <span>&bull;</span>
          <span>Zero-Trust RBAC Multi-Tenancy</span>
        </div>
      </footer>
    </div>
  );
}

