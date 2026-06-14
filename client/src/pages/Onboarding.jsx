import { useState } from 'react';
import {
  Building2,
  Users,
  Plus,
  ArrowRight,
  CheckCircle2,
  Mail,
  Loader2,
  Kanban,
  Bell,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useMyInvites, useAcceptInviteById, useDeclineInviteById } from '../hooks/useTeams';
import ProvisionWorkspaceModal from '../components/team/ProvisionWorkspaceModal';

export default function Onboarding() {
  const { user } = useAuthStore();
  const { data: myInvites = [], isLoading: isLoadingInvites } = useMyInvites();
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

  const acceptInviteMutation = useAcceptInviteById();
  const declineInviteMutation = useDeclineInviteById();

  const pendingInvites = myInvites.filter((inv) => inv.status === 'PENDING');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      <div className="max-w-3xl w-full space-y-8 animate-in fade-in duration-300">
        
        {/* Welcome Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-xs font-semibold text-slate-700">
            <Sparkles size={13} className="text-slate-900" />
            <span>Workspace Provisioning Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Welcome to NEXUS, {user?.name?.split(' ')[0] || 'Operative'}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            NEXUS operates around collaborative workspaces. To start managing tasks, dispatching tickets, and coordinating with your squad, join an existing team or deploy your first workspace.
          </p>
        </div>

        {/* Section 1: Pending Invitations (If any exist) */}
        {isLoadingInvites ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={24} className="animate-spin mb-2 text-slate-500" />
            <span className="text-xs">Checking for pending workspace authorizations...</span>
          </div>
        ) : pendingInvites.length > 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Mail size={18} className="text-blue-600" />
              <h3>Pending Workspace Invitations ({pendingInvites.length})</h3>
            </div>
            <p className="text-xs text-slate-500">
              You have been authorized to join the following workspaces. Accept an invitation to jump right in.
            </p>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {pendingInvites.map((invite) => (
                <div
                  key={invite._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                      {invite.teamId?.name?.charAt(0).toUpperCase() || 'W'}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {invite.teamId?.name || 'Collaborative Workspace'}
                      </h4>
                      <span className="text-xs text-slate-400">
                        Invited to collaborate as an Operative
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      disabled={declineInviteMutation.isPending || acceptInviteMutation.isPending}
                      onClick={() => declineInviteMutation.mutate(invite._id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                      onClick={() => acceptInviteMutation.mutate(invite._id)}
                      className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {acceptInviteMutation.isPending ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={13} />
                      )}
                      <span>Accept & Enter</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Section 2: Create a Workspace Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
                <Building2 size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Initialize a New Workspace</h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Deploy your organization's board, assign tasks, and invite your engineering team.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsProvisionModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Plus size={16} />
              <span>Deploy Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Kanban size={14} className="text-slate-700" />
                <span>Kanban State Machine</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Step-by-step state enforcement from TODO to DONE with fractional reordering.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <Bell size={14} className="text-slate-700" />
                <span>Socket.io Alert Center</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Real-time Sonner alerts and in-app notifications without page reloads.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <ShieldCheck size={14} className="text-slate-700" />
                <span>Governance & RBAC</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                7-day cryptographic tokens, role promotions, and activity audit logs.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Reusable Provisioning Wizard Modal */}
      <ProvisionWorkspaceModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
      />
    </div>
  );
}
