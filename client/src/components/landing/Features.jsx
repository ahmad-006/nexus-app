import React from 'react';

const FeatureSection = ({ overline, title, description, reverse = false, children }) => (
  <div className={`flex flex-col md:flex-row items-center gap-20 py-24 ${reverse ? 'md:flex-row-reverse' : ''}`}>
    <div className="flex-1 max-w-xl">
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9A7B4F] mb-6 block">{overline}</span>
      <h3 className="text-4xl md:text-5xl font-extrabold text-[#0F172A] mb-8 tracking-[-0.02em] leading-tight">{title}</h3>
      <p className="text-lg text-[#475569] leading-relaxed mb-10 font-medium">
        {description}
      </p>
      <div className="flex items-center gap-3 group cursor-pointer w-fit">
         <span className="text-[10px] font-black uppercase tracking-widest text-[#0F172A]">Documentation</span>
         <div className="w-6 h-[1px] bg-[#0F172A] group-hover:w-10 transition-all"></div>
      </div>
    </div>
    <div className="flex-1 w-full relative group">
       <div className="absolute -inset-10 bg-[#0F172A]/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
       <div className="relative bg-white border border-slate-200/60 shadow-[0_30px_60px_rgba(15,23,42,0.06)] rounded-[8px] aspect-[4/3] overflow-hidden flex flex-col shadow-inner">
          {children}
       </div>
    </div>
  </div>
);

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-24">
           <h2 className="text-xs font-black text-[#9A7B4F] uppercase tracking-[0.5em] mb-8">Capabilities</h2>
           <p className="text-5xl md:text-6xl font-extrabold text-[#0F172A] tracking-tighter">
             Engineered for Resolution.
           </p>
        </div>

        <FeatureSection 
          overline="Architecture"
          title="Team Workspaces" 
          description="A curated environment for every project. Nexus provides granular role-based access control, ensuring your organization's hierarchy is reflected with absolute security."
        >
           <div className="p-8 bg-[#FBFBFC] h-full flex flex-col">
              <div className="flex items-center justify-between mb-12">
                 <div className="space-y-1">
                    <div className="text-[10px] font-black text-[#0F172A] uppercase">Active Organization</div>
                    <div className="text-xs font-bold text-slate-400 italic">Alpha Operations / Tier 1</div>
                 </div>
                 <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-400">{i}</div>)}
                 </div>
              </div>
              <div className="space-y-4 flex-1">
                 {[
                   { user: 'Ahmad Aamir', role: 'Admin', action: 'Managing Infrastructure' },
                   { user: 'Sarah Chen', role: 'Member', action: 'Security Audit' },
                   { user: 'Marcus Wright', role: 'Member', action: 'Stripe Integration' }
                 ].map((member, i) => (
                   <div key={i} className="p-5 bg-white border border-slate-100 rounded-lg flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-[#0F172A] rounded flex items-center justify-center text-white text-[10px] font-black">AA</div>
                         <div>
                            <div className="text-[12px] font-bold text-[#0F172A]">{member.user}</div>
                            <div className="text-[10px] font-medium text-slate-400">{member.action}</div>
                         </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-[8px] font-black uppercase ${member.role === 'Admin' ? 'bg-[#9A7B4F]/10 text-[#9A7B4F]' : 'bg-slate-100 text-slate-500'}`}>
                         {member.role}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </FeatureSection>

        <FeatureSection 
          overline="Intelligence"
          title="Global Activity Audit" 
          description="Complete transparency. Our high-signal activity feed provides a real-time audit trail of every status shift, priority escalation, and assignment."
          reverse={true}
        >
           <div className="p-8 bg-white h-full flex flex-col">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-8">System Journal / Live</div>
              <div className="space-y-8 flex-1">
                 {[
                   { time: '2m ago', user: 'Ahmad', action: 'Escalated Priority', target: 'Ticket #104', color: 'bg-red-500' },
                   { time: '14m ago', user: 'System', action: 'Verified Webhook', target: 'Stripe API', color: 'bg-[#9A7B4F]' },
                   { time: '1h ago', user: 'Sarah', action: 'Changed Status', target: 'Ticket #88', color: 'bg-[#0F172A]' },
                   { time: '3h ago', user: 'Ahmad', action: 'Added Member', target: 'John Doe', color: 'bg-[#0F172A]' }
                 ].map((log, i) => (
                   <div key={i} className="flex items-start gap-6 group/item">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${log.color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`}></div>
                      <div className="flex-1 border-b border-slate-50 pb-4">
                         <div className="flex items-center justify-between mb-1">
                            <div className="text-[12px] font-bold text-[#0F172A]">{log.user} <span className="font-medium text-slate-400 mx-1">/</span> {log.action}</div>
                            <span className="text-[10px] font-bold text-slate-300">{log.time}</span>
                         </div>
                         <div className="text-[11px] font-black text-[#9A7B4F] tracking-widest uppercase italic">{log.target}</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </FeatureSection>
      </div>
    </section>
  );
};

export default Features;
