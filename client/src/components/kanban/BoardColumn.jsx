import React, { useRef, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TicketCard from './TicketCard';
import PropTypes from 'prop-types';
import { Plus } from 'lucide-react';

const STATUS_CONFIG = {
  'TODO': { label: 'To Do', dot: 'bg-slate-300' },
  'IN_PROGRESS': { label: 'In Progress', dot: 'bg-blue-500' },
  'DONE': { label: 'Completed', dot: 'bg-emerald-500' }
};

const BoardColumn = ({ status, tickets, onOpenCreateModal, isDragging }) => {
  const config = STATUS_CONFIG[status] || { label: status, dot: 'bg-slate-400' };
  const columnRef = useRef(null);
  const scrollRef = useRef(null);

  // Smooth 60fps auto-scroll during drag-and-drop
  useEffect(() => {
    if (!isDragging) return;

    let animFrameId = null;
    let scrollSpeed = 0; // negative for up, positive for down

    const step = () => {
      if (scrollSpeed !== 0 && scrollRef.current) {
        scrollRef.current.scrollTop += scrollSpeed;
      }
      animFrameId = requestAnimationFrame(step);
    };

    const handlePointerMove = (e) => {
      if (!columnRef.current || !scrollRef.current) return;
      const colRect = columnRef.current.getBoundingClientRect();

      // Check horizontal bounds (with 30px leeway)
      if (e.clientX < colRect.left - 30 || e.clientX > colRect.right + 30) {
        scrollSpeed = 0;
        return;
      }

      const scrollRect = scrollRef.current.getBoundingClientRect();
      const threshold = 120; // active top/bottom scroll zone in px

      // Top scroll zone (from above column header down to threshold into cards)
      if (e.clientY >= colRect.top - 40 && e.clientY <= scrollRect.top + threshold) {
        const distance = Math.max(0, (scrollRect.top + threshold) - e.clientY);
        const intensity = Math.min(1, distance / (threshold + 40));
        scrollSpeed = -Math.round(4 + intensity * 22); // -4px to -26px per frame
      }
      // Bottom scroll zone (from bottom threshold down to below column)
      else if (e.clientY >= scrollRect.bottom - threshold && e.clientY <= colRect.bottom + 40) {
        const distance = Math.max(0, e.clientY - (scrollRect.bottom - threshold));
        const intensity = Math.min(1, distance / (threshold + 40));
        scrollSpeed = Math.round(4 + intensity * 22); // 4px to 26px per frame
      } else {
        scrollSpeed = 0;
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    animFrameId = requestAnimationFrame(step);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (animFrameId) cancelAnimationFrame(animFrameId);
    };
  }, [isDragging]);

  return (
    <div 
      ref={columnRef}
      className="flex flex-col w-[280px] sm:w-[320px] md:w-[340px] shrink-0 snap-center bg-slate-50/50 rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm max-h-full"
    >
      
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
          <button onClick={onOpenCreateModal} className="text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 p-1 rounded-md transition-colors">
            <Plus size={16} />
          </button>
        )}
      </div>
      
      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={(el) => {
              provided.innerRef(el);
              scrollRef.current = el;
            }}
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
          </div>
        )}
      </Droppable>
    </div>
  );
};

BoardColumn.propTypes = {
  status: PropTypes.string.isRequired,
  tickets: PropTypes.array.isRequired,
  onOpenCreateModal: PropTypes.func,
  isDragging: PropTypes.bool
};

export default BoardColumn;
