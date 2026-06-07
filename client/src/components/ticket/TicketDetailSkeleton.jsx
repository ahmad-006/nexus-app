import React from 'react';

const TicketDetailSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F8F9FA] relative h-full w-full">
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 animate-pulse">
        
        {/* Top Navigation */}
        <div className="w-32 h-8 bg-slate-200/60 rounded-lg"></div>

        {/* 70/30 Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Group */}
          <div className="md:col-span-8 flex flex-col gap-8 w-full">
            
            {/* Narrative Skeleton */}
            <div className="flex flex-col gap-8 w-full max-w-4xl">
              {/* Header / Title */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-5 bg-slate-200 rounded"></div>
                  <div className="w-4 h-5 bg-slate-200 rounded"></div>
                  <div className="w-24 h-6 bg-slate-200 rounded"></div>
                </div>
                <div className="w-3/4 h-10 bg-slate-200 rounded-lg"></div>
                <div className="w-1/2 h-10 bg-slate-200 rounded-lg"></div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-3">
                <div className="w-28 h-6 bg-slate-200 rounded"></div>
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 flex flex-col gap-3">
                  <div className="w-full h-4 bg-slate-100 rounded"></div>
                  <div className="w-full h-4 bg-slate-100 rounded"></div>
                  <div className="w-5/6 h-4 bg-slate-100 rounded"></div>
                  <div className="w-4/6 h-4 bg-slate-100 rounded"></div>
                  <div className="w-full h-4 bg-slate-100 rounded mt-4"></div>
                  <div className="w-2/3 h-4 bg-slate-100 rounded"></div>
                </div>
              </div>

              {/* Attachments Placeholder */}
              <div className="flex flex-col gap-3">
                <div className="w-32 h-6 bg-slate-200 rounded"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                      <div className="w-12 h-12 rounded-lg bg-slate-100"></div>
                      <div className="w-20 h-3 bg-slate-100 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Properties Ledger (Hidden on Desktop) */}
            <div className="block md:hidden">
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="w-24 h-5 bg-slate-200 rounded"></div>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center justify-between p-2">
                      <div className="w-16 h-4 bg-slate-100 rounded"></div>
                      <div className="w-24 h-6 bg-slate-100 rounded-md"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Skeleton */}
            <div className="flex flex-col gap-4 mt-2 pt-8 border-t border-slate-200/60 w-full max-w-4xl">
              <div className="w-32 h-6 bg-slate-200 rounded"></div>
              <div className="bg-slate-50 border border-slate-200/60 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center h-[120px]">
                <div className="w-48 h-4 bg-slate-200 rounded mb-2"></div>
                <div className="w-64 h-3 bg-slate-200 rounded"></div>
              </div>
            </div>
            
          </div>

          {/* Right Sidebar Group (Hidden on Mobile) */}
          <aside className="hidden md:block md:col-span-4 sticky top-6 flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="w-24 h-5 bg-slate-200 rounded"></div>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center justify-between p-2">
                    <div className="w-16 h-4 bg-slate-100 rounded"></div>
                    <div className="w-24 h-6 bg-slate-100 rounded-md"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 px-3 mt-6">
              <div className="w-32 h-3 bg-slate-200 rounded"></div>
              <div className="w-32 h-3 bg-slate-200 rounded"></div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default TicketDetailSkeleton;
