import { useState, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import useTeamStore from '../../store/teamStore';
import useAuthStore from '../../store/authStore';
import useCommandStore from '../../store/commandStore';
import { useTeamDetails } from '../../hooks/useTeams';
import BoardColumn from './BoardColumn';
import KanbanSkeleton from './KanbanSkeleton';
import { Plus, Search, X, ChevronDown } from 'lucide-react';
import { useTeamTickets, useReorderTicket } from '../../hooks/useTickets';
import useDocumentTitle from '../../hooks/useDocumentTitle';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

const Workspace = () => {
  useDocumentTitle('Kanban Board');
  const { user } = useAuthStore();
  const { activeTeamId, isLoading: isTeamLoading } = useTeamStore();
  const { openCreateTicket } = useCommandStore();
  const { data: tickets = [], isLoading: isTicketsLoading } = useTeamTickets(activeTeamId);
  const { data: teamDetails } = useTeamDetails(activeTeamId);
  const reorderTicketMutation = useReorderTicket(activeTeamId);

  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'
  const [assigneeFilter, setAssigneeFilter] = useState('ALL'); // 'ALL' | 'MY_TASKS' | 'UNASSIGNED' | userId

  const members = teamDetails?.members || [];

  const hasActiveFilters = Boolean(
    searchQuery.trim() || priorityFilter !== 'ALL' || assigneeFilter !== 'ALL'
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('ALL');
    setAssigneeFilter('ALL');
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // 1. Search Query (Title, ID, or ticket key)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = ticket.title?.toLowerCase().includes(q);
        const idMatch = ticket._id?.toLowerCase().includes(q);
        const ticketKey = `nex-${ticket._id?.slice(-4).toLowerCase()}`;
        const keyMatch = ticketKey.includes(q);
        if (!titleMatch && !idMatch && !keyMatch) return false;
      }

      // 2. Priority Filter
      if (priorityFilter !== 'ALL') {
        if (ticket.priority !== priorityFilter) return false;
      }

      // 3. Assignee Filter
      if (assigneeFilter === 'MY_TASKS') {
        const assigneeId = typeof ticket.assigneeId === 'object' ? ticket.assigneeId?._id : ticket.assigneeId;
        if (assigneeId?.toString() !== user?._id?.toString()) return false;
      } else if (assigneeFilter === 'UNASSIGNED') {
        if (ticket.assigneeId) return false;
      } else if (assigneeFilter !== 'ALL') {
        const assigneeId = typeof ticket.assigneeId === 'object' ? ticket.assigneeId?._id : ticket.assigneeId;
        if (assigneeId?.toString() !== assigneeFilter?.toString()) return false;
      }

      return true;
    });
  }, [tickets, searchQuery, priorityFilter, assigneeFilter, user?._id]);

  const onDragEnd = (result) => {
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
    
    // Calculate new position relative to visible cards in destination column
    const destVisibleColumnTickets = filteredTickets
      .filter(t => t.status === newStatus && t._id !== draggableId)
      .sort((a, b) => a.position - b.position);

    let newPosition = 1024; 
    
    if (destVisibleColumnTickets.length > 0) {
      if (destination.index === 0) {
        newPosition = destVisibleColumnTickets[0].position / 2;
      } else if (destination.index >= destVisibleColumnTickets.length) {
        newPosition = destVisibleColumnTickets[destVisibleColumnTickets.length - 1].position + 1024;
      } else {
        const prevTicketPos = destVisibleColumnTickets[destination.index - 1].position;
        const nextTicketPos = destVisibleColumnTickets[destination.index].position;
        newPosition = (prevTicketPos + nextTicketPos) / 2;
      }
    }

    // Optimistically mutate with TanStack Query
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
      {/* Subtle dot grid background */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      {/* Board Toolbar & Filters Header */}
      <div className="px-4 md:px-8 pt-2 pb-3.5 flex flex-col gap-2.5 z-10 shrink-0">
        
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Board</h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              ({tickets.length})
            </span>
            {hasActiveFilters && (
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 tabular-nums">
                {filteredTickets.length} visible
              </span>
            )}
          </div>

          <button
            onClick={openCreateTicket}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          
          {/* Search Input */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tickets..."
              className="w-44 sm:w-56 h-7.5 pl-8 pr-7 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 p-0.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Priority Segmented Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 h-7.5">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => {
              const isActive = priorityFilter === p;
              const label = p === 'ALL' ? 'All Priority' : p === 'HIGH' ? 'High' : p === 'MEDIUM' ? 'Med' : 'Low';
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriorityFilter(p)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Assignee Selector Dropdown */}
          <div className="relative">
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="h-7.5 pl-2.5 pr-6 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 font-medium hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 cursor-pointer transition-colors appearance-none"
            >
              <option value="ALL">All Assignees</option>
              <option value="MY_TASKS">Assigned to Me</option>
              <option value="UNASSIGNED">Unassigned</option>
              {members.length > 0 && <option disabled>──────────</option>}
              {members.map((m) => {
                const memberUser = m.userId;
                const memberId = (memberUser?._id || memberUser)?.toString();
                if (!memberId || memberId === user?._id?.toString()) return null;
                return (
                  <option key={memberId} value={memberId}>
                    {memberUser?.name || memberUser?.email || 'Operative'}
                  </option>
                );
              })}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
          </div>

          {/* Reset Filters Trigger */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="h-7.5 px-2 text-[11px] font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 border border-transparent hover:border-slate-200"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}

        </div>
      </div>

      {/* Kanban Board Columns Area */}
      <div className="flex-1 flex items-stretch gap-4 md:gap-6 px-4 md:px-8 pb-4 md:pb-8 min-w-max relative z-10 overflow-hidden">
        <DragDropContext 
          onDragStart={() => setIsDragging(true)}
          onDragEnd={onDragEnd}
        >
          {STATUSES.map(status => {
            const columnTickets = filteredTickets
              .filter(t => t.status === status)
              .sort((a, b) => a.position - b.position);
            return (
              <BoardColumn 
                key={status} 
                status={status} 
                tickets={columnTickets}
                onOpenCreateModal={openCreateTicket}
                isDragging={isDragging} 
                isFiltered={hasActiveFilters}
              />
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
};

export default Workspace;
