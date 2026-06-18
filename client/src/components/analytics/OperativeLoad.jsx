import React, { useMemo } from 'react';
import { HelpCircle, CheckCircle2 } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

const OperativeLoad = ({ members = [], tickets = [], ownerId }) => {
  const { operatives, unassignedStats, totalAssigned } = useMemo(() => {
    // Single-pass ticket bucketing per assigneeId (O(N) vs previous O(N * M))
    const memberTicketsMap = new Map();
    const unassignedTickets = [];
    let assignedCount = 0;

    for (let i = 0; i < tickets.length; i++) {
      const t = tickets[i];
      const aId = (t.assigneeId?._id || t.assigneeId)?.toString();
      if (!aId) {
        unassignedTickets.push(t);
      } else {
        assignedCount += 1;
        let bucket = memberTicketsMap.get(aId);
        if (!bucket) {
          bucket = { total: 0, todo: 0, inProgress: 0, done: 0 };
          memberTicketsMap.set(aId, bucket);
        }
        bucket.total += 1;
        if (t.status === 'TODO') bucket.todo += 1;
        else if (t.status === 'IN_PROGRESS') bucket.inProgress += 1;
        else if (t.status === 'DONE') bucket.done += 1;
      }
    }

    const stats = members.map((m) => {
      const user = m.userId || {};
      const userIdStr = (user._id || user).toString();
      const isOwner = ownerId && ownerId.toString() === userIdStr;

      const counts = memberTicketsMap.get(userIdStr) || { total: 0, todo: 0, inProgress: 0, done: 0 };
      const { total, todo, inProgress, done } = counts;
      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      // Lean WIP Analysis: Concurrency constraint
      // In Kanban, concurrent IN_PROGRESS >= 3 incurs heavy context-switching penalty.
      const isWipOverloaded = inProgress >= 3;
      const hasActiveWork = inProgress > 0;

      return {
        id: userIdStr,
        name: user.name || 'Operative',
        email: user.email || '',
        image: user.image,
        role: isOwner ? 'owner' : m.role || 'member',
        total,
        todo,
        inProgress,
        done,
        completionRate,
        isWipOverloaded,
        hasActiveWork,
      };
    });

    // Sort: High Active WIP first, then total workload descending
    stats.sort((a, b) => b.inProgress - a.inProgress || b.total - a.total);

    let unassignedTodo = 0;
    let unassignedInProgress = 0;
    let unassignedDone = 0;
    for (let i = 0; i < unassignedTickets.length; i++) {
      const status = unassignedTickets[i].status;
      if (status === 'TODO') unassignedTodo += 1;
      else if (status === 'IN_PROGRESS') unassignedInProgress += 1;
      else if (status === 'DONE') unassignedDone += 1;
    }

    return {
      operatives: stats,
      unassignedStats: {
        total: unassignedTickets.length,
        todo: unassignedTodo,
        inProgress: unassignedInProgress,
        done: unassignedDone,
      },
      totalAssigned: assignedCount,
    };
  }, [members, tickets, ownerId]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs flex flex-col gap-6">
      
      {/* Ledger Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              WIP & Throughput Ledger
            </h3>
            <Tooltip content="Work In Progress (WIP) concurrency, throughput, and queue depth tracked per operative">
              <HelpCircle size={13} className="text-slate-400 hover:text-slate-600 cursor-help transition-colors" />
            </Tooltip>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Real-time developer allocation, active concurrency limits, and closed deliverables
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          {unassignedStats.total > 0 && (
            <Tooltip content={`${unassignedStats.total} unassigned tickets awaiting sprint allocation`}>
              <span className="text-amber-700 font-semibold cursor-help">
                {unassignedStats.total} Unassigned
              </span>
            </Tooltip>
          )}

          {unassignedStats.total > 0 && <span className="text-slate-300">•</span>}

          <Tooltip content="Total verified operatives in this team workspace">
            <span className="text-slate-500 font-medium cursor-help">
              {members.length} Operatives
            </span>
          </Tooltip>
        </div>
      </div>

      {operatives.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">
          No operative profiles found for this workspace.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold select-none">
                <th className="pb-3 pr-4 font-semibold">Operative</th>
                <th className="pb-3 px-3 text-center font-semibold">
                  <Tooltip content="Active concurrent tasks (IN_PROGRESS). Kanban standard limits concurrency to avoid context switching.">
                    <span className="inline-flex items-center gap-1 cursor-help">
                      Active WIP
                      <HelpCircle size={10} className="text-slate-300" />
                    </span>
                  </Tooltip>
                </th>
                <th className="pb-3 px-3 text-center font-semibold">
                  <Tooltip content="Queued tasks in To Do backlog awaiting start">
                    <span className="cursor-help">Queued</span>
                  </Tooltip>
                </th>
                <th className="pb-3 px-3 text-center font-semibold">
                  <Tooltip content="Successfully resolved and verified deliverables (DONE)">
                    <span className="cursor-help">Resolved</span>
                  </Tooltip>
                </th>
                <th className="pb-3 px-3 text-center font-semibold">
                  <Tooltip content="Total assigned ticket volume across all statuses">
                    <span className="cursor-help">Total Scope</span>
                  </Tooltip>
                </th>
                <th className="pb-3 pl-4 text-right font-semibold">Delivery Pace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {operatives.map((op) => (
                <tr 
                  key={op.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {/* Operative Identity */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center overflow-hidden ring-1 ring-slate-200">
                          {op.image ? (
                            <img src={op.image} alt={op.name} className="w-full h-full object-cover" />
                          ) : (
                            op.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {op.hasActiveWork && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900 truncate">
                            {op.name}
                          </span>
                          {op.role === 'owner' ? (
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              Owner
                            </span>
                          ) : op.role === 'admin' ? (
                            <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              Admin
                            </span>
                          ) : null}
                        </div>
                        <span className="text-[11px] text-slate-400 truncate block font-mono">
                          {op.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Active WIP Column */}
                  <td className="py-3.5 px-3 text-center">
                    {op.inProgress > 0 ? (
                      <Tooltip 
                        content={
                          op.isWipOverloaded 
                            ? `High WIP Alert: ${op.inProgress} concurrent tasks in progress (exceeds recommended limit of 2)` 
                            : `${op.inProgress} active task currently in progress`
                        }
                      >
                        <span 
                          className={`font-mono text-xs font-bold cursor-help ${
                            op.isWipOverloaded
                              ? 'text-amber-700 underline decoration-amber-400 decoration-dotted'
                              : 'text-slate-800'
                          }`}
                        >
                          {op.inProgress}
                          {op.isWipOverloaded && (
                            <span className="ml-1 text-[10px] font-normal text-amber-600 font-sans">
                              (high)
                            </span>
                          )}
                        </span>
                      </Tooltip>
                    ) : (
                      <span className="text-slate-300 font-mono text-xs">—</span>
                    )}
                  </td>

                  {/* Queued Backlog Column */}
                  <td className="py-3.5 px-3 text-center">
                    <Tooltip content={`${op.todo} tasks queued in To Do`}>
                      <span className="font-mono text-slate-600 font-medium cursor-help">
                        {op.todo}
                      </span>
                    </Tooltip>
                  </td>

                  {/* Resolved Throughput Column */}
                  <td className="py-3.5 px-3 text-center">
                    <Tooltip content={`${op.done} tasks resolved (DONE)`}>
                      <span className="font-mono text-emerald-700 font-bold cursor-help inline-flex items-center gap-1">
                        {op.done > 0 && <CheckCircle2 size={11} className="text-emerald-500" />}
                        {op.done}
                      </span>
                    </Tooltip>
                  </td>

                  {/* Total Scope Column */}
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                    <Tooltip content={`Total workload: ${op.total} tickets assigned`}>
                      <span className="cursor-help">{op.total}</span>
                    </Tooltip>
                  </td>

                  {/* Delivery Pace Column */}
                  <td className="py-3.5 pl-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <Tooltip content={`Resolution efficiency: ${op.done} of ${op.total} tasks completed (${op.completionRate}%)`}>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50 cursor-pointer">
                          <div 
                            style={{ width: `${op.completionRate}%` }}
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          />
                        </div>
                      </Tooltip>
                      <span className="font-mono text-[11px] font-bold text-slate-700 w-9 text-right tabular-nums">
                        {op.completionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Unassigned Backlog Pool Row */}
              {unassignedStats.total > 0 && (
                <tr className="bg-slate-50/50 text-slate-700 border-t border-slate-200/70">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-200/70 text-slate-600 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                        ?
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">Unassigned Backlog Pool</span>
                          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200/80">
                            Triage
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          Unallocated tickets awaiting owner pickup
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {unassignedStats.inProgress > 0 ? (
                      <span className="text-amber-700 font-bold">{unassignedStats.inProgress}</span>
                    ) : '—'}
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-slate-600 font-medium">
                    {unassignedStats.todo}
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-slate-400">
                    {unassignedStats.done}
                  </td>

                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                    {unassignedStats.total}
                  </td>

                  <td className="py-3 pl-4 text-right">
                    <span className="text-[11px] font-mono text-slate-400 font-normal">
                      Unallocated
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Ledger Footer Summary */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span>Active WIP limit target: ≤ 2 concurrent</span>
          <span>•</span>
          <span>High context-switching: 3+</span>
        </div>
        <div>
          <span>Total Assigned: {totalAssigned} units</span>
        </div>
      </div>

    </div>
  );
};

export default OperativeLoad;
