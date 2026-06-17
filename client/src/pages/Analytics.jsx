import React from 'react';
import { Link } from 'react-router-dom';
import { 
  RefreshCw, 
  ArrowRight, 
  Kanban, 
  Layers
} from 'lucide-react';
import useTeamStore from '../store/teamStore';
import { useTeamStats, useTeamTickets } from '../hooks/useTickets';
import { useTeamDetails } from '../hooks/useTeams';
import TelemetryCards from '../components/analytics/TelemetryCards';
import PipelineProgress from '../components/analytics/PipelineProgress';
import PriorityMatrix from '../components/analytics/PriorityMatrix';
import OperativeLoad from '../components/analytics/OperativeLoad';
import ThroughputChart from '../components/analytics/ThroughputChart';
import AnalyticsSkeleton from '../components/analytics/AnalyticsSkeleton';
import Tooltip from '../components/ui/Tooltip';

const Analytics = () => {
  const { activeTeamId, activeTeam } = useTeamStore();

  const {
    data: stats,
    isLoading: isStatsLoading,
    isRefetching,
    refetch,
  } = useTeamStats(activeTeamId);

  const { data: teamDetails, isLoading: isDetailsLoading } = useTeamDetails(activeTeamId);
  const { data: tickets = [], isLoading: isTicketsLoading } = useTeamTickets(activeTeamId);

  const isLoading = (isStatsLoading && !stats) || (isDetailsLoading && !teamDetails);

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (!activeTeamId) {
    return (
      <div className="h-full flex-1 flex flex-col items-center justify-center bg-[#F8F9FA] p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 mb-4">
          <Building2 size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-800">No Workspace Selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Please select a team workspace from the header switcher to stream telemetry and analytics.
        </p>
      </div>
    );
  }

  const totalTickets = stats?.totalTickets || 0;
  const teamMembers = teamDetails?.members || [];

  // Calculate Composite Workspace Operational Health Score (0 - 100)
  const statusMap = (stats?.statusBreakdown || []).reduce((acc, item) => {
    acc[item.status] = item.count;
    return acc;
  }, {});
  const priorityMap = (stats?.priorityBreakdown || []).reduce((acc, item) => {
    acc[item.priority] = item.count;
    return acc;
  }, {});

  const doneCount = statusMap.DONE || 0;
  const inProgressCount = statusMap.IN_PROGRESS || 0;
  const completionRate = totalTickets > 0 ? Math.round((doneCount / totalTickets) * 100) : 0;

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
        
        {/* Workspace Analytics Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[11px] font-mono">
              <span className="font-semibold uppercase tracking-wider text-slate-400">
                Workspace Telemetry
              </span>
              <span className="text-slate-300">•</span>
              
              <span className="text-slate-600 font-medium">
                {activeTeam?.name || 'Workspace'}
              </span>

              <span className="text-slate-300">•</span>

              <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Telemetry
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Analytics & Throughput
              </h1>

              {totalTickets > 0 && (
                <Tooltip content={`Overall workspace delivery rate: ${doneCount} of ${totalTickets} tasks resolved to date`}>
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200 cursor-help">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {completionRate}% throughput
                  </span>
                </Tooltip>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal">
              Real-time operational distribution, velocity indexes, and operative workload telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Tooltip content="Refresh telemetry data directly from server aggregation">
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={13} className={isRefetching ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </Tooltip>

            <Tooltip content="Navigate back to the interactive Kanban board">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                <Kanban size={14} />
                <span>Open Board</span>
                <ArrowRight size={13} />
              </Link>
            </Tooltip>
          </div>
        </div>

        {/* Empty Workspace State */}
        {totalTickets === 0 ? (
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-sm my-8">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4">
              <Layers size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Zero Telemetry Recorded
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              No tasks have been created in <span className="font-semibold text-slate-700">{activeTeam?.name}</span> yet. Create your first ticket on the Kanban board to initialize metric streaming.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              <Kanban size={14} />
              <span>Go to Kanban Board</span>
            </Link>
          </div>
        ) : (
          <>
            {/* 1. Telemetry KPI Grid */}
            <TelemetryCards stats={stats} />

            {/* 2. 14-Day Delivery Velocity & Throughput Timeline */}
            <ThroughputChart tickets={tickets} />

            {/* 3. Mid Tier: Status Pipeline & Priority Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
              <div className="lg:col-span-7">
                <PipelineProgress stats={stats} />
              </div>
              <div className="lg:col-span-5">
                <PriorityMatrix stats={stats} />
              </div>
            </div>

            {/* 3. Bottom Tier: Operative Allocation Ledger */}
            <OperativeLoad
              members={teamMembers}
              tickets={tickets}
              ownerId={teamDetails?.ownerId}
            />
          </>
        )}

      </div>
    </div>
  );
};

export default Analytics;
