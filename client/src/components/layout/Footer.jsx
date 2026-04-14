import React from 'react';

const Footer = () => {
  return (
    <footer className="py-32 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col md:row items-start justify-between gap-20 mb-24">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-6 bg-[#0F172A] rounded-sm transform rotate-45"></div>
              <span className="text-xl font-extrabold tracking-[0.3em] text-[#0F172A]">NEXUS</span>
            </div>
            <p className="text-lg text-[#566166] leading-relaxed font-medium">
              The high-performance workspace for elite teams. Built for transparency, speed, and absolute reliability.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-20">
            <div>
              <h4 className="text-[#0F172A] font-black mb-8 uppercase tracking-[0.2em] text-[10px]">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-[#566166]">
                <li><a href="#features" className="hover:text-[#9A7B4F] transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-[#9A7B4F] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#9A7B4F] transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#0F172A] font-black mb-8 uppercase tracking-[0.2em] text-[10px]">Company</h4>
              <ul className="space-y-4 text-sm font-bold text-[#566166]">
                <li><a href="#" className="hover:text-[#9A7B4F] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#9A7B4F] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#9A7B4F] transition-colors">Contact</a></li>
              </ul>
            </div>

            <div className="hidden md:block">
              <h4 className="text-[#0F172A] font-black mb-8 uppercase tracking-[0.2em] text-[10px]">Legal</h4>
              <ul className="space-y-4 text-sm font-bold text-[#566166]">
                <li><a href="#" className="hover:text-[#9A7B4F] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#9A7B4F] transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:row items-center justify-between gap-8">
          <p className="text-[#A9B4B9] text-[10px] font-black uppercase tracking-[0.3em]">
            © 2026 Nexus Ticket Systems. Engineered in 2026.
          </p>
          <div className="flex items-center gap-8">
             <div className="w-4 h-4 bg-slate-100 rounded-full hover:bg-[#9A7B4F]/20 transition-colors cursor-pointer"></div>
             <div className="w-4 h-4 bg-slate-100 rounded-full hover:bg-[#9A7B4F]/20 transition-colors cursor-pointer"></div>
             <div className="w-4 h-4 bg-slate-100 rounded-full hover:bg-[#9A7B4F]/20 transition-colors cursor-pointer"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
