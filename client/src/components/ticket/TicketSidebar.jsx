import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, User as UserIcon, CircleDashed, CheckCircle2, Clock, ArrowUp, Minus, ArrowDown, ChevronDown } from 'lucide-react';
import useTeamStore from '../../store/teamStore';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  TODO: { label: 'To Do', icon: CircleDashed, color: 'text-slate-500', bg: 'bg-slate-100' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  DONE: { label: 'Done', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' }
};

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', icon: ArrowDown, color: 'text-slate-500', bg: 'hover:bg-slate-50' },
  MEDIUM: { label: 'Medium', icon: Minus, color: 'text-amber-600', bg: 'hover:bg-amber-50' },
  HIGH: { label: 'High', icon: ArrowUp, color: 'text-red-600', bg: 'hover:bg-red-50' }
};

const ALLOWED_TRANSITIONS = {
  TODO: ["TODO", "IN_PROGRESS"],
  IN_PROGRESS: ["TODO", "IN_PROGRESS", "DONE"],
  DONE: ["TODO", "IN_PROGRESS", "DONE"]
};

const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
};

// Custom Hook for outside click
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

const CustomDropdown = ({ value, options, config, onChange, allowedTransitions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  useOnClickOutside(ref, () => setIsOpen(false));

  const CurrentIcon = config[value].icon;

  return (
    <div className="relative w-full" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-1.5 rounded-md border border-transparent hover:border-slate-200 transition-colors ${config[value].bg}`}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className={`w-3.5 h-3.5 ${config[value].color}`} />
          <span className={`text-[13px] font-semibold ${config[value].color}`}>{config[value].label}</span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 mt-1 w-[160px] bg-white rounded-xl border border-slate-200/60 shadow-xl overflow-hidden py-1"
          >
            {options.map((key) => {
              const OptionIcon = config[key].icon;
              const isAllowed = allowedTransitions ? allowedTransitions.includes(key) : true;
              const isCurrent = key === value;
              
              return (
                <button
                  key={key}
                  disabled={!isAllowed || isCurrent}
                  onClick={() => {
                    onChange(key);
                    setIsOpen(false);
                  }}
                  className={`flex items-center w-full px-3 py-2 text-[13px] font-medium transition-colors text-left
                    ${!isAllowed ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 cursor-pointer'}
                    ${isCurrent ? 'bg-slate-50/50' : ''}
                  `}
                >
                  <OptionIcon className={`w-3.5 h-3.5 mr-2 ${config[key].color}`} />
                  <span className="text-slate-700">{config[key].label}</span>
                  {!isAllowed && !isCurrent && (
                    <span className="ml-auto text-[9px] text-slate-400 font-normal border border-slate-200 px-1 rounded">Locked</span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TicketSidebar = ({ ticket, onUpdate }) => {
  const { activeTeam } = useTeamStore();

  const assigneeMember = activeTeam?.members?.find(
    (m) => m.userId?._id === ticket.assigneeId || m.userId?.id === ticket.assigneeId
  );
  const assignee = assigneeMember?.userId;

  const reporterMember = activeTeam?.members?.find(
    (m) => m.userId?._id === ticket.reporterId || m.userId?.id === ticket.reporterId
  );
  const reporter = reporterMember?.userId;

  return (
    <aside className="sticky top-6 flex flex-col gap-6">
      
      {/* Properties Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-semibold text-slate-900 text-sm">Properties</h3>
        </div>
        
        <div className="flex flex-col text-[13px]">
          
          {/* Status Row */}
          <div className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100/50">
            <span className="w-1/3 font-medium text-slate-500">Status</span>
            <div className="w-2/3">
              <CustomDropdown 
                value={ticket.status} 
                options={["TODO", "IN_PROGRESS", "DONE"]} 
                config={STATUS_CONFIG}
                onChange={(val) => onUpdate({ status: val })}
                allowedTransitions={ALLOWED_TRANSITIONS[ticket.status]}
              />
            </div>
          </div>

          {/* Priority Row */}
          <div className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100/50">
            <span className="w-1/3 font-medium text-slate-500">Priority</span>
            <div className="w-2/3">
              <CustomDropdown 
                value={ticket.priority} 
                options={["LOW", "MEDIUM", "HIGH"]} 
                config={PRIORITY_CONFIG}
                onChange={(val) => onUpdate({ priority: val })}
              />
            </div>
          </div>

          {/* Assignee Row */}
          <div className="flex items-center px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100/50">
            <span className="w-1/3 font-medium text-slate-500">Assignee</span>
            <div className="w-2/3 flex items-center gap-2.5">
              {assignee ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-slate-200/60 shadow-sm">
                    {assignee.image ? (
                      <img src={assignee.image} alt={assignee.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-blue-700">{getInitials(assignee.name)}</span>
                    )}
                  </div>
                  <span className="font-medium text-slate-700">{assignee.name}</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center border-dashed shadow-sm">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="font-medium text-slate-500">Unassigned</span>
                </>
              )}
            </div>
          </div>

          {/* Reporter Row */}
          <div className="flex items-center px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100/50">
            <span className="w-1/3 font-medium text-slate-500">Reporter</span>
            <div className="w-2/3 flex items-center gap-2.5">
              {reporter ? (
                <>
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-200/60 shadow-sm">
                    {reporter.image ? (
                      <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[9px] font-bold text-slate-600">{getInitials(reporter.name)}</span>
                    )}
                  </div>
                  <span className="font-medium text-slate-700">{reporter.name}</span>
                </>
              ) : (
                <span className="font-medium text-slate-500">Unknown</span>
              )}
            </div>
          </div>

          {/* Due Date Row */}
          <div className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors">
            <span className="w-1/3 font-medium text-slate-500">Due Date</span>
            <div className="w-2/3 flex items-center gap-2 font-medium text-slate-700">
              {ticket.dueDate ? (
                <>
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  {new Date(ticket.dueDate).toLocaleDateString()}
                </>
              ) : (
                <span className="text-slate-400 italic">No Due Date</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Meta Timestamps */}
      <div className="flex flex-col gap-1.5 px-3 text-[11px] text-slate-400 font-medium">
        <p>Created {new Date(ticket.createdAt).toLocaleString()}</p>
        <p>Updated {new Date(ticket.updatedAt).toLocaleString()}</p>
      </div>

    </aside>
  );
};

export default TicketSidebar;
