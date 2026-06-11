import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckSquare, 
  UserCheck, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  Calendar, 
  Paperclip, 
  MessageSquare, 
  ArrowUp, 
  ArrowDown, 
  Minus,
  Inbox
} from 'lucide-react';
import { useMyUserTickets } from '../hooks/useTickets';

const PRIORITY_CONFIG = {
  HIGH: {
    icon: <ArrowUp className="w-3.5 h-3.5 text-red-500" />,
    label: 'High Priority',
  },
  MEDIUM: {
    icon: <Minus className="w-3.5 h-3.5 text-amber-500" />,
    label: 'Medium Priority',
  },
  LOW: {
    icon: <ArrowDown className="w-3.5 h-3.5 text-emerald-500" />,
    label: 'Low Priority',
  },
};

const STATUS_CONFIG = {
  TODO: {
    label: 'To Do',
    pillClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    pillClass: 'bg-amber-50 text-amber-700 border-amber-200/60',
    dotClass: 'bg-amber-500',
  },
  DONE: {
    label: 'Done',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    dotClass: 'bg-emerald-500',
  },
};

const MyTasksSkeleton = () => (
  <div className="flex flex-col gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
    <div className="flex items-center justify-between pb-6 border-b border-slate-200/60">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200"></div>
        <div className="flex flex-col gap-2">
          <div className="w-48 h-6 bg-slate-200 rounded"></div>
          <div className="w-32 h-4 bg-slate-100 rounded"></div>
        </div>
      </div>
      <div className="w-64 h-10 bg-slate-100 rounded-xl"></div>
    </div>
    {[1, 2].map((teamIdx) => (
      <div key={teamIdx} className="bg-white rounded-2xl border border-slate-200/70 p-6 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-slate-200"></div>
          <div className="w-36 h-5 bg-slate-200 rounded"></div>
          <div className="w-12 h-5 bg-slate-100 rounded-full"></div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          {[1, 2, 3].map((rowIdx) => (
            <div key={rowIdx} className="h-14 rounded-xl bg-slate-50 border border-slate-100"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const MyTasks = () => {
  const { data, isLoading } = useMyUserTickets();
  const [activeTab, setActiveTab] = useState('ASSIGNED'); // 'ASSIGNED' | 'REPORTED'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedTeams, setCollapsedTeams] = useState({});

  const toggleTeamCollapse = (teamId) => {
    setCollapsedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  // Select team groups based on active primary tab
  const activeTeamsGrouped = useMemo(() => {
    if (!data) return [];
    return activeTab === 'ASSIGNED' 
      ? data.assignedTeamsGrouped 
      : data.reportedTeamsGrouped;
  }, [data, activeTab]);

  // Filter tickets by search query and status filter
  const filteredTeams = useMemo(() => {
    if (!activeTeamsGrouped) return [];

    return activeTeamsGrouped
      .map((teamGroup) => {
        const matchingTickets = teamGroup.tickets.filter((ticket) => {
          const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
          const query = searchQuery.trim().toLowerCase();
          const matchesQuery =
            !query ||
            ticket.title.toLowerCase().includes(query) ||
            ticket._id.toLowerCase().includes(query);

          return matchesStatus && matchesQuery;
        });

        return {
          ...teamGroup,
          filteredTickets: matchingTickets,
        };
      })
      .filter((teamGroup) => teamGroup.filteredTickets.length > 0 || !searchQuery);
  }, [activeTeamsGrouped, statusFilter, searchQuery]);

  const totalFilteredCount = useMemo(() => {
    return filteredTeams.reduce((acc, team) => acc + (team.filteredTickets?.length || 0), 0);
  }, [filteredTeams]);

  const currentTabBaseCount = activeTab === 'ASSIGNED' ? (data?.assignedCount || 0) : (data?.reportedCount || 0);

  if (isLoading) {
    return <MyTasksSkeleton />;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F9FA] relative min-h-screen">
      {/* Background Dot Canvas */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none" 
        style={{
          backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Header Area */}
        <div className="flex flex-col gap-6 pb-6 border-b border-slate-200/80">
          
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                {activeTab === 'ASSIGNED' ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <UserCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {activeTab === 'ASSIGNED' ? 'Assigned to Me' : 'Reported by Me'}
                  </h1>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/80">
                    {totalFilteredCount} {totalFilteredCount === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {activeTab === 'ASSIGNED'
                    ? 'All your deliverables across all workspaces, organized by team.'
                    : 'All tasks created or reported by you across all teams.'}
                </p>
              </div>
            </div>

            {/* Primary View Toggle: Assigned vs Reported */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/70 self-start sm:self-center shadow-xs">
              <button
                onClick={() => {
                  setActiveTab('ASSIGNED');
                  setStatusFilter('ALL');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'ASSIGNED'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Assigned to me</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'ASSIGNED' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {data?.assignedCount || 0}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('REPORTED');
                  setStatusFilter('ALL');
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                  activeTab === 'REPORTED'
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Reported by me</span>
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'REPORTED' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {data?.reportedCount || 0}
                </span>
              </button>
            </div>
          </div>

          {/* Controls Bar: Search & Status Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'ASSIGNED' ? 'assigned' : 'reported'} tasks...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 shadow-sm transition-all"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
              {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map((statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => setStatusFilter(statusKey)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === statusKey
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {statusKey === 'ALL' ? 'All' : STATUS_CONFIG[statusKey]?.label || statusKey}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Empty State: Zero Tasks for current tab */}
        {currentTabBaseCount === 0 ? (
          <div className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {activeTab === 'ASSIGNED' ? 'No tasks assigned to you' : 'No tasks reported by you'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-6">
              {activeTab === 'ASSIGNED'
                ? "You currently don't have any tickets assigned to you in any workspace."
                : "You haven't created or reported any tickets yet."}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              Go to Workspace
            </Link>
          </div>
        ) : filteredTeams.length === 0 || totalFilteredCount === 0 ? (
          /* Empty State: Zero Tasks Matching Filter */
          <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center shadow-sm">
            <Search className="w-8 h-8 text-slate-300 mb-3" />
            <h3 className="text-sm sm:text-base font-semibold text-slate-800">No matching tasks found</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : (
          /* Team Grouped Accordions */
          <div className="flex flex-col gap-6">
            {filteredTeams.map((teamGroup) => {
              const isCollapsed = !!collapsedTeams[teamGroup.teamId];
              const taskCount = teamGroup.filteredTickets.length;

              return (
                <div
                  key={teamGroup.teamId}
                  className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden transition-all duration-200"
                >
                  {/* Team Accordion Header */}
                  <div
                    onClick={() => toggleTeamCollapse(teamGroup.teamId)}
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50/70 select-none transition-colors border-b border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200/60 font-semibold shadow-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                          {teamGroup.teamName}
                        </h2>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                          {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors">
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isCollapsed ? '-rotate-90' : 'rotate-0'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Team Ticket List Rows */}
                  {!isCollapsed && (
                    <div className="divide-y divide-slate-100">
                      {teamGroup.filteredTickets.map((ticket) => {
                        const priorityInfo = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.MEDIUM;
                        const statusInfo = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.TODO;
                        const ticketCode = `NEX-${ticket._id.substring(ticket._id.length - 4).toUpperCase()}`;
                        const commentCount = ticket.commentCount || 0;
                        const attachmentCount = ticket.attachments?.length || 0;

                        return (
                          <Link
                            key={ticket._id}
                            to={`/dashboard/ticket/${ticket._id}`}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50/80 transition-colors"
                          >
                            {/* Left: Code, Priority, Title */}
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              {/* Priority Icon */}
                              <div
                                className="shrink-0"
                                title={priorityInfo.label}
                              >
                                {priorityInfo.icon}
                              </div>

                              {/* Ticket ID Tag */}
                              <span className="font-mono text-xs font-semibold text-slate-400 tracking-wider shrink-0">
                                {ticketCode}
                              </span>

                              {/* Title */}
                              <span className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-slate-950 group-hover:underline decoration-slate-400 underline-offset-4 truncate">
                                {ticket.title}
                              </span>
                            </div>

                            {/* Right: Status Pill, Due Date, Metrics, Arrow */}
                            <div className="flex items-center gap-4 shrink-0 sm:ml-4 self-end sm:self-center">
                              {/* Status Pill */}
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${statusInfo.pillClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
                                {statusInfo.label}
                              </span>

                              {/* Due Date (Optional) */}
                              {ticket.dueDate && (
                                <div
                                  className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600"
                                  title={`Due: ${new Date(ticket.dueDate).toLocaleDateString()}`}
                                >
                                  <Calendar className="w-3.5 h-3.5" />
                                  <span>{new Date(ticket.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                </div>
                              )}

                              {/* Metrics: Attachments & Comments */}
                              <div className="flex items-center gap-3 text-slate-400 text-[11px] font-medium">
                                <div className="flex items-center gap-1" title={`${attachmentCount} attachments`}>
                                  <Paperclip className="w-3.5 h-3.5" />
                                  <span>{attachmentCount}</span>
                                </div>
                                <div className="flex items-center gap-1" title={`${commentCount} comments`}>
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{commentCount}</span>
                                </div>
                              </div>

                              {/* Row Arrow */}
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors hidden sm:block" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyTasks;
