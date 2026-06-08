import { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import useTeamStore from '../../store/teamStore';
import axiosInstance from '../../api/axios';
import BoardColumn from './BoardColumn';
import KanbanSkeleton from './KanbanSkeleton';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

const Workspace = () => {
  const { activeTeamId, isLoading: isTeamLoading } = useTeamStore();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeTeamId) return;

    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/tickets/team/${activeTeamId}`);
        setTickets(response.data.data.tickets || []);
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, [activeTeamId]);

  const onDragEnd = async (result) => {
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

    // Transition Rule Check
    const allowedTransitions = {
      TODO: ["TODO", "IN_PROGRESS"],
      IN_PROGRESS: ["IN_PROGRESS", "TODO", "DONE"],
      DONE: ["DONE", "IN_PROGRESS", "TODO"],
    };
    
    // Strict Step-by-Step Transition rule
    const strictTransitions = {
      TODO: ["TODO", "IN_PROGRESS"],
      IN_PROGRESS: ["IN_PROGRESS", "TODO", "DONE"],
      DONE: ["DONE", "IN_PROGRESS"]
    };

    if (!strictTransitions[oldStatus].includes(newStatus)) {
      toast.error('Invalid Transition', {
        description: `Tickets must move step-by-step. You cannot jump from ${oldStatus.replace('_', ' ')} directly to ${newStatus.replace('_', ' ')}.`,
      });
      return; 
    }
    
    // 1. Get current state and filter tickets for the destination column
    let newTickets = Array.from(tickets);
    
    // Sort tickets in the destination column by position to do accurate math
    const destColumnTickets = newTickets
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

    // 3. Optimistically update UI
    const ticketIndex = newTickets.findIndex(t => t._id === draggableId);
    if (ticketIndex > -1) {
      newTickets[ticketIndex] = {
        ...newTickets[ticketIndex],
        status: newStatus,
        position: newPosition
      };
      setTickets(newTickets);
    }

    // 4. Send API Requests
    try {
      if (newStatus !== oldStatus) {
        await axiosInstance.patch(`/tickets/${draggableId}/reorder`, {
          status: newStatus,
          position: newPosition
        });
      } else {
        await axiosInstance.patch(`/tickets/${draggableId}/reorder`, {
          status: newStatus,
          position: newPosition
        });
      }
    } catch (error) {
      console.error("Reorder failed", error);
      const response = await axiosInstance.get(`/tickets/team/${activeTeamId}`);
      setTickets(response.data.data.tickets || []);
    }
  };

  if (isTeamLoading || isLoading) {
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
    <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#F8F9FA] relative snap-x snap-mandatory">
      {/* Premium subtle dot grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      <div className="h-full flex items-stretch gap-4 md:gap-6 p-4 md:p-8 min-w-max relative z-10">
        <DragDropContext onDragEnd={onDragEnd}>
          {STATUSES.map(status => {
            const columnTickets = tickets
              .filter(t => t.status === status)
              .sort((a, b) => a.position - b.position);
            return (
              <BoardColumn 
                key={status} 
                status={status} 
                tickets={columnTickets} 
              />
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
};

export default Workspace;
