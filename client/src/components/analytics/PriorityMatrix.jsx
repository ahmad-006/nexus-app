import React from 'react';
import { Info } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

const PriorityMatrix = ({ stats }) => {
  const total = stats?.totalTickets || 0;

  const priorityMap = (stats?.priorityBreakdown || []).reduce((acc, item) => {
    acc[item.priority] = item.count;
    return acc;
  }, {});

  const high = priorityMap.HIGH || 0;
  const medium = priorityMap.MEDIUM || 0;
  const low = priorityMap.LOW || 0;

  const highPct = total > 0 ? Math.round((high / total) * 100) : 0;
  const mediumPct = total > 0 ? Math.round((medium / total) * 100) : 0;
  const lowPct = total > 0 ? Math.round((low / total) * 100) : 0;

  const priorities = [
    {
      id: 'HIGH',
      label: 'High Urgency',
      tag: 'P0 / P1',
      count: high,
      pct: highPct,
      barColor: 'bg-rose-500',
      dotColor: 'bg-rose-500',
      tooltip: 'P0/P1: Critical blocking bugs and high-priority sprint deliverables',
      sla: 'Immediate SLA priority',
    },
    {
      id: 'MEDIUM',
      label: 'Standard Urgency',
      tag: 'P2',
      count: medium,
      pct: mediumPct,
      barColor: 'bg-amber-500',
      dotColor: 'bg-amber-500',
      tooltip: 'P2: Standard product features and planned sprint commitments',
      sla: 'Standard sprint cadence',
    },
    {
      id: 'LOW',
      label: 'Low Urgency',
      tag: 'P3',
      count: low,
      pct: lowPct,
      barColor: 'bg-emerald-500',
      dotColor: 'bg-emerald-500',
      tooltip: 'P3: Non-blocking backlog items, minor polish, and technical debt',
      sla: 'Flexible maintenance SLA',
    },
  ];

  const isHighRisk = highPct > 35;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Severity Matrix
              </h3>
              <Tooltip content="Workload urgency distribution across P0-P3 severity tiers">
                <Info size={13} className="text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
              </Tooltip>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              Urgency stratification and risk assessment
            </p>
          </div>

          <Tooltip content={isHighRisk ? 'High priority items exceed 35% of total backlog' : 'Workload urgency is within healthy balance thresholds'}>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium cursor-help">
              <span className={`w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              <span className={isHighRisk ? 'text-rose-700 font-semibold' : 'text-slate-600'}>
                {isHighRisk ? 'Elevated Criticality' : 'Balanced SLA'}
              </span>
            </span>
          </Tooltip>
        </div>

        {/* Priority Rows */}
        <div className="flex flex-col gap-3">
          {priorities.map((item) => (
            <Tooltip key={item.id} content={item.tooltip} className="w-full">
              <div
                className="w-full p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col gap-2 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {item.tag}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{item.label}</span>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-extrabold text-slate-900 font-sans tabular-nums">
                      {item.count}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      ({item.pct}%)
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${item.pct}%` }}
                    className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{item.sla}</span>
                  <span>{item.count} of {total} units</span>
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-normal">
        <span>Criticality Ratio (P0/P1)</span>
        <Tooltip content="Percentage of total workload flagged as high urgency">
          <span className="font-mono text-slate-700 font-semibold cursor-help">
            {highPct}% Urgent
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export default PriorityMatrix;
