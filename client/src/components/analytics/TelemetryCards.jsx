import React from 'react';
import Tooltip from '../ui/Tooltip';

const TelemetryCards = ({ stats }) => {
  const total = stats?.totalTickets || 0;

  const statusMap = (stats?.statusBreakdown || []).reduce((acc, item) => {
    acc[item.status] = item.count;
    return acc;
  }, {});

  const todo = statusMap.TODO || 0;
  const inProgress = statusMap.IN_PROGRESS || 0;
  const done = statusMap.DONE || 0;

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
  const inFlightRate = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const queuedRate = total > 0 ? Math.round((todo / total) * 100) : 0;

  // SVG Circular Gauge calculations for Resolution Velocity
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      
      {/* 1. Total Scope */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Total Scope
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {todo} queued
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
              {total}
            </span>
            <span className="text-xs font-mono text-slate-400">units</span>
          </div>

          <p className="text-xs text-slate-500 font-normal">
            Workspace registered deliverables
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <Tooltip content={`Queued: ${todo} of ${total} (${queuedRate}% of backlog)`} className="w-full">
            <div className="w-full flex items-center gap-2 cursor-pointer">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${queuedRate}%` }}
                  className="h-full rounded-full bg-slate-400 transition-all duration-500"
                />
              </div>
              <span className="text-[10px] font-mono font-semibold text-slate-400 tabular-nums">
                {queuedRate}%
              </span>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* 2. Active WIP */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:border-amber-300/80 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Active WIP
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              In Flight
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
              {inProgress}
            </span>
            <span className="text-xs font-mono text-slate-400">in dev</span>
          </div>

          <p className="text-xs text-slate-500 font-normal">
            Concurrent execution load
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <Tooltip content={`Active: ${inProgress} tasks currently In Progress (${inFlightRate}%)`} className="w-full">
            <div className="w-full flex items-center gap-2 cursor-pointer">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${inFlightRate}%` }}
                  className="h-full rounded-full bg-amber-500 transition-all duration-500"
                />
              </div>
              <span className="text-[10px] font-mono font-semibold text-amber-600 tabular-nums">
                {inFlightRate}%
              </span>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* 3. Closed Output */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:border-emerald-300/80 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Closed Output
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Resolved
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
              {done}
            </span>
            <span className="text-xs font-mono text-slate-400">units</span>
          </div>

          <p className="text-xs text-slate-500 font-normal">
            Verified production deliverables
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <Tooltip content={`Resolved: ${done} of ${total} tasks closed (${completionRate}%)`} className="w-full">
            <div className="w-full flex items-center gap-2 cursor-pointer">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{ width: `${completionRate}%` }}
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                />
              </div>
              <span className="text-[10px] font-mono font-semibold text-emerald-600 tabular-nums">
                {completionRate}%
              </span>
            </div>
          </Tooltip>
        </div>
      </div>

      {/* 4. Delivery Ratio (Clean, consistent light card with SVG ring) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs hover:border-slate-300 transition-colors flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Delivery Ratio
            </span>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {done}/{total} done
            </span>
          </div>

          <div className="flex items-center justify-between my-0.5">
            <div>
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-sans tabular-nums">
                {completionRate}%
              </span>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Throughput efficiency
              </p>
            </div>

            {/* Precision SVG Progress Ring */}
            <Tooltip content={`${completionRate}% resolution rate (${done} of ${total} deliverables)`}>
              <div className="relative w-12 h-12 flex items-center justify-center cursor-help shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 56 56">
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-slate-100"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="text-emerald-500 transition-all duration-700"
                    fill="transparent"
                  />
                </svg>
                <span className="absolute text-[10px] font-mono font-bold text-slate-700 tabular-nums">
                  {completionRate}%
                </span>
              </div>
            </Tooltip>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Resolution rate</span>
          <span className="text-slate-600 font-medium">Done ÷ Total</span>
        </div>
      </div>

    </div>
  );
};

export default TelemetryCards;
