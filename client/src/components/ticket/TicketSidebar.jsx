import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, 
  User as UserIcon, 
  CircleDashed, 
  CheckCircle2, 
  Clock, 
  ArrowUp, 
  Minus, 
  ArrowDown, 
  ChevronDown,
  Check,
  X,
  UserX
} from 'lucide-react';
import useTeamStore from '../../store/teamStore';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  TODO: { label: 'To Do', icon: CircleDashed, color: 'text-slate-500', bg: 'bg-slate-100' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-slate-800', bg: 'bg-slate-200' },
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

const CustomDropdown = ({ value, options, config, onChange, allowedTransitions, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  useOnClickOutside(ref, () => setIsOpen(false));

  const CurrentIcon = config[value]?.icon || CircleDashed;

  if (disabled) {
    return (
      <div className="flex items-center gap-2 p-1.5">
        <CurrentIcon className={`w-3.5 h-3.5 ${config[value]?.color || 'text-slate-500'}`} />
        <span className={`text-[13px] font-semibold ${config[value]?.color || 'text-slate-700'}`}>
          {config[value]?.label || value}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={ref}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full p-1.5 rounded-md border border-transparent hover:border-slate-200 transition-colors cursor-pointer ${config[value]?.bg || 'hover:bg-slate-50'}`}
      >
        <div className="flex items-center gap-2">
          <CurrentIcon className={`w-3.5 h-3.5 ${config[value]?.color || 'text-slate-500'}`} />
          <span className={`text-[13px] font-semibold ${config[value]?.color || 'text-slate-700'}`}>
            {config[value]?.label || value}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 top-full left-0 mt-1 w-[160px] bg-white rounded-xl border border-slate-200/80 shadow-xl overflow-hidden py-1"
          >
            {options.map((key) => {
              const OptionIcon = config[key]?.icon || CircleDashed;
              const isAllowed = allowedTransitions ? allowedTransitions.includes(key) : true;
              const isCurrent = key === value;
              
              return (
                <button
                  key={key}
                  type="button"
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
                  <OptionIcon className={`w-3.5 h-3.5 mr-2 ${config[key]?.color || 'text-slate-500'}`} />
                  <span className="text-slate-700">{config[key]?.label || key}</span>
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

const AssigneeDropdown = ({ currentAssignee, members, onSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  useOnClickOutside(ref, () => setIsOpen(false));

  const currentId = (currentAssignee?._id || currentAssignee)?.toString();

  if (disabled) {
    return (
      <div className="flex items-center gap-2.5 p-1.5">
        {currentAssignee ? (
          <>
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-200/60 shadow-2xs">
              {currentAssignee.image ? (
                <img src={currentAssignee.image} alt={currentAssignee.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[8px] font-bold text-slate-800">{getInitials(currentAssignee.name)}</span>
              )}
            </div>
            <span className="font-medium text-slate-700 text-[13px]">{currentAssignee.name}</span>
          </>
        ) : (
          <>
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center border-dashed">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="font-medium text-slate-500 text-[13px]">Unassigned</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-1.5 rounded-md border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors text-left cursor-pointer group"
        title="Change assignee"
      >
        <div className="flex items-center gap-2">
          {currentAssignee ? (
            <>
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-200/60 shadow-2xs">
                {currentAssignee.image ? (
                  <img src={currentAssignee.image} alt={currentAssignee.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[8px] font-bold text-slate-800">{getInitials(currentAssignee.name)}</span>
                )}
              </div>
              <span className="text-[13px] font-medium text-slate-800 truncate max-w-[120px]">{currentAssignee.name}</span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center border-dashed">
                <UserIcon className="w-3 h-3 text-slate-400" />
              </div>
              <span className="text-[13px] font-medium text-slate-400">Unassigned</span>
            </>
          )}
        </div>
        <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 top-full left-0 mt-1 w-[200px] bg-white rounded-xl border border-slate-200/80 shadow-xl overflow-hidden py-1"
          >
            <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Assign Operative
            </div>

            {/* Unassigned Option */}
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                setIsOpen(false);
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium transition-colors text-left cursor-pointer hover:bg-slate-50 ${
                !currentAssignee ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-600'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center border-dashed">
                <UserX className="w-2.5 h-2.5 text-slate-400" />
              </div>
              <span>Unassigned</span>
              {!currentAssignee && <Check className="w-3.5 h-3.5 text-slate-900 ml-auto" />}
            </button>

            {/* Team Members List */}
            <div className="max-h-48 overflow-y-auto py-0.5">
              {members.map((member) => {
                const memberUser = member.userId;
                const memberId = (memberUser?._id || memberUser)?.toString();
                if (!memberId) return null;
                const isSelected = currentId === memberId;

                return (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => {
                      onSelect(memberId);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium transition-colors text-left cursor-pointer hover:bg-slate-50 ${
                      isSelected ? 'bg-slate-50 font-semibold text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-200/60 shrink-0">
                      {memberUser?.image ? (
                        <img src={memberUser.image} alt={memberUser.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[7px] font-bold text-slate-800">{getInitials(memberUser?.name)}</span>
                      )}
                    </div>
                    <span className="truncate flex-1">{memberUser?.name || memberUser?.email}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 shrink-0 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DueDatePicker = ({ value, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef();
  useOnClickOutside(ref, () => setIsOpen(false));

  const formattedDate = value ? new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : null;

  const isOverdue = value ? new Date(value) < new Date(new Date().setHours(0, 0, 0, 0)) : false;

  const handleQuickSelect = (daysFromNow) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    onChange(date.toISOString());
    setIsOpen(false);
  };

  const handleNativeChange = (e) => {
    const val = e.target.value;
    if (val) {
      onChange(new Date(val).toISOString());
    } else {
      onChange(null);
    }
    setIsOpen(false);
  };

  const currentInputValue = value ? new Date(value).toISOString().split('T')[0] : '';

  if (disabled) {
    return (
      <div className="flex items-center gap-2 font-medium text-slate-700 p-1.5">
        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
        {formattedDate ? (
          <span className="text-[13px]">{formattedDate}</span>
        ) : (
          <span className="text-slate-400 text-[13px] italic">No Due Date</span>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={ref}>
      <div className="flex items-center justify-between w-full p-1.5 rounded-md border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-colors group">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-left cursor-pointer flex-1"
          title="Change due date"
        >
          <CalendarIcon className={`w-3.5 h-3.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
          {formattedDate ? (
            <span className={`text-[13px] font-medium ${isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-800'}`}>
              {formattedDate}
            </span>
          ) : (
            <span className="text-[13px] font-medium text-slate-400">No Due Date</span>
          )}
        </button>

        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
            title="Clear due date"
          >
            <X className="w-3 h-3" />
          </button>
        ) : (
          <ChevronDown
            onClick={() => setIsOpen(!isOpen)}
            className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-colors cursor-pointer"
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-50 top-full left-0 mt-1 w-[210px] bg-white rounded-xl border border-slate-200/80 shadow-xl overflow-hidden p-2.5 flex flex-col gap-2"
          >
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
              Schedule Due Date
            </div>

            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handleQuickSelect(0)}
                className="px-2 py-1 text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded transition-colors text-center cursor-pointer border border-slate-200/60"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(1)}
                className="px-2 py-1 text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded transition-colors text-center cursor-pointer border border-slate-200/60"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect(7)}
                className="px-2 py-1 text-[11px] font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 rounded transition-colors text-center cursor-pointer border border-slate-200/60"
              >
                +1 Week
              </button>
            </div>

            <div className="pt-1 flex flex-col gap-1">
              <label className="text-[10px] text-slate-400 uppercase font-mono font-medium">Custom Date</label>
              <input
                type="date"
                value={currentInputValue}
                onChange={handleNativeChange}
                className="w-full text-xs font-mono p-1.5 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer"
              />
            </div>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
                className="mt-1 pt-1.5 border-t border-slate-100 text-left text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
              >
                Remove due date
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TicketSidebar = ({ ticket, onUpdate }) => {
  const { activeTeam } = useTeamStore();
  const { user } = useAuthStore();

  const currentMember = activeTeam?.members?.find(m => 
    (m.userId?._id || m.userId)?.toString() === user?._id?.toString()
  );
  const isReporter = (ticket?.reporterId?._id || ticket?.reporterId)?.toString() === user?._id?.toString();
  const canEdit = isReporter || (currentMember && ['admin', 'owner'].includes(currentMember.role));

  const assigneeIdStr = (ticket.assigneeId?._id || ticket.assigneeId)?.toString();
  const assigneeMember = activeTeam?.members?.find(
    (m) => (m.userId?._id || m.userId)?.toString() === assigneeIdStr
  );
  const assignee = assigneeMember?.userId || (ticket.assigneeId && typeof ticket.assigneeId === 'object' ? ticket.assigneeId : null);

  const reporterIdStr = (ticket.reporterId?._id || ticket.reporterId)?.toString();
  const reporterMember = activeTeam?.members?.find(
    (m) => (m.userId?._id || m.userId)?.toString() === reporterIdStr
  );
  const reporter = reporterMember?.userId || (ticket.reporterId && typeof ticket.reporterId === 'object' ? ticket.reporterId : null);

  const teamMembers = activeTeam?.members || [];

  return (
    <aside className="sticky top-6 flex flex-col gap-6 md:border-l md:border-slate-200 md:pl-6">
      
      {/* Properties Ledger */}
      <div className="flex flex-col gap-2">
        <div className="px-4 py-2">
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
          <div className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors border-b border-slate-100/50">
            <span className="w-1/3 font-medium text-slate-500">Assignee</span>
            <div className="w-2/3">
              <AssigneeDropdown
                currentAssignee={assignee}
                members={teamMembers}
                onSelect={(newAssigneeId) => onUpdate({ assigneeId: newAssigneeId })}
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Reporter Row */}
          <div className="flex items-center px-4 py-2.5 hover:bg-slate-50 transition-colors border-b border-slate-100/50">
            <span className="w-1/3 font-medium text-slate-500">Reporter</span>
            <div className="w-2/3 flex items-center gap-2.5">
              {reporter ? (
                <>
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-slate-200/60 shadow-2xs">
                    {reporter.image ? (
                      <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[8px] font-bold text-slate-600">{getInitials(reporter.name)}</span>
                    )}
                  </div>
                  <span className="font-medium text-slate-700 text-[13px]">{reporter.name}</span>
                </>
              ) : (
                <span className="font-medium text-slate-500 text-[13px]">Unknown</span>
              )}
            </div>
          </div>

          {/* Due Date Row */}
          <div className="flex items-center px-4 py-2 hover:bg-slate-50 transition-colors">
            <span className="w-1/3 font-medium text-slate-500">Due Date</span>
            <div className="w-2/3">
              <DueDatePicker
                value={ticket.dueDate}
                onChange={(newDueDate) => onUpdate({ dueDate: newDueDate })}
                disabled={!canEdit}
              />
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
