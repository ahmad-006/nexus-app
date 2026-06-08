import { Droppable } from '@hello-pangea/dnd';
import TicketCard from './TicketCard';
import PropTypes from 'prop-types';
import { Plus } from 'lucide-react';

const STATUS_CONFIG = {
  'TODO': { label: 'To Do', dot: 'bg-slate-300' },
  'IN_PROGRESS': { label: 'In Progress', dot: 'bg-blue-500' },
  'DONE': { label: 'Completed', dot: 'bg-emerald-500' }
};

const BoardColumn = ({ status, tickets }) => {
  const config = STATUS_CONFIG[status] || { label: status, dot: 'bg-slate-400' };

  return (
    <div className="flex flex-col w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-center bg-slate-50/50 rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm max-h-full">
      
      {/* Column Header */}
      <div className="p-4 border-b border-slate-200/50 bg-white/50 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <h3 className="font-semibold text-slate-900 text-sm">
            {config.label}
          </h3>
          <span className="bg-slate-200/70 text-slate-600 text-[10px] font-bold py-0.5 px-2 rounded-full">
            {tickets.length}
          </span>
        </div>
        
        {status === 'TODO' && (
          <button className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 p-1 rounded-md transition-colors">
            <Plus size={16} />
          </button>
        )}
      </div>
      
      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 transition-colors duration-300 flex flex-col gap-3 overflow-y-auto custom-scrollbar ${
              snapshot.isDraggingOver ? 'bg-blue-50/30' : ''
            }`}
          >
            {tickets.map((ticket, index) => (
              <TicketCard 
                key={ticket._id} 
                ticket={ticket} 
                index={index} 
              />
            ))}
            {provided.placeholder}
            
            {/* Elegant Empty State */}
            {tickets.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-200/60 rounded-xl my-2">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  {status === 'TODO' && <div className="w-5 h-5 border-2 border-slate-300 rounded-sm" />}
                  {status === 'IN_PROGRESS' && <div className="w-5 h-5 border-2 border-blue-300 rounded-sm" />}
                  {status === 'DONE' && <div className="w-5 h-5 border-2 border-emerald-300 rounded-sm bg-emerald-100" />}
                </div>
                <h4 className="text-sm font-semibold text-slate-700 mb-1">
                  {status === 'TODO' && 'No tasks yet'}
                  {status === 'IN_PROGRESS' && 'Nothing in progress'}
                  {status === 'DONE' && 'No completed tasks'}
                </h4>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[200px]">
                  {status === 'TODO' && 'Click the Add Task button below to create your first ticket.'}
                  {status === 'IN_PROGRESS' && 'Drag a ticket here from the To Do column when you are ready to start working.'}
                  {status === 'DONE' && 'Drag a ticket here once you have completely finished it.'}
                </p>
              </div>
            )}

            {/* Empty State / Add bottom button */}
            {status === 'TODO' && (
              <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-400 hover:text-slate-600 hover:border-slate-400 hover:bg-slate-100/50 transition-all text-sm font-medium mt-auto">
                <Plus size={16} /> Add Task
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

BoardColumn.propTypes = {
  status: PropTypes.string.isRequired,
  tickets: PropTypes.array.isRequired
};

export default BoardColumn;
