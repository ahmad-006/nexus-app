import { useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import FloatingDock from './Sidebar/FloatingDock';
import CommandPill from './Header/CommandPill';
import CommandPalette from './Header/CommandPalette';
import CreateTicketModal from '../kanban/CreateTicketModal';
import useAuthStore from '../../store/authStore';
import useTeamStore from '../../store/teamStore';
import useCommandStore from '../../store/commandStore';
import { useMyTeams, useTeamDetails } from '../../hooks/useTeams';
import { useCreateTicket } from '../../hooks/useTickets';
import { socket } from '../../api/socket';
import { useNotificationSocket } from '../../hooks/useNotifications';
import { toast } from 'sonner';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { activeTeamId } = useTeamStore();
  const { toggleCommandPalette, isCreateTicketOpen, closeCreateTicket } = useCommandStore();
  const { teams = [], isLoading: isLoadingTeams } = useMyTeams({
    enabled: isAuthenticated && !!user?.isVerified,
  });

  const { data: teamDetails } = useTeamDetails(activeTeamId);
  const members = teamDetails?.members || [];
  const createTicketMutation = useCreateTicket(activeTeamId);

  // Connect WebSocket when authenticated and clean up on unmount / logout
  useEffect(() => {
    if (isAuthenticated) {
      socket.connect();
    }
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  // Global socket listener for new_notification events
  useNotificationSocket(navigate);

  // Global keydown listener for Command Palette (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  const handleCreateTicket = async (formData) => {
    if (!activeTeamId) {
      toast.error('Select a workspace before creating tasks');
      return;
    }
    try {
      await createTicketMutation.mutateAsync(formData);
      closeCreateTicket();
    } catch {
      // Mutation onError handles user-facing error notification
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user && !user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  // If initial load of teams is in flight and we have 0 cached teams
  if (isLoadingTeams && teams.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center text-slate-400 font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-slate-800 animate-spin mb-3" />
        <span className="text-xs font-medium tracking-wide">Synchronizing workspace telemetry...</span>
      </div>
    );
  }

  // STRICT TENANT ISOLATION:
  // If user has 0 workspaces, all dashboard routes are strictly blocked!
  // Hard redirect to the isolated /onboarding route.
  if (!isLoadingTeams && teams.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="relative min-h-screen bg-[#F8F9FA] overflow-hidden font-sans selection:bg-slate-200 selection:text-slate-900">
      {/* Spatial UI Overlays */}
      <CommandPill />
      <FloatingDock />
      <CommandPalette />
      <CreateTicketModal
        isOpen={isCreateTicketOpen}
        onClose={closeCreateTicket}
        onSubmit={handleCreateTicket}
        isSubmitting={createTicketMutation.isPending}
        members={members}
      />

      {/* Edge-to-Edge Canvas Area */}
      <main className="relative w-full h-screen overflow-y-auto lg:pl-28 pt-28 pb-28 lg:pb-8 pr-4 pl-4 lg:pr-12">
        <div className="w-full h-full max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
