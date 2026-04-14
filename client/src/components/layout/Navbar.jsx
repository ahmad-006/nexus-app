import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#F5F5F7]/80 backdrop-blur-2xl border-b border-slate-200/40 px-8">
      <div className="max-w-7xl mx-auto h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#0F172A] rounded-[4px]"></div>
          <span className="text-lg font-black tracking-[0.2em] text-[#0F172A] font-['Manrope']">NEXUS</span>
        </div>
        
        <div className="hidden md:flex items-center gap-10 text-[#475569] text-[11px] font-black uppercase tracking-[0.2em]">
          <a href="#features" className="hover:text-[#0F172A] transition-colors">Platform</a>
          <a href="#pricing" className="hover:text-[#0F172A] transition-colors">Pricing</a>
          <a href="#vision" className="hover:text-[#0F172A] transition-colors">Vision</a>
        </div>

        <div className="flex items-center gap-6">
          <Link to="/login" className="text-[#0F172A] font-bold text-xs uppercase tracking-widest hover:opacity-60 transition-opacity">
            Sign In
          </Link>
          <Link to="/signup" className="bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-[4px] shadow-lg shadow-navy-900/10 hover:translate-y-[-1px] transition-all">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
