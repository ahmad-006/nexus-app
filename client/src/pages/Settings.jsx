import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Shield,
  KeyRound,
  Camera,
  Check,
  Copy,
  AlertTriangle,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Briefcase,
  Calendar,
  Mail,
  Loader2,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useMyTeams, useMyInvites, useAcceptInviteById, useDeclineInviteById } from '../hooks/useTeams';
import {
  useUpdateProfile,
  useUploadAvatar,
  useUpdatePassword,
  useDeleteAccount,
} from '../hooks/useUser';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuthStore();
  const { data: myTeams = [], isLoading: isLoadingTeams } = useMyTeams();
  const { data: myInvites = [], isLoading: isLoadingInvites } = useMyInvites();
  const pendingInvites = myInvites.filter((inv) => inv.status === 'PENDING');
  const acceptInviteMutation = useAcceptInviteById();
  const declineInviteMutation = useDeclineInviteById();

  const validTabs = ['profile', 'security', 'teams', 'danger'];
  const tabParam = searchParams.get('tab');
  const activeTab = validTabs.includes(tabParam) ? tabParam : 'profile';

  const setActiveTab = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [isCopiedId, setIsCopiedId] = useState(false);
  const fileInputRef = useRef(null);

  // Synchronize initial name with user store
  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  // Security Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Danger Zone State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInputText, setDeleteInputText] = useState('');

  // Mutations
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const updatePasswordMutation = useUpdatePassword();
  const deleteAccountMutation = useDeleteAccount();

  // Password Validation Rules
  const passwordRules = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    match: newPassword.length > 0 && newPassword === confirmPassword,
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special &&
    passwordRules.match &&
    oldPassword.trim().length > 0;

  // Handlers
  const handleCopyId = () => {
    if (user?._id) {
      navigator.clipboard.writeText(user._id);
      setIsCopiedId(true);
      toast.success('Operative ID copied to clipboard');
      setTimeout(() => setIsCopiedId(false), 2000);
    }
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Only image files (JPG, PNG, WebP) are supported');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    uploadAvatarMutation.mutate(file, {
      onSettled: () => {
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    updateProfileMutation.mutate({ name: name.trim() });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    updatePasswordMutation.mutate(
      {
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      },
      {
        onSuccess: () => {
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  const handleDeleteAccount = () => {
    if (deleteInputText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account removal');
      return;
    }
    deleteAccountMutation.mutate(undefined, {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        navigate('/login');
      },
    });
  };

  const tabs = [
    { id: 'profile', label: 'General Profile', icon: User },
    { id: 'security', label: 'Security & Access', icon: KeyRound },
    { 
      id: 'teams', 
      label: 'Workspaces', 
      icon: Briefcase, 
      count: myTeams.length,
      badge: pendingInvites.length > 0 ? pendingInvites.length : null 
    },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-24">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
          <Shield size={14} className="text-slate-500" />
          Operative Security & System Config
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Manage your operative identity, cryptographic authentication credentials, and workspace memberships.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white shadow-sm animate-pulse">
                  {tab.badge}
                </span>
              )}
              {tab.count !== undefined && !tab.badge && (
                <span
                  className={`ml-1 text-[11px] font-semibold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: General Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Avatar & Identity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-8">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Public Operative Identity</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              This avatar and name are visible across all assigned tickets, team activity logs, and kanban cards.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-100">
              {/* Avatar Uploader Preview */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-900 text-white font-serif font-bold text-3xl flex items-center justify-center overflow-hidden ring-4 ring-slate-100 shadow-md transition-all">
                  {uploadAvatarMutation.isPending ? (
                    <Loader2 size={28} className="animate-spin text-white/80" />
                  ) : user?.image ? (
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>

                {/* Hover Camera Overlay */}
                <button
                  type="button"
                  disabled={uploadAvatarMutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[1px]"
                  title="Change avatar"
                >
                  <Camera size={20} className="mb-0.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">Change</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </div>

              {/* Upload Action & Guidance */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={uploadAvatarMutation.isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {uploadAvatarMutation.isPending ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Uploading to CDN...
                      </>
                    ) : (
                      <>
                        <Camera size={13} />
                        Upload New Photo
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Supported formats: JPG, PNG, GIF, WebP. Up to 5MB. Powered by ImageKit CDN.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Operative Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm"
                    maxLength={60}
                    required
                  />
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[11px] text-slate-400">Min 2, max 60 characters</span>
                    <span className="text-[11px] text-slate-400">{name.length}/60</span>
                  </div>
                </div>

                {/* Email Address (Immutable ID) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Verified Email Address
                    </label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                      <ShieldCheck size={12} />
                      Verified
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-500 bg-slate-50/80 cursor-not-allowed select-all shadow-inner"
                    />
                    <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Primary cryptographic identity. Cannot be changed.
                  </p>
                </div>
              </div>

              {/* Account Metadata Bar */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Operative ID:</span>
                  <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    {user?._id || 'Unknown'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                    title="Copy Operative ID"
                  >
                    {isCopiedId ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>

                {user?.createdAt && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar size={13} />
                    <span>Enrolled: {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {/* Submit Profile */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending || name.trim() === user?.name}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updateProfileMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Security & Access */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-8">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Update Password</h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Ensure your account credentials follow cryptographic complexity requirements.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
              {/* Old Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter strong new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all bg-white shadow-sm pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Requirement Checklist */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Password Complexity Status
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1.5 ${passwordRules.length ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                    {passwordRules.length ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRules.uppercase ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                    {passwordRules.uppercase ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>One uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRules.number ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                    {passwordRules.number ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>One numeric character (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${passwordRules.special ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                    {passwordRules.special ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>One special symbol (!@#$...)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 sm:col-span-2 ${passwordRules.match ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                    {passwordRules.match ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span>Passwords match exactly</span>
                  </div>
                </div>
              </div>

              {/* Submit Password Form */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isPasswordValid || updatePasswordMutation.isPending}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {updatePasswordMutation.isPending && <Loader2 size={15} className="animate-spin" />}
                  Update Authentication Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 3: Workspaces & Memberships */}
      {activeTab === 'teams' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Pending Workspace Invitations Card Deck */}
          {pendingInvites.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 rounded-2xl border border-blue-200/80 shadow-[0_4px_20px_rgba(37,99,235,0.05)] p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Mail size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>Pending Clearances & Invitations</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                        {pendingInvites.length} Action Required
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Workspaces requesting your operative authorization. Accepting will immediately switch your workspace context.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {pendingInvites.map((invite) => (
                  <div
                    key={invite._id}
                    className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm">
                        {invite.teamId?.name?.charAt(0).toUpperCase() || 'W'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {invite.teamId?.name || 'Collaborative Workspace'}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Invited by {invite.inviterId?.name || 'Workspace Management'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Full Operative Access
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            Valid 7 Days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        disabled={declineInviteMutation.isPending || acceptInviteMutation.isPending}
                        onClick={() => declineInviteMutation.mutate(invite._id)}
                        className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                        onClick={() => acceptInviteMutation.mutate(invite._id)}
                        className="flex-1 py-2 px-3 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {acceptInviteMutation.isPending ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Joining...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={13} />
                            <span>Accept & Join</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base font-semibold text-slate-900 mb-1">Your Active Workspaces</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Organizations and operational teams your operative account is authorized to access.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/team')}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto flex items-center gap-1.5"
              >
                <Users size={14} />
                Manage Team Members
              </button>
            </div>

            {isLoadingTeams ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <Loader2 size={24} className="animate-spin mb-2 text-slate-500" />
                <span className="text-xs">Fetching workspace authorizations...</span>
              </div>
            ) : myTeams.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                <Briefcase size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">No active workspace memberships found</p>
                <p className="text-xs text-slate-400 mt-1">
                  You are currently unassigned. Create a workspace or request an invite.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {myTeams.map((team) => {
                  const myMembership = team.members?.find(
                    (m) =>
                      m.userId?._id?.toString() === user?._id?.toString() ||
                      m.userId?.toString() === user?._id?.toString()
                  );
                  const isAdmin = myMembership?.role === 'admin';

                  return (
                    <div
                      key={team._id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 text-sm">{team.name}</span>
                            <span
                              className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                isAdmin
                                  ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {myMembership?.role || 'Member'}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {team.members?.length || 1} Operative{(team.members?.length || 1) !== 1 ? 's' : ''} deployed
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/dashboard');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-sm"
                        >
                          Open Board
                          <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Danger Zone */}
      {activeTab === 'danger' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-2xl border border-red-200/80 shadow-[0_4px_20px_rgba(239,68,68,0.04)] p-6 sm:p-8">
            <div className="flex items-center gap-2.5 text-red-600 mb-2">
              <AlertTriangle size={20} />
              <h2 className="text-base font-bold text-slate-900">Operative Account Deletion</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Permanently delete your NEXUS operative account, credential records, and workspace associations.
              This action is destructive and immediately irreversible.
            </p>

            <div className="p-4 rounded-xl bg-red-50/60 border border-red-200/60 space-y-2 mb-6">
              <p className="text-xs font-semibold text-red-900 uppercase tracking-wider">
                Consequences of Deletion:
              </p>
              <ul className="text-xs text-red-800 space-y-1.5 list-disc list-inside">
                <li>Your operative credentials and authentication tokens will be immediately invalidated.</li>
                <li>You will be removed from all associated teams and organization rosters.</li>
                <li>Any tickets assigned to you will have their assignee status reset to unassigned.</li>
                <li>All profile avatars hosted on ImageKit CDN will become orphaned.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                setDeleteInputText('');
                setIsDeleteModalOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <Trash2 size={15} />
              Delete Operative Account
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Irreversible Deletion</h3>
                <p className="text-xs text-slate-500">Operative: {user?.email}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              To prevent accidental termination, please type <span className="font-mono font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded">DELETE</span> in all capital letters below to confirm.
            </p>

            <input
              type="text"
              value={deleteInputText}
              onChange={(e) => setDeleteInputText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-5"
            />

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteAccountMutation.isPending}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteInputText !== 'DELETE' || deleteAccountMutation.isPending}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {deleteAccountMutation.isPending && <Loader2 size={13} className="animate-spin" />}
                Permanently Terminate Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
