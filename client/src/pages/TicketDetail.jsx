import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTeamStore from '../store/teamStore';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import TicketNarrative from '../components/ticket/TicketNarrative';
import TicketSidebar from '../components/ticket/TicketSidebar';
import TicketDetailSkeleton from '../components/ticket/TicketDetailSkeleton';
import TicketActivity from '../components/ticket/TicketActivity';
import { useTicketDetail, useUpdateTicket, useDeleteTicket } from '../hooks/useTickets';
import { useQueryClient } from '@tanstack/react-query';
import { ticketKeys } from '../api/queryKeys';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { activeTeam } = useTeamStore();

  const { data: ticket, isLoading, error } = useTicketDetail(id, activeTeam?._id);
  const updateTicketMutation = useUpdateTicket(id, activeTeam?._id);
  const deleteTicketMutation = useDeleteTicket(id, activeTeam?._id);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const currentMember = activeTeam?.members?.find(m => 
    (m.userId?._id === user?._id) || (m.userId === user?._id)
  );
  const isReporter = ticket?.reporterId === user?._id;
  const canDelete = isReporter || (currentMember && ['admin', 'owner'].includes(currentMember.role));

  const handleDeleteTicket = async () => {
    try {
      await deleteTicketMutation.mutateAsync();
      setIsDeleteModalOpen(false);
      navigate("/dashboard");
    } catch (err) {
      // Handled in mutation
    }
  };

  const handleOptimisticUpdate = async (updateData) => {
    // If updating attachments, update cache directly since they are already saved via POST /attachments
    if (updateData.attachments) {
      queryClient.setQueryData(ticketKeys.detail(id), (prev) => {
        if (!prev) return prev;
        return { ...prev, attachments: updateData.attachments };
      });
      if (activeTeam?._id) {
        queryClient.setQueryData(ticketKeys.list(activeTeam._id), (prevTickets = []) => {
          return prevTickets.map((t) =>
            t._id === id ? { ...t, attachments: updateData.attachments } : t
          );
        });
      }
      return;
    }

    updateTicketMutation.mutate(updateData);
  };

  if (isLoading && !ticket) {
    return <TicketDetailSkeleton />;
  }

  if (error || !ticket) {
    return (
      <div className="h-full w-full bg-[#F8F9FA] flex flex-col items-center justify-center gap-4 relative">
        <div className="absolute inset-0 z-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}></div>
        <p className="text-slate-500 font-medium z-10">{error || "Ticket not found"}</p>
        <Link to="/dashboard" className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors z-10">
          Return to Board
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F9FA] relative">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Consolidated Top Navigation */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
            <Link 
              to="/dashboard" 
              className="inline-flex items-center gap-2 hover:text-slate-900 transition-colors bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Board
            </Link>
            <span className="text-slate-300">|</span>
            <span className="hover:text-slate-900 cursor-pointer transition-colors">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              {`NEX-${ticket._id.substring(ticket._id.length - 4).toUpperCase()}`}
            </span>
          </div>

          {canDelete && (
            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
              <Trash2 className="w-4 h-4" />
              Delete Ticket
            </button>
          )}
        </div>

        {/* 70/30 Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Group */}
          <div className="md:col-span-8 flex flex-col gap-8 w-full">
            <TicketNarrative ticket={ticket} onUpdate={handleOptimisticUpdate} />
            
            {/* Mobile Properties Ledger (Hidden on Desktop) */}
            <div className="block md:hidden">
              <TicketSidebar ticket={ticket} onUpdate={handleOptimisticUpdate} />
            </div>

            {/* Real-time Activity Thread */}
            <TicketActivity ticketId={ticket._id} teamId={activeTeam?._id} />
          </div>

          {/* Right Sidebar Group (Hidden on Mobile) */}
          <div className="hidden md:block md:col-span-4 w-full">
            <TicketSidebar ticket={ticket} onUpdate={handleOptimisticUpdate} />
          </div>

        </div>

      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteTicket}
        title="Delete Ticket"
        message={`Are you sure you want to delete this ticket? This action cannot be undone.`}
        confirmText={deleteTicketMutation.isPending ? "Deleting..." : "Delete"}
        isDestructive={true}
      />
    </div>
  );
};

export default TicketDetail;
