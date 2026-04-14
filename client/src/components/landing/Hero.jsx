import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        {/* Centered Typography */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-white border border-slate-200/60 shadow-sm mb-10 transition-transform hover:scale-105 cursor-default">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0F172A]">Next-Gen Orchestration</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold text-[#0F172A] mb-8 tracking-[-0.03em] leading-[1.05]">
            The Standard for <br />
            Elite Engineering.
          </h1>
          
          <p className="text-lg md:text-xl text-[#475569] max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            Nexus is a high-performance workspace for teams that demand precision. High-signal activity logging meets surgical ticket orchestration.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link to="/signup" className="px-10 py-5 bg-[#0F172A] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[4px] shadow-2xl shadow-navy-900/20 hover:bg-[#1e293b] transition-all hover:translate-y-[-2px]">
              Start Your Free Trial
            </Link>
            <a href="#features" className="px-10 py-5 text-[#0F172A] text-[11px] font-black uppercase tracking-[0.2em] border border-[#0F172A]/10 rounded-[4px] hover:bg-white transition-all bg-white/40 shadow-sm">
              Explore the Platform
            </a>
          </div>
        </div>

        {/* High-Fidelity Visual Mockup */}
        <div className="relative max-w-6xl mx-auto">
          <div className="absolute -inset-20 bg-navy-900/5 blur-[120px] rounded-full pointer-events-none opacity-40"></div>
          
          <div className="relative p-1 bg-gradient-to-b from-white to-transparent rounded-[12px] shadow-[0_50px_100px_-20px_rgba(15,23,42,0.12)]">
            <div className="bg-white rounded-[10px] aspect-[16/9] overflow-hidden border border-slate-200/40 flex flex-col shadow-inner">
              {/* UI Header */}
              <div className="h-14 border-b border-slate-100 flex items-center px-6 justify-between bg-[#FBFBFC]">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FEBC2E]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#28C840]"></div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Project Nexus / Alpha Team</div>
                   <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200"></div>
                </div>
              </div>
              
              {/* UI Content (Kanban Detail) */}
              <div className="flex-1 p-8 flex gap-8 bg-[#F8FAFC]">
                <div className="w-64 space-y-4">
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Workspaces</div>
                   {['Dashboard', 'Active Tickets', 'Activity Feed', 'Team Chat'].map((item, i) => (
                     <div key={item} className={`h-10 w-full px-4 flex items-center text-[11px] font-bold rounded-[4px] ${i === 1 ? 'bg-white shadow-sm text-[#0F172A]' : 'text-slate-400'}`}>
                        {item}
                     </div>
                   ))}
                </div>
                
                <div className="flex-1 grid grid-cols-3 gap-6">
                   {[
                     { label: 'Todo', count: 12 },
                     { label: 'In Progress', count: 4 },
                     { label: 'Resolved', count: 8 }
                   ].map((col) => (
                     <div key={col.label} className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                           <span className="text-[10px] font-black text-[#0F172A] uppercase tracking-widest">{col.label}</span>
                           <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{col.count}</span>
                        </div>
                        
                        <div className="p-5 bg-white border border-slate-100 rounded-lg shadow-sm">
                           <div className="flex gap-2 mb-3">
                              <div className="px-2 py-0.5 bg-red-50 text-red-600 text-[8px] font-black uppercase rounded">High</div>
                              <div className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[8px] font-black uppercase rounded">Auth</div>
                           </div>
                           <div className="text-[12px] font-bold text-[#0F172A] mb-2 leading-tight">Implement JWT Rotation Logic</div>
                           <div className="h-1 w-full bg-slate-100 rounded-full mt-4">
                              <div className="h-full w-2/3 bg-[#0F172A] rounded-full"></div>
                           </div>
                        </div>

                        <div className="p-5 bg-white border border-slate-100 rounded-lg shadow-sm opacity-60">
                           <div className="flex gap-2 mb-3">
                              <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded">Medium</div>
                           </div>
                           <div className="text-[12px] font-bold text-[#0F172A] mb-2 leading-tight">Refactor Stripe Webhook</div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
