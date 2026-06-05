import React from 'react';

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-3 h-32 w-full">
    <div className="flex justify-between items-center">
      <div className="w-12 h-4 bg-slate-200 rounded-md animate-pulse"></div>
      <div className="w-6 h-4 bg-slate-100 rounded-md animate-pulse"></div>
    </div>
    
    <div className="space-y-2 mt-2">
      <div className="w-[85%] h-4 bg-slate-200 rounded animate-pulse"></div>
      <div className="w-[60%] h-4 bg-slate-200 rounded animate-pulse"></div>
    </div>

    <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100">
      <div className="flex gap-2">
        <div className="w-6 h-4 bg-slate-100 rounded animate-pulse"></div>
        <div className="w-6 h-4 bg-slate-100 rounded animate-pulse"></div>
      </div>
      <div className="w-6 h-6 rounded-full bg-slate-200 animate-pulse"></div>
    </div>
  </div>
);

const SkeletonColumn = ({ title }) => (
  <div className="flex flex-col w-[340px] shrink-0 bg-slate-50/50 rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm">
    <div className="p-4 border-b border-slate-200/50 bg-white/50 backdrop-blur-md flex justify-between items-center">
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse" />
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
      </div>
      <div className="w-6 h-6 bg-slate-200 rounded-md animate-pulse"></div>
    </div>
    
    <div className="flex-1 p-3 flex flex-col gap-3 min-h-[500px]">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

const KanbanSkeleton = () => {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden bg-[#F8F9FA] relative">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      <div className="h-full flex items-start gap-6 p-8 min-w-max relative z-10">
        <SkeletonColumn title="To Do" />
        <SkeletonColumn title="In Progress" />
        <SkeletonColumn title="Completed" />
      </div>
    </div>
  );
};

export default KanbanSkeleton;
