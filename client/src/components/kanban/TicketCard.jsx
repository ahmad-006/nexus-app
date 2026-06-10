import { Draggable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';
import { Calendar, MessageSquare, Paperclip, MoreHorizontal, User as UserIcon, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useTeamStore from '../../store/teamStore';
import { ticketKeys, fetchTicketDetail, fetchTicketComments } from '../../hooks/useTickets';

const PRIORITY_ICONS = {
  'HIGH': <ArrowUp className="w-4 h-4 text-red-500" />,
  'MEDIUM': <Minus className="w-4 h-4 text-amber-500" />,
  'LOW': <ArrowDown className="w-4 h-4 text-emerald-500" />,
};

const CARD_BORDER_STYLES = {
  'HIGH': 'border-l-[3px] border-l-red-500',
  'MEDIUM': 'border-l-[3px] border-l-amber-500',
  'LOW': 'border-l-[3px] border-l-emerald-500',
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

const TicketCard = ({ ticket, index }) => {
  const queryClient = useQueryClient();
  const { activeTeam } = useTeamStore();

  // Intent-driven prefetching on hover: fetches ticket details & comments ahead of click
  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ticketKeys.detail(ticket._id),
      queryFn: ({ signal }) => fetchTicketDetail(ticket._id, signal),
      staleTime: 1000 * 60 * 2,
    });

    queryClient.prefetchQuery({
      queryKey: ticketKeys.comments(ticket._id),
      queryFn: ({ signal }) => fetchTicketComments(ticket._id, signal),
      staleTime: 1000 * 60 * 2,
    });
  };

  const assigneeMember = activeTeam?.members?.find(
    (m) => m.userId?._id === ticket.assigneeId || m.userId?.id === ticket.assigneeId
  );
  const assignee = assigneeMember?.userId;

  const reporterMember = activeTeam?.members?.find(
    (m) => m.userId?._id === ticket.reporterId || m.userId?.id === ticket.reporterId
  );
  const reporter = reporterMember?.userId;

  const attachmentCount = ticket.attachments?.length || 0;
  const commentCount = ticket.commentCount || 0;
  const priorityBorder = ticket.priority ? CARD_BORDER_STYLES[ticket.priority] : '';
  const ticketId = `NEX-${ticket._id.substring(ticket._id.length - 4).toUpperCase()}`;

  return (
    <Draggable draggableId={ticket._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onMouseEnter={handlePrefetch}
          onFocus={handlePrefetch}
          className={`group flex flex-col shrink-0 min-h-[90px] bg-white rounded border transition-all duration-200 cursor-grab active:cursor-grabbing overflow-hidden ${priorityBorder} ${
            snapshot.isDragging 
              ? 'border-slate-400 shadow-[0_8px_30px_rgba(15,23,42,0.12)] z-50' 
              : 'border-y-slate-200 border-r-slate-200 hover:border-slate-300 hover:shadow-sm shadow-sm'
          }`}
          style={provided.draggableProps.style}
        >
          <div className="p-3 flex flex-col gap-1.5">
            
            {/* Title */}
            <Link to={`/dashboard/ticket/${ticket._id}`} className="hover:underline decoration-slate-400 underline-offset-2 decoration-2">
              <h4 className="font-semibold text-slate-900 text-[13px] leading-snug line-clamp-2 mb-1">
                {ticket.title}
              </h4>
            </Link>

            {/* Metadata: Ticket ID & Priority */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {ticket.priority && (
                <div className="relative group/priority opacity-80" title={`Priority: ${ticket.priority}`}>
                  {PRIORITY_ICONS[ticket.priority]}
                </div>
              )}
              <span className="text-[11px] font-mono font-semibold text-slate-400 tracking-wider uppercase">
                {ticketId}
              </span>
            </div>
            
            {/* Footer Metrics & Assignee Avatar */}
            <div className="flex items-end justify-between mt-auto pt-3">
              <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
                {/* Attachments Metric (Always visible) */}
                <div 
                  className="relative group/metric flex items-center gap-1 hover:text-slate-600 transition-colors cursor-default"
                  title={`${attachmentCount} attachments`}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{attachmentCount}</span>
                  <div className="absolute bottom-full left-0 mb-1.5 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/metric:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                    {attachmentCount} {attachmentCount === 1 ? 'attachment' : 'attachments'}
                  </div>
                </div>

                {/* Comments Metric (Always visible) */}
                <div 
                  className="relative group/metric flex items-center gap-1 hover:text-slate-600 transition-colors cursor-default"
                  title={`${commentCount} comments`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{commentCount}</span> 
                  <div className="absolute bottom-full left-0 mb-1.5 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/metric:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                    {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                  </div>
                </div>

                {/* Due Date (Optional) */}
                {ticket.dueDate && (
                  <div 
                    className="relative group/metric flex items-center gap-1 hover:text-slate-600 transition-colors cursor-default"
                    title={`Due: ${new Date(ticket.dueDate).toLocaleDateString()}`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <div className="absolute bottom-full left-0 mb-1.5 px-2 py-0.5 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/metric:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-md">
                      Due: {new Date(ticket.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Assignee Avatar */}
              <div className="flex shrink-0 ml-2">
                {assignee ? (
                  <div className="relative group/avatar cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shadow-sm">
                      {assignee.image ? (
                        <img src={assignee.image} alt={assignee.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-slate-800">{getInitials(assignee.name)}</span>
                      )}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      Assignee: {assignee.name}
                    </div>
                  </div>
                ) : (
                  <div className="relative group/avatar cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm border-dashed">
                      <UserIcon className="w-3 h-3 text-slate-300" />
                    </div>
                    <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      Unassigned
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

TicketCard.propTypes = {
  ticket: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
};

export default TicketCard;
