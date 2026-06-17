import React from 'react';
import { ArrowRight, Info } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

const PipelineProgress = ({ stats }) => {
  const total = stats?.totalTickets || 0;

  const statusMap = (stats?.statusBreakdown || []).reduce((acc, item) => {
    acc[item.status] = item.count;
    return acc;
  }, {});

  const todo = statusMap.TODO || 0;
  const inProgress = statusMap.IN_PROGRESS || 0;
  const done = statusMap.DONE || 0;

  const todoPct = total > 0 ? (todo / total) * 100 : 0;
  const inProgressPct = total > 0 ? (inProgress / total) * 100 : 0;
  const donePct = total > 0 ? (done / total) * 100 : 0;

  const stages = [
    {
      id: 'TODO',
      label: 'To Do',
      count: todo,
      pct: Math.round(todoPct),
      dotColor: 'bg-slate-400',
      description: 'Backlog awaiting developer pickup',
      tooltip: `${todo} tasks (${Math.round(todoPct)}%) awaiting start`,
    },
    {
      id: 'IN_PROGRESS',
      label: 'In Progress',
      count: inProgress,
      pct: Math.round(inProgressPct),
      dotColor: 'bg-amber-500',
      description: 'Under active development & review',
      tooltip: `${inProgress} tasks (${Math.round(inProgressPct)}%) in active sprint`,
    },
    {
      id: 'DONE',
      label: 'Done',
      count: done,
      pct: Math.round(donePct),
      dotColor: 'bg-emerald-500',
      description: 'Verified production deliverables',
      tooltip: `${done} tasks (${Math.round(donePct)}%) fully closed`,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Lifecycle Pipeline
              </h3>
              <Tooltip content="Strict workflow order: tasks must flow To Do → In Progress → Done without skipping states">
                <Info size={13} className="text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Proportional task distribution across execution stages
            </p>
          </div>

          <Tooltip content="Total tickets across all pipeline stages">
            <span className="text-[11px] font-mono text-slate-500 font-medium cursor-help">
              Total: <span className="text-slate-800 font-bold">{total}</span> units
            </span>
          </Tooltip>
        </div>

        {/* Segmented Progress Track */}
        <div className="relative mb-2">
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-200/60">
            {total === 0 ? (
              <div className="w-full h-full bg-slate-200/60 rounded-full" />
            ) : (
              <>
                {donePct > 0 && (
                  <Tooltip content={`Done: ${done} units (${Math.round(donePct)}%)`} className="h-full" style={{ width: `${donePct}%` }}>
                    <div
                      className="w-full h-full bg-emerald-500 rounded-l-full hover:brightness-110 transition-all cursor-pointer"
                    />
                  </Tooltip>
                )}
                {inProgressPct > 0 && (
                  <Tooltip content={`In Progress: ${inProgress} units (${Math.round(inProgressPct)}%)`} className="h-full" style={{ width: `${inProgressPct}%` }}>
                    <div
                      className={`w-full h-full bg-amber-500 hover:brightness-110 transition-all cursor-pointer ${
                        donePct === 0 ? 'rounded-l-full' : ''
                      } ${todoPct === 0 ? 'rounded-r-full' : ''}`}
                    />
                  </Tooltip>
                )}
                {todoPct > 0 && (
                  <Tooltip content={`To Do: ${todo} units (${Math.round(todoPct)}%)`} className="h-full" style={{ width: `${todoPct}%` }}>
                    <div
                      className="w-full h-full bg-slate-400 rounded-r-full hover:brightness-110 transition-all cursor-pointer"
                    />
                  </Tooltip>
                )}
              </>
            )}
          </div>
        </div>

        {/* Workflow State Legend Flow */}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 font-mono mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>To Do ({Math.round(todoPct)}%)</span>
          </div>
          <ArrowRight size={12} className="text-slate-300" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>In Progress ({Math.round(inProgressPct)}%)</span>
          </div>
          <ArrowRight size={12} className="text-slate-300" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Done ({Math.round(donePct)}%)</span>
          </div>
        </div>
      </div>

      {/* Stage Cards Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
        {stages.map((stage) => (
          <Tooltip key={stage.id} content={stage.tooltip} className="w-full">
            <div
              className="w-full p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col justify-between cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                  <span className="text-xs font-bold text-slate-800">{stage.label}</span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-400">
                  {stage.pct}%
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight tabular-nums">
                  {stage.count}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  units
                </span>
              </div>

              <p className="text-[10px] text-slate-500 mt-1 truncate font-normal">
                {stage.description}
              </p>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

export default PipelineProgress;
