import React from 'react';

const AnalyticsSkeleton = () => {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-28 h-4 bg-slate-200 rounded"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
            <div className="w-20 h-4 bg-slate-100 rounded-full"></div>
          </div>
          <div className="w-56 h-8 bg-slate-200 rounded-lg"></div>
          <div className="w-72 h-3.5 bg-slate-100 rounded mt-1"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-36 h-10 bg-slate-200 rounded-xl"></div>
          <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/70 p-5 sm:p-6 shadow-sm flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="w-24 h-4 bg-slate-200 rounded"></div>
              <div className="w-8 h-8 rounded-xl bg-slate-100"></div>
            </div>
            <div className="flex items-baseline gap-3">
              <div className="w-16 h-8 bg-slate-200 rounded"></div>
              <div className="w-20 h-4 bg-slate-100 rounded"></div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-1/2 h-full bg-slate-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* 14-Day Velocity Chart Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <div className="w-48 h-5 bg-slate-200 rounded"></div>
            <div className="w-64 h-3.5 bg-slate-100 rounded"></div>
          </div>
          <div className="w-36 h-8 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="w-full h-48 bg-slate-50 rounded-xl flex items-end gap-2 p-4">
          {[40, 65, 30, 85, 45, 90, 60, 75, 50, 95, 70, 80, 60, 85].map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className="flex-1 bg-slate-200/70 rounded-t"
            />
          ))}
        </div>
      </div>

      {/* Mid Tier: Pipeline Distribution & Priority Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/70 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="w-40 h-5 bg-slate-200 rounded"></div>
            <div className="w-20 h-4 bg-slate-100 rounded"></div>
          </div>
          <div className="w-full h-4 bg-slate-100 rounded-full"></div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50">
                <div className="w-16 h-3 bg-slate-200 rounded"></div>
                <div className="w-10 h-6 bg-slate-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/70 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="w-36 h-5 bg-slate-200 rounded"></div>
            <div className="w-16 h-4 bg-slate-100 rounded"></div>
          </div>
          <div className="flex flex-col gap-3.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-50 border border-slate-100"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Tier: Operative Allocation Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="w-48 h-5 bg-slate-200 rounded"></div>
          <div className="w-24 h-4 bg-slate-100 rounded"></div>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-50 border border-slate-100"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
