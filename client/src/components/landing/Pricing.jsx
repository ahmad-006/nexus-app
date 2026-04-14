import React, { useState } from 'react';

const PricingCard = ({ tier, price, features, highlighted = false, yearly = false }) => (
  <div className={`p-12 rounded-[4px] border ${highlighted ? 'bg-[#0F172A] border-[#0F172A] text-white shadow-2xl shadow-navy-900/20' : 'bg-white border-slate-200/60 text-[#0F172A]'} flex-1 flex flex-col transition-transform hover:translate-y-[-4px]`}>
    <div className="mb-10">
      <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 block ${highlighted ? 'text-slate-400' : 'text-[#475569]'}`}>{tier}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-extrabold tracking-tighter">${price}</span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${highlighted ? 'text-slate-400' : 'text-[#475569]'}`}>/ {yearly ? 'Year' : 'Mo'}</span>
      </div>
    </div>
    
    <ul className="space-y-5 mb-12 flex-1 text-sm font-medium">
      {features.map((feature, i) => (
        <li key={i} className="flex items-center gap-3">
          <div className={`w-1 h-1 rounded-full ${highlighted ? 'bg-white' : 'bg-[#0F172A]'}`}></div>
          <span className={highlighted ? 'text-slate-300' : 'text-[#475569]'}>{feature}</span>
        </li>
      ))}
    </ul>
    
    <button className={`w-full py-5 text-[10px] font-black uppercase tracking-[0.3em] rounded-[2px] transition-all ${highlighted ? 'bg-white text-[#0F172A] hover:bg-slate-100' : 'bg-[#0F172A] text-white hover:bg-[#1e293b]'}`}>
      Select {tier}
    </button>
  </div>
);

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-48 bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-8 text-center">
        <div className="mb-24">
          <h2 className="text-[10px] font-black text-[#0F172A]/40 uppercase tracking-[0.5em] mb-10">Investment</h2>
          <p className="text-5xl md:text-6xl font-extrabold text-[#0F172A] tracking-tight">
            Transparent Pricing for <br /> Ambitious Teams.
          </p>
        </div>

        {/* Minimalist Toggle */}
        <div className="flex items-center justify-center gap-10 mb-24">
          <button 
            onClick={() => setIsYearly(false)}
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${!isYearly ? 'text-[#0F172A]' : 'text-slate-400 hover:text-slate-500'}`}
          >
            Monthly
          </button>
          <div 
            onClick={() => setIsYearly(!isYearly)}
            className="w-12 h-6 bg-slate-200 rounded-full p-1 cursor-pointer flex items-center transition-colors hover:bg-slate-300"
          >
            <div className={`w-4 h-4 bg-[#0F172A] rounded-full transition-transform duration-300 ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </div>
          <button 
            onClick={() => setIsYearly(true)}
            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isYearly ? 'text-[#0F172A]' : 'text-slate-400 hover:text-slate-500'}`}
          >
            Yearly
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto items-stretch">
          <PricingCard 
            tier="Standard" 
            price={isYearly ? "0" : "0"} 
            features={["3 Team Members", "Kanban Workflows", "Activity Logs"]}
            yearly={isYearly}
          />
          <PricingCard 
            tier="Premium" 
            price={isYearly ? "190" : "19"} 
            highlighted={true}
            features={["Unlimited Members", "Full Audit History", "Real-time Chat", "Priority Support"]}
            yearly={isYearly}
          />
          <PricingCard 
            tier="Enterprise" 
            price={isYearly ? "490" : "49"} 
            features={["Custom Workspaces", "API Data Access", "SAML SSO", "Account Manager"]}
            yearly={isYearly}
          />
        </div>
      </div>
    </section>
  );
};

export default Pricing;
