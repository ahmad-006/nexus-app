import { Draggable } from '@hello-pangea/dnd';
import PropTypes from 'prop-types';
import { Calendar, MessageSquare, Paperclip, MoreHorizontal, User as UserIcon, ArrowUp, ArrowDown, Minus, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import useTeamStore from '../../store/teamStore';

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
  const { activeTeam } = useTeamStore();

  const assigneeMember = activeTeam?.members?.find(
    (m) => m.userId?._id === ticket.assigneeId || m.userId?.id === ticket.assigneeId
  );
  const assignee = assigneeMember?.userId;

  const reporterMember = activeTeam?.members?.find(
    (m) => m.userId?._id === ticket.reporterId || m.userId?.id === ticket.reporterId
  );
  const reporter = reporterMember?.userId;

  const hasAttachments = ticket.attachments && ticket.attachments.length > 0;
  const priorityBorder = ticket.priority ? CARD_BORDER_STYLES[ticket.priority] : '';
  const ticketId = `NEX-${ticket._id.substring(ticket._id.length - 4).toUpperCase()}`;

  return (
    <Draggable draggableId={ticket._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group flex flex-col bg-white rounded border transition-all duration-200 cursor-grab active:cursor-grabbing overflow-hidden ${priorityBorder} ${
            snapshot.isDragging 
              ? 'border-blue-400 shadow-[0_8px_30px_rgb(37,99,235,0.12)] z-50' 
              : 'border-y-slate-200 border-r-slate-200 hover:border-slate-300 hover:shadow-sm shadow-sm'
          }`}
          style={provided.draggableProps.style}
        >
          <div className="p-3.5 flex flex-col gap-2">
            
            {/* Header: Priority & Ticket ID */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                {ticket.priority && (
                  <div className="relative group/priority" title={`Priority: ${ticket.priority}`}>
                    {PRIORITY_ICONS[ticket.priority]}
                  </div>
                )}
                <span className="text-[11px] font-mono font-medium text-slate-500 tracking-wider">
                  {ticketId}
                </span>
              </div>
              <Link 
                to={`/dashboard/ticket/${ticket._id}`}
                className="text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-blue-50 p-1 opacity-0 group-hover:opacity-100"
                title="Open Issue"
              >
                <ExternalLink size={14} />
              </Link>
            </div>

            {/* Title */}
            <Link to={`/dashboard/ticket/${ticket._id}`} className="hover:underline decoration-blue-500 underline-offset-2 decoration-2 mb-1">
              <h4 className="font-semibold text-slate-900 text-[13px] leading-snug line-clamp-2">
                {ticket.title}
              </h4>
            </Link>
            
            {/* Footer Metrics & Assignee Avatar */}
            <div className="flex items-end justify-between mt-auto pt-3">
              <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
                {hasAttachments && (
                  <div className="relative group/metric flex items-center gap-1 hover:text-slate-600 transition-colors">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{ticket.attachments.length}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/metric:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {ticket.attachments.length} attachments
                    </div>
                  </div>
                )}
                {ticket.commentCount > 0 && (
                  <div className="relative group/metric flex items-center gap-1 hover:text-slate-600 transition-colors">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{ticket.commentCount}</span> 
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/metric:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {ticket.commentCount} comments
                    </div>
                  </div>
                )}
                {ticket.dueDate && (
                  <div className="relative group/metric flex items-center gap-1 hover:text-slate-600 transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[10px] font-medium rounded opacity-0 group-hover/metric:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      Due: {new Date(ticket.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Assignee Avatar */}
              <div className="flex shrink-0 ml-2">
                {assignee ? (
                  <div className="relative group/avatar cursor-pointer">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                      {assignee.image ? (
                        <img src={assignee.image} alt={assignee.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-blue-700">{getInitials(assignee.name)}</span>
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
