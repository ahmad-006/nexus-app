import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import useTeamStore from '../../store/teamStore';
import BoardColumn from './BoardColumn';
import KanbanSkeleton from './KanbanSkeleton';
import CreateTicketModal from './CreateTicketModal';
import { Plus } from 'lucide-react';
import { useTeamTickets, useReorderTicket, useCreateTicket } from '../../hooks/useTickets';
import { useTeamDetails } from '../../hooks/useTeams';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

const Workspace = () => {
  const { activeTeamId, isLoading: isTeamLoading } = useTeamStore();
  const { data: tickets = [], isLoading: isTicketsLoading } = useTeamTickets(activeTeamId);
  const { data: teamDetails } = useTeamDetails(activeTeamId);
  const teamMembers = teamDetails?.members || [];
  const reorderTicketMutation = useReorderTicket(activeTeamId);
  const createTicketMutation = useCreateTicket(activeTeamId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleCreateTicket = async (formData) => {
    try {
      await createTicketMutation.mutateAsync(formData);
      setIsCreateModalOpen(false);
    } catch (error) {
      // Error toast is already displayed inside mutation
    }
  };

  const onDragEnd = async (result) => {
    setIsDragging(false);
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;

    // Strict Step-by-Step Transition rule
    const strictTransitions = {
      TODO: ["TODO", "IN_PROGRESS"],
      IN_PROGRESS: ["IN_PROGRESS", "TODO", "DONE"],
      DONE: ["DONE", "IN_PROGRESS"]
    };

    if (!strictTransitions[oldStatus]?.includes(newStatus)) {
      toast.error('Invalid Transition', {
        description: `Tickets must move step-by-step. You cannot jump from ${oldStatus.replace('_', ' ')} directly to ${newStatus.replace('_', ' ')}.`,
      });
      return; 
    }
    
    // 1. Filter tickets for the destination column
    const destColumnTickets = tickets
      .filter(t => t.status === newStatus && t._id !== draggableId)
      .sort((a, b) => a.position - b.position);

    // 2. Calculate the new position
    let newPosition = 1024; 
    
    if (destColumnTickets.length > 0) {
      if (destination.index === 0) {
        newPosition = destColumnTickets[0].position / 2;
      } else if (destination.index >= destColumnTickets.length) {
        newPosition = destColumnTickets[destColumnTickets.length - 1].position + 1024;
      } else {
        const prevTicketPos = destColumnTickets[destination.index - 1].position;
        const nextTicketPos = destColumnTickets[destination.index].position;
        newPosition = (prevTicketPos + nextTicketPos) / 2;
      }
    }

    // 3. Optimistically mutate with TanStack Query
    reorderTicketMutation.mutate({
      draggableId,
      newStatus,
      newPosition,
    });
  };

  // Only show skeleton on first cold load when no cache is present
  if (isTeamLoading || (isTicketsLoading && tickets.length === 0)) {
    return <KanbanSkeleton />;
  }

  if (!activeTeamId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
        <p className="text-slate-500 font-medium">Please select a team to view the workspace.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex-1 overflow-x-auto overflow-y-hidden bg-[#F8F9FA] relative snap-x snap-mandatory flex flex-col">
      {/* Premium subtle dot grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      {/* Board Toolbar (Above Kanban Board) */}
      <div className="px-4 md:px-8 pt-1 pb-3 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Board</h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
            {tickets.length} {tickets.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs md:text-sm font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      <div className="flex-1 flex items-stretch gap-4 md:gap-6 px-4 md:px-8 pb-4 md:pb-8 min-w-max relative z-10 overflow-hidden">
        <DragDropContext 
          onDragStart={() => setIsDragging(true)}
          onDragEnd={onDragEnd}
        >
          {STATUSES.map(status => {
            const columnTickets = tickets
              .filter(t => t.status === status)
              .sort((a, b) => a.position - b.position);
            return (
              <BoardColumn 
                key={status} 
                status={status} 
                tickets={columnTickets}
                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                isDragging={isDragging} 
              />
            );
          })}
        </DragDropContext>
      </div>

      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTicket}
        isSubmitting={createTicketMutation.isPending}
        members={teamMembers}
      />
    </div>
  );
};


export default Workspace;
