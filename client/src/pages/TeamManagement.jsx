import { useState, useMemo } from 'react';
import {
  Users,
  Shield,
  ShieldAlert,
  UserPlus,
  Building2,
  Search,
  MoreVertical,
  Trash2,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Mail,
  Calendar,
  AlertCircle,
  Clock,
  ChevronDown
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTeamStore from '../store/teamStore';
import {
  useMyTeams,
  useTeamDetails,
  useMyInvites,
  usePromoteMember,
  useRemoveMember,
  useTeamActivities
} from '../hooks/useTeams';
import InviteMemberModal from '../components/team/InviteMemberModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const TeamManagement = () => {
  const { user } = useAuthStore();
  const { activeTeamId, setActiveTeamId } = useTeamStore();
  const { teams = [], isLoading: isLoadingTeams } = useMyTeams();
  const { data: teamDetails, isLoading: isLoadingDetails } = useTeamDetails(activeTeamId);
  const { data: myInvites = [] } = useMyInvites();
  const { data: activities = [], isLoading: isLoadingActivities } = useTeamActivities(activeTeamId);

  const promoteMutation = usePromoteMember(activeTeamId);
  const removeMutation = useRemoveMember(activeTeamId);

  // UI States
  const [activeTab, setActiveTab] = useState('MEMBERS'); // 'MEMBERS' | 'ACTIVITIES'
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);

  // RBAC Calculations
  const currentUserId = user?._id;
  const isOwner = teamDetails?.ownerId?.toString() === currentUserId;
  const isCurrentUserAdmin = useMemo(() => {
    if (isOwner) return true;
    return teamDetails?.members?.some(
      (m) => (m.userId?._id || m.userId)?.toString() === currentUserId && m.role === 'admin'
    );
  }, [teamDetails, currentUserId, isOwner]);

  // Filtered and sorted members
  const filteredMembers = useMemo(() => {
    const members = teamDetails?.members || [];
    
    // 1. Filter by search query if any
    let result = members;
    if (searchMemberQuery.trim()) {
      const q = searchMemberQuery.toLowerCase().trim();
      result = members.filter((m) => {
        const u = m.userId;
        return u?.name?.toLowerCase().includes(q) || u?.email?.toLowerCase().includes(q);
      });
    }

    // 2. Sort by role: Owner > Admin > Member (then alphabetically)
    return [...result].sort((a, b) => {
      const aId = (a.userId?._id || a.userId)?.toString();
      const bId = (b.userId?._id || b.userId)?.toString();
      const ownerIdStr = teamDetails?.ownerId?.toString();

      const isAOwner = aId === ownerIdStr;
      const isBOwner = bId === ownerIdStr;

      if (isAOwner && !isBOwner) return -1;
      if (!isAOwner && isBOwner) return 1;

      const isAAdmin = a.role === 'admin';
      const isBAdmin = b.role === 'admin';

      if (isAAdmin && !isBAdmin) return -1;
      if (!isAAdmin && isBAdmin) return 1;

      // Fallback to alphabetical by name or email
      const aName = a.userId?.name || a.userId?.email || '';
      const bName = b.userId?.name || b.userId?.email || '';
      return aName.localeCompare(bName);
    });
  }, [teamDetails, searchMemberQuery]);

  const handlePromote = async (userId) => {
    try {
      await promoteMutation.mutateAsync(userId);
    } catch (err) {
      // Error handled in hook
    }
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    try {
      const targetUserId = (memberToRemove.userId?._id || memberToRemove.userId)?.toString();
      await removeMutation.mutateAsync(targetUserId);
      setMemberToRemove(null);
    } catch (err) {
      // Error handled in hook
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50/50 pt-24 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto w-full">
      
      {/* 1. Workspace Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Workspace Operations
            </span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
              {teamDetails?.members?.length || 0} Operatives
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {teamDetails?.name ? teamDetails.name.charAt(0).toUpperCase() : 'T'}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                className="flex items-center gap-2 text-2xl font-extrabold text-slate-900 tracking-tight hover:text-slate-700 transition-colors group"
              >
                <span>{teamDetails?.name || 'Loading Team...'}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform ${isTeamDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Quick Switcher Dropdown */}
              {isTeamDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-[0_12px_40px_rgb(0,0,0,0.08)] py-2 z-50 animate-in fade-in slide-in-from-top-2 origin-top-left">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Workspace Team
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                    {teams.map((t) => (
                      <button
                        key={t._id}
                        onClick={() => {
                          setActiveTeamId(t._id);
                          setIsTeamDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          t._id === activeTeamId ? 'bg-slate-50/80 font-semibold text-slate-900' : 'text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{t.name}</span>
                        </div>
                        {t._id === activeTeamId && (
                          <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center gap-3">
          {isCurrentUserAdmin && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Invite Operative
            </button>
          )}
        </div>
      </div>

      {/* 2. Pending Invites Banner (if applicable) */}
      {myInvites.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-200/80 flex items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-900">
                You have {myInvites.length} pending workspace {myInvites.length === 1 ? 'invitation' : 'invitations'}
              </p>
              <p className="text-xs text-blue-600">
                Check your email inbox to click the 7-day secure access link and join team workspaces.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between mt-8 mb-6">
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-inner">
          <button
            onClick={() => setActiveTab('MEMBERS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 ${
              activeTab === 'MEMBERS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Operatives
            <span className="text-[10px] text-slate-400 font-normal">
              ({teamDetails?.members?.length || 0})
            </span>
          </button>

          {isCurrentUserAdmin && (
            <button
              onClick={() => setActiveTab('ACTIVITIES')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-1.5 ${
                activeTab === 'ACTIVITIES'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Audit Log
              <span className="text-[10px] text-slate-400 font-normal">
                ({activities.length})
              </span>
            </button>
          )}
        </div>

        {activeTab === 'MEMBERS' && (
          <div className="relative w-64 hidden sm:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter operatives..."
              value={searchMemberQuery}
              onChange={(e) => setSearchMemberQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-sm"
            />
          </div>
        )}
      </div>

      {/* 4. Tab 1: Operatives Directory Table */}
      {activeTab === 'MEMBERS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoadingDetails ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              <span>Loading operatives directory...</span>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-1.5">
              <Users className="w-6 h-6 text-slate-300 mb-1" />
              <p className="font-semibold text-slate-700">No operatives found</p>
              <p className="text-slate-400">
                {searchMemberQuery ? 'Try matching another name or email' : 'Invite members to start collaborating'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Operative</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredMembers.map((member) => {
                    const u = member.userId;
                    const memberId = (u?._id || member.userId)?.toString();
                    const isMemberOwner = teamDetails?.ownerId?.toString() === memberId;
                    const isMemberAdmin = member.role === 'admin' || isMemberOwner;
                    const isCurrentOperative = memberId?.toString() === currentUserId;

                    return (
                      <tr
                        key={memberId}
                        className="hover:bg-slate-50/60 transition-colors group"
                      >
                        {/* Operative Info */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-700 font-bold text-xs shadow-inner">
                              {u?.image ? (
                                <img
                                  src={u.image}
                                  alt={u.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                u?.name?.charAt(0).toUpperCase() || 'U'
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900 truncate text-[13.5px]">
                                  {u?.name || 'Unknown User'}
                                </span>
                                {isCurrentOperative && (
                                  <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-500 truncate block">
                                {u?.email || 'No email attached'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Access Role */}
                        <td className="py-4 px-4">
                          {isMemberOwner ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-slate-900 px-2.5 py-1 rounded-md shadow-sm">
                              <ShieldAlert className="w-3 h-3 text-amber-400" />
                              Owner
                            </span>
                          ) : isMemberAdmin ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                              <Shield className="w-3 h-3 text-slate-600" />
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md">
                              Member
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Active
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          {isCurrentUserAdmin && !isMemberOwner && !isCurrentOperative && (
                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {!isMemberAdmin && (
                                <button
                                  onClick={() => handlePromote(memberId)}
                                  disabled={promoteMutation.isPending}
                                  className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Promote to Workspace Admin"
                                >
                                  Make Admin
                                </button>
                              )}
                              <button
                                onClick={() => setMemberToRemove(member)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remove from Workspace"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Tab 2: Audit Trail Log */}
      {activeTab === 'ACTIVITIES' && isCurrentUserAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Workspace Governance Ledger</h4>
              <p className="text-xs text-slate-500">
                Cryptographic audit trail tracking permission changes, operative joins, and workspace events
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
              AUDIT-V1
            </span>
          </div>

          {isLoadingActivities ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              <span>Fetching audit logs...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-1.5">
              <Clock className="w-6 h-6 text-slate-300 mb-1" />
              <span>No recorded governance actions for this workspace yet</span>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
              {activities.map((act) => (
                <div key={act._id} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-white" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {act.action}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {formatDate(act.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Executed by{' '}
                      <span className="font-semibold text-slate-900">
                        {act.userId?.name || 'System Operative'}
                      </span>
                    </p>
                    {act.details && (
                      <pre className="mt-1 text-[11px] font-mono text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 overflow-x-auto max-w-xl">
                        {JSON.stringify(act.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. Modals */}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        teamId={activeTeamId}
      />

      <ConfirmationModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove Operative from Workspace"
        message={`Are you sure you want to remove ${memberToRemove?.userId?.name || 'this operative'} from ${teamDetails?.name}? They will lose access to all tickets and workspace boards immediately.`}
        confirmText="Remove Operative"
        cancelText="Keep Member"
        isDestructive={true}
      />
    </div>
  );
};

export default TeamManagement;
