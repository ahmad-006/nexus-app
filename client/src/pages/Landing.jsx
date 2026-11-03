import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowDown,
  Search,
  Shield,
  Zap,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlignLeft,
  Users,
  History,
  Activity,
  BarChart3,
  Layers,
  Sparkles,
  Command,
  Check,
  ChevronRight,
  Kanban,
  TrendingUp,
  Cpu,
  Lock,
  Compass
} from 'lucide-react';
import nexusLogo from '../assets/nexus_logo.png';
import nexusIcon from '../assets/nexus_icon.png';
import useDocumentTitle from '../hooks/useDocumentTitle';

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const Landing = () => {
  useDocumentTitle('Project Workspace & Engineering Workflow | NEXUS');
  const [heroView, setHeroView] = useState('kanban'); // 'kanban' | 'telemetry'

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#171513] font-sans selection:bg-[#EAE0D0] selection:text-[#171513] overflow-x-hidden relative">
      
      {/* Warm Ambient Studio Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full blur-[120px] opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(238, 222, 195, 0.45) 0%, rgba(246, 237, 225, 0.2) 60%, transparent 80%)' }}
        />
        <div 
          className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(232, 215, 185, 0.3) 0%, transparent 70%)' }}
        />
        <div 
          className="absolute top-[70%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[150px] opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(235, 220, 195, 0.35) 0%, transparent 70%)' }}
        />
        {/* Subtle Warm Architectural Grid */}
        <div 
          className="absolute inset-0 opacity-[0.25]"
          style={{ 
            backgroundImage: 'radial-gradient(#C8BFB0 0.8px, transparent 0.8px)', 
            backgroundSize: '24px 24px' 
          }}
        />
      </div>

      {/* Floating Apple-Style Warm Glass Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#FAF8F5]/85 backdrop-blur-xl border-b border-[#E8E1D5] transition-all">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
          
          {/* Brand Logo & Pill */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src={nexusLogo} alt="Nexus" className="h-6 sm:h-7 object-contain drop-shadow-2xs" />
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-[#F2ECE1] text-[#7A5B28] border border-[#E4DAC8]">
                v2.4 STUDIO
              </span>
            </Link>
          </div>

          {/* Quick Anchor Navigation */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold tracking-wide text-[#595248]">
            <a href="#kanban-preview" className="hover:text-[#171513] transition-colors">Kanban Flow</a>
            <a href="#telemetry-preview" className="hover:text-[#171513] transition-colors">Live Telemetry</a>
            <a href="#chat-preview" className="hover:text-[#171513] transition-colors">Contextual Chat</a>
            <a href="#security-preview" className="hover:text-[#171513] transition-colors">Security & Audit</a>
          </div>

          {/* Authentication Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              to="/login" 
              className="text-xs sm:text-sm font-semibold text-[#4A433A] hover:text-[#171513] px-2.5 py-1.5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-1.5 bg-[#181614] hover:bg-[#2B2724] text-[#FAF8F5] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full shadow-[0_4px_14px_rgba(24,22,20,0.15)] hover:shadow-[0_6px_20px_rgba(180,140,80,0.22)] border border-[#38332E] transition-all duration-200"
            >
              <span>Start for free</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform opacity-70 group-hover:opacity-100" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <header className="relative pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden z-10">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-5xl text-center flex flex-col items-center"
        >
          {/* Apple-style Subtle Warm Pill */}
          <motion.div variants={fadeIn} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#F3ECE0] border border-[#E3D7C2] text-[#7A5822] text-[11px] sm:text-xs font-semibold mb-6 sm:mb-8 shadow-2xs">
            <Sparkles size={12} className="text-[#9E7432] shrink-0" />
            <span className="whitespace-nowrap">Refined Engineering Workspace</span>
            <span className="text-[#C4B399] hidden sm:inline">•</span>
            <span className="font-mono text-[10px] sm:text-[11px] text-[#694C1D] hidden sm:inline">Real-Time Sync</span>
          </motion.div>
          
          {/* Main Hero Headline with High-Contrast Typography & Golden Italic Accent */}
          <motion.h1 
            variants={fadeIn} 
            className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] font-bold tracking-tight text-[#171513] leading-[1.08] mb-6 sm:mb-8 max-w-4xl"
          >
            The clarity your team{' '}
            <span className="font-serif italic font-normal text-[#9E7432] inline-block tracking-normal">
              requires.
            </span>
          </motion.h1>
          
          {/* Subtitle with High-Contrast Crisp Readability */}
          <motion.p 
            variants={fadeIn} 
            className="max-w-2xl text-base sm:text-lg md:text-xl text-[#4A433A] font-normal leading-relaxed mb-8 sm:mb-10 px-2"
          >
            A classically crafted collaboration engine. Real-time Kanban, live telemetry analytics, context-aware dialogue, and an omniscient search—without the clutter.
          </motion.p>
          
          {/* Action CTAs */}
          <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-14 sm:mb-20 w-full sm:w-auto">
             <Link
               to="/signup"
               className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#181614] hover:bg-[#282420] px-7 sm:px-9 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-[#FAF8F5] rounded-full shadow-[0_8px_25px_-4px_rgba(24,22,20,0.28)] hover:shadow-[0_12px_32px_-4px_rgba(160,120,60,0.28)] border border-[#36312B] hover:-translate-y-0.5 transition-all duration-300"
             >
               <span>Enter the workspace</span>
               <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
             </Link>
             <a
               href="#kanban-preview"
               className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/90 hover:bg-[#F5EFE4] px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-semibold text-[#3D372E] rounded-full border border-[#DCD3C3] shadow-2xs hover:-translate-y-0.5 transition-all duration-300"
             >
               <span>Explore live views</span>
               <ArrowDown size={15} className="text-[#877D70]" />
             </a>
          </motion.div>

          {/* Centered High-Fidelity App Studio Window Mockup */}
          <motion.div 
            variants={fadeIn}
            id="kanban-preview"
            className="w-full max-w-6xl bg-white border border-[#E6DFD3] shadow-[0_20px_60px_-15px_rgba(35,28,20,0.09),0_6px_20px_-5px_rgba(35,28,20,0.04)] rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col text-left transition-all"
          >
             {/* Studio Window Chrome Bar */}
             <div className="h-12 sm:h-14 border-b border-[#EBE4D8] bg-[#F7F4EE] flex items-center justify-between px-3 sm:px-6 shrink-0">
                
                {/* Window Traffic Lights & Breadcrumbs */}
                <div className="flex items-center gap-3 sm:gap-4">
                   <div className="flex gap-1.5 sm:gap-2">
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#E57A77] border border-[#D4605D]/40"></div>
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#E8BD65] border border-[#D4A74E]/40"></div>
                      <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#6FC28E] border border-[#59AC78]/40"></div>
                   </div>

                   <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#544D43] pl-2 border-l border-[#E2DAD0]">
                      <span className="font-bold text-[#171513]">NX</span>
                      <span className="text-[#A3998C]">/</span>
                      <span>Engineering Workspace</span>
                   </div>
                </div>

                {/* View Switcher: Kanban vs Live Telemetry */}
                <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-[#EBE4D8]/80 border border-[#DDD5C7] text-[11px] sm:text-xs font-semibold">
                   <button
                     type="button"
                     onClick={() => setHeroView('kanban')}
                     className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                       heroView === 'kanban'
                         ? 'bg-white text-[#171513] shadow-2xs font-bold'
                         : 'text-[#6B6254] hover:text-[#171513]'
                     }`}
                   >
                     <Kanban size={12} className={heroView === 'kanban' ? 'text-[#9E7432]' : ''} />
                     <span>Kanban</span>
                   </button>
                   <button
                     type="button"
                     onClick={() => setHeroView('telemetry')}
                     className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-lg transition-all cursor-pointer ${
                       heroView === 'telemetry'
                         ? 'bg-white text-[#171513] shadow-2xs font-bold'
                         : 'text-[#6B6254] hover:text-[#171513]'
                     }`}
                   >
                     <BarChart3 size={12} className={heroView === 'telemetry' ? 'text-[#9E7432]' : ''} />
                     <span>Telemetry</span>
                   </button>
                </div>

                {/* Omniscient Search Indicator & User Avatar */}
                <div className="flex items-center gap-2 sm:gap-3">
                   <div className="hidden md:flex items-center gap-2 bg-white border border-[#DDD5C7] px-3 py-1.5 rounded-lg text-xs text-[#70675B] shadow-2xs">
                      <Search size={12} className="text-[#9E7432]" />
                      <span className="font-mono text-[11px]">Search deliverables...</span>
                      <kbd className="ml-2 font-mono text-[10px] bg-[#F3ECE0] text-[#7A5822] px-1.5 py-0.5 rounded border border-[#E2D6C0]">⌘K</kbd>
                   </div>
                   <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#181614] text-[#FAF8F5] border border-[#363028] flex items-center justify-center text-[11px] font-bold shadow-2xs">
                      AA
                   </div>
                </div>
             </div>
             
             {/* Dynamic Studio Window Content */}
             <div className="p-4 sm:p-6 md:p-8 bg-[#FAF8F5] min-h-[460px]">
                <AnimatePresence mode="wait">
                  {heroView === 'kanban' ? (
                    /* KANBAN BOARD VIEW */
                    <motion.div
                      key="kanban-view"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                      {/* Column 1: TODO */}
                      <div className="w-[85vw] sm:w-[320px] min-w-[270px] max-w-[320px] flex flex-col gap-3.5 snap-center shrink-0">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold text-[#544D42] flex items-center gap-2">
                              <Clock size={14} className="text-[#9E7432]" />
                              <span>TODO</span>
                            </span>
                            <span className="text-xs font-bold font-mono bg-white border border-[#E5DFD3] text-[#544D42] px-2 py-0.5 rounded-md shadow-2xs">
                              2
                            </span>
                         </div>
                         
                         {/* Ticket Card 1 */}
                         <div className="bg-white border border-[#E8E2D6] rounded-xl p-4 shadow-sm hover:border-[#D8CEBE] transition-all flex flex-col gap-3 group">
                            <div className="flex justify-between items-center">
                               <span className="text-[11px] font-bold font-mono text-[#8C6225] bg-[#FAF3E6] px-2 py-0.5 rounded-md border border-[#EADBBD]">
                                 HIGH
                                </span>
                               <span className="text-[11px] font-mono text-[#8A8173] font-medium">NEX-101</span>
                            </div>
                            <h4 className="text-sm font-bold text-[#171513] leading-snug group-hover:text-[#9E7432] transition-colors">
                              Finalize Multi-Tenant Migration
                            </h4>
                            <p className="text-xs text-[#595248] leading-relaxed line-clamp-2">
                              Enforce strict database tenant boundary checks across all team invitations and workspace queries.
                            </p>
                            <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-[#736A5E] text-xs">
                               <div className="flex items-center gap-1.5 font-medium">
                                 <AlignLeft size={13} className="text-[#9E7432]" />
                                 <span className="text-[11px] font-mono">4/5 tasks</span>
                               </div>
                               <div className="h-6 w-6 rounded-full bg-[#292520] text-[#FAF8F5] flex items-center justify-center text-[10px] font-bold shadow-2xs">
                                 JD
                               </div>
                            </div>
                         </div>

                         {/* Ticket Card 2 */}
                         <div className="bg-white border border-[#E8E2D6] rounded-xl p-4 shadow-sm hover:border-[#D8CEBE] transition-all flex flex-col gap-3 group">
                            <div className="flex justify-between items-center">
                               <span className="text-[11px] font-bold font-mono text-[#4A4339] bg-[#F3ECE0] px-2 py-0.5 rounded-md border border-[#E2D7C2]">
                                 LOW
                               </span>
                               <span className="text-[11px] font-mono text-[#8A8173] font-medium">NEX-102</span>
                            </div>
                            <h4 className="text-sm font-bold text-[#171513] leading-snug group-hover:text-[#9E7432] transition-colors">
                              Typography Scale & Golden Ratio
                            </h4>
                            <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-[#736A5E] text-xs">
                               <div className="flex items-center gap-1 text-[#7A7165]">
                                 <MessageSquare size={13} />
                                 <span className="text-xs font-mono">3 notes</span>
                               </div>
                               <div className="h-6 w-6 rounded-full bg-[#EBE4D8] text-[#3D372E] border border-[#DDD5C7] flex items-center justify-center text-[10px] font-bold">
                                 SA
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Column 2: IN PROGRESS */}
                      <div className="w-[85vw] sm:w-[320px] min-w-[270px] max-w-[320px] flex flex-col gap-3.5 snap-center shrink-0">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold text-[#171513] flex items-center gap-2">
                              <Zap size={14} className="text-[#D97706]" />
                              <span>IN PROGRESS</span>
                            </span>
                            <span className="text-xs font-bold font-mono bg-[#FAF3E6] border border-[#EBDCBF] text-[#8C6225] px-2 py-0.5 rounded-md shadow-2xs">
                              1
                            </span>
                         </div>
                         
                         {/* In Progress Ticket - Elevated Studio Look */}
                         <div className="bg-white border-2 border-[#D8CEBE] rounded-xl p-4 shadow-[0_12px_32px_-8px_rgba(40,30,20,0.1)] flex flex-col gap-3 relative overflow-hidden ring-1 ring-[#9E7432]/20">
                            <div className="absolute top-0 right-0 w-12 h-12 bg-[#FAF3E6] rounded-bl-3xl flex items-start justify-end p-2">
                               <div className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse"></div>
                            </div>
                            <div className="flex justify-between items-center relative z-10 pr-6">
                               <span className="text-[11px] font-bold font-mono text-[#8C6225] bg-[#FAF3E6] px-2 py-0.5 rounded-md border border-[#EADBBD]">
                                 URGENT
                               </span>
                               <span className="text-[11px] font-mono text-[#8A8173] font-medium">NEX-103</span>
                            </div>
                            <h4 className="text-sm font-bold text-[#171513] leading-snug">
                              Real-Time Telemetry & Socket Pipeline
                            </h4>
                            <p className="text-xs text-[#524B40] leading-relaxed">
                              Broadcasting task reorders and state delta events across all active team sockets with sub-10ms delivery.
                            </p>
                            
                            {/* Visual Progress Bar */}
                            <div className="space-y-1.5 pt-1">
                               <div className="flex justify-between text-[11px] font-mono text-[#6E6557]">
                                 <span>Progress</span>
                                 <span className="font-bold text-[#8C6225]">75%</span>
                               </div>
                               <div className="w-full h-1.5 bg-[#F2EDE4] rounded-full overflow-hidden">
                                 <div className="h-full bg-gradient-to-r from-[#C29548] to-[#9E7432] rounded-full" style={{ width: '75%' }}></div>
                               </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-xs">
                               <div className="flex items-center gap-1.5 text-[#2D6A42] font-semibold text-[11px]">
                                  <CheckCircle2 size={13} />
                                  <span>3 / 4 completed</span>
                               </div>
                               <div className="h-6 w-6 rounded-full bg-[#181614] text-[#FAF8F5] border border-[#38332E] flex items-center justify-center text-[10px] font-bold shadow-xs">
                                 AA
                               </div>
                            </div>
                         </div>
                      </div>

                      {/* Column 3: DONE */}
                      <div className="w-[85vw] sm:w-[320px] min-w-[270px] max-w-[320px] flex flex-col gap-3.5 snap-center shrink-0 opacity-90">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-xs font-bold text-[#544D42] flex items-center gap-2">
                              <CheckCircle2 size={14} className="text-[#2D6A42]" />
                              <span>DONE</span>
                            </span>
                            <span className="text-xs font-bold font-mono bg-white border border-[#E5DFD3] text-[#544D42] px-2 py-0.5 rounded-md shadow-2xs">
                              12
                            </span>
                         </div>
                         
                         {/* Completed Ticket */}
                         <div className="bg-white/80 border border-[#E5DFD3] rounded-xl p-4 shadow-2xs flex flex-col gap-2.5">
                            <div className="flex justify-between items-center">
                               <span className="text-[11px] font-bold font-mono text-[#2D6A42] bg-[#F0F7F2] px-2 py-0.5 rounded-md border border-[#CDE5D4]">
                                 RESOLVED
                               </span>
                               <span className="text-[11px] font-mono text-[#8A8173]">NEX-098</span>
                            </div>
                            <h4 className="text-sm font-semibold text-[#665E52] line-through">
                              Zero-Trust JWT Auth & IDOR Shield
                            </h4>
                            <div className="flex items-center justify-between pt-2 border-t border-[#F2EDE4] text-xs text-[#82786B]">
                               <span className="text-[11px]">Verified on Staging</span>
                               <div className="h-5 w-5 rounded-full bg-[#292520] text-[#FAF8F5] flex items-center justify-center text-[9px] font-bold">
                                 AA
                               </div>
                            </div>
                         </div>

                         {/* Second Completed Ticket */}
                         <div className="bg-white/80 border border-[#E5DFD3] rounded-xl p-4 shadow-2xs flex flex-col gap-2.5">
                            <div className="flex justify-between items-center">
                               <span className="text-[11px] font-bold font-mono text-[#2D6A42] bg-[#F0F7F2] px-2 py-0.5 rounded-md border border-[#CDE5D4]">
                                 RESOLVED
                               </span>
                               <span className="text-[11px] font-mono text-[#8A8173]">NEX-097</span>
                            </div>
                            <h4 className="text-sm font-semibold text-[#665E52] line-through">
                              Automated MongoDB Sharding Strategy
                            </h4>
                            <div className="flex items-center justify-between pt-2 border-t border-[#F2EDE4] text-xs text-[#82786B]">
                               <span className="text-[11px]">Sub-1ms Query P99</span>
                               <div className="h-5 w-5 rounded-full bg-[#EBE4D8] text-[#3D372E] flex items-center justify-center text-[9px] font-bold">
                                 JD
                               </div>
                            </div>
                         </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* LIVE TELEMETRY & ANALYTICS VIEW */
                    <motion.div
                      key="telemetry-view"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="flex flex-col gap-6"
                    >
                      {/* Top Telemetry KPI Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* KPI 1: Scope */}
                        <div className="bg-white rounded-xl border border-[#E8E2D6] p-5 shadow-sm flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7163] font-bold">Total Scope</span>
                             <span className="text-[11px] font-mono text-[#8C6225] font-semibold">18 queued</span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-1">
                             <span className="text-3xl font-extrabold text-[#171513] font-sans tabular-nums">128</span>
                             <span className="text-xs font-mono text-[#7A7163]">units</span>
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-[#F2EDE4]">
                             <div className="w-full h-1.5 bg-[#F2EDE4] rounded-full overflow-hidden">
                                <div className="h-full bg-[#8C6225] rounded-full" style={{ width: '65%' }}></div>
                             </div>
                          </div>
                        </div>

                        {/* KPI 2: Active WIP */}
                        <div className="bg-white rounded-xl border border-[#E8E2D6] p-5 shadow-sm flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7163] font-bold">Active WIP</span>
                             <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#2D6A42] bg-[#F0F7F2] px-1.5 py-0.5 rounded">
                               <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A42] animate-pulse"></span>
                               HEALTHY
                             </span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-1">
                             <span className="text-3xl font-extrabold text-[#171513] font-sans tabular-nums">14</span>
                             <span className="text-xs font-mono text-[#7A7163]">in-flight</span>
                          </div>
                          <p className="text-xs text-[#5C5549] mt-3 pt-2.5 border-t border-[#F2EDE4]">
                             Zero blocked bottlenecks
                          </p>
                        </div>

                        {/* KPI 3: Resolution Velocity (Circular Gauge) */}
                        <div className="bg-white rounded-xl border border-[#E8E2D6] p-5 shadow-sm flex items-center justify-between">
                          <div>
                             <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7163] font-bold block mb-1">Velocity</span>
                             <div className="text-3xl font-extrabold text-[#171513] font-sans tabular-nums">92%</div>
                             <span className="text-xs text-[#2D6A42] font-semibold mt-1 inline-block">+14% sprint trend</span>
                          </div>
                          <div className="relative w-14 h-14 flex items-center justify-center">
                             <svg className="w-14 h-14 -rotate-90">
                                <circle cx="28" cy="28" r="22" stroke="#F2ECE1" strokeWidth="4" fill="none" />
                                <circle 
                                  cx="28" 
                                  cy="28" 
                                  r="22" 
                                  stroke="#9E7432" 
                                  strokeWidth="4" 
                                  fill="none" 
                                  strokeDasharray="138" 
                                  strokeDashoffset="12" 
                                  strokeLinecap="round" 
                                />
                             </svg>
                             <Zap size={14} className="text-[#9E7432] absolute" />
                          </div>
                        </div>

                        {/* KPI 4: Lead Time */}
                        <div className="bg-white rounded-xl border border-[#E8E2D6] p-5 shadow-sm flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-[11px] font-mono uppercase tracking-wider text-[#7A7163] font-bold">Cycle Time</span>
                             <span className="text-[11px] font-mono text-[#2D6A42] font-semibold">1.4 days avg</span>
                          </div>
                          <div className="flex items-baseline gap-2 mb-1">
                             <span className="text-3xl font-extrabold text-[#171513] font-sans tabular-nums">32h</span>
                             <span className="text-xs font-mono text-[#7A7163]">to production</span>
                          </div>
                          <p className="text-xs text-[#5C5549] mt-3 pt-2.5 border-t border-[#F2EDE4]">
                             99.4% deploy confidence
                          </p>
                        </div>
                      </div>

                      {/* Velocity Throughput Chart Simulation */}
                      <div className="bg-white rounded-xl border border-[#E8E2D6] p-5 sm:p-6 shadow-sm">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                            <div>
                               <h4 className="text-sm font-bold text-[#171513] flex items-center gap-2">
                                 <TrendingUp size={16} className="text-[#9E7432]" />
                                 <span>Sprint Throughput & Deliverable Volume</span>
                               </h4>
                               <p className="text-xs text-[#6B6254]">Completed tickets tracked per 24-hour deployment cycle</p>
                            </div>
                            <span className="self-start sm:self-auto text-xs font-mono font-semibold text-[#8C6225] bg-[#FAF3E6] px-2.5 py-1 rounded-md border border-[#EADBBD]">
                              Target: 18 units/day
                            </span>
                         </div>

                         {/* Bar Chart Visualization */}
                         <div className="h-40 flex items-end gap-3 sm:gap-6 pt-4 pb-2 border-b border-[#F2EDE4]">
                            {[
                              { day: 'Mon', h: '60%', units: 14 },
                              { day: 'Tue', h: '85%', units: 21 },
                              { day: 'Wed', h: '75%', units: 19 },
                              { day: 'Thu', h: '95%', units: 24 },
                              { day: 'Fri', h: '90%', units: 22 },
                              { day: 'Sat', h: '45%', units: 8 },
                              { day: 'Sun', h: '35%', units: 6 },
                            ].map((bar, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                <div className="text-[10px] font-mono font-bold text-[#8C6225] opacity-0 group-hover:opacity-100 transition-opacity">
                                  {bar.units}
                                </div>
                                <div 
                                  className={`w-full rounded-t-md transition-all duration-300 ${
                                    i === 3 
                                      ? 'bg-gradient-to-t from-[#B8860B] to-[#C99C38] shadow-xs' 
                                      : 'bg-[#EBDCBF] hover:bg-[#D4BF9B]'
                                  }`} 
                                  style={{ height: bar.h }}
                                />
                                <span className="text-[11px] font-mono text-[#736B5F] font-medium">{bar.day}</span>
                              </div>
                            ))}
                         </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </motion.div>
        </motion.div>
      </header>

      {/* 2. Elite Engineering Proof Ribbon */}
      <section className="border-y border-[#E8E1D5] bg-white/70 backdrop-blur-sm py-8 sm:py-10 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <p className="text-[11px] font-bold font-mono tracking-widest text-[#7D7364] uppercase mb-6 sm:mb-7">
            TRUSTED BY DISCIPLINED ENGINEERING TEAMS
          </p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-14 items-center text-[#26221B] font-semibold opacity-85">
            <span className="text-lg sm:text-xl font-bold tracking-tighter hover:text-[#9E7432] transition-colors">VERTEX</span>
            <span className="text-lg sm:text-xl font-serif italic hover:text-[#9E7432] transition-colors">Lumina</span>
            <span className="text-lg sm:text-xl font-bold tracking-widest hover:text-[#9E7432] transition-colors">QUANTUM</span>
            <span className="text-lg sm:text-xl font-bold tracking-tight hover:text-[#9E7432] transition-colors">O B S I D I A N</span>
            <span className="text-lg sm:text-xl font-mono tracking-tight hover:text-[#9E7432] transition-colors">AXIOM//LABS</span>
          </div>
        </div>
      </section>

      {/* 3-8: Deep-Dive Studio Feature Showcase */}
      <section className="py-20 sm:py-28 lg:py-36 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 flex flex-col gap-24 sm:gap-36">
          
          {/* Section 01: Contextual Dialogue */}
          <motion.div 
            id="chat-preview"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center"
          >
            <motion.div variants={fadeIn} className="order-2 lg:order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3ECE0] border border-[#E2D6C0] text-[#7A5822] text-xs font-mono font-bold mb-3 sm:mb-4">
                <span>01</span>
                <span>•</span>
                <span>IN-FABRIC DIALOGUE</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171513] mb-4 sm:mb-5">
                Contextual Dialogue
              </h3>
              <p className="text-[#4A433A] font-normal leading-relaxed text-base sm:text-lg">
                Conversations where they belong. Stop switching tabs to clarify a requirement. Real-time team messaging is built directly into the fabric of your workspace, permanently attached to tickets.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="order-1 lg:order-2">
               <div className="w-full aspect-[4/5] sm:aspect-[4/3] bg-white border border-[#E6DFD3] rounded-2xl shadow-[0_12px_40px_-10px_rgba(35,28,20,0.07)] flex overflow-hidden">
                 
                 {/* Channels Sidebar */}
                 <div className="hidden sm:flex w-1/3 border-r border-[#EFE8DD] bg-[#FAF8F5] p-4 flex-col">
                   <div className="font-bold text-[11px] font-mono text-[#7D7364] uppercase tracking-wider mb-4">Direct Channels</div>
                   
                   <div className="flex items-center gap-2.5 bg-white p-2.5 rounded-xl border border-[#E2D8C6] shadow-2xs mb-2 cursor-pointer">
                      <div className="h-8 w-8 rounded-full bg-[#292520] text-[#FAF8F5] flex items-center justify-center text-xs font-bold shrink-0">JD</div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-[#171513] truncate">John Doe</div>
                        <div className="text-[10px] text-[#7A7163] truncate">Shared PR diff</div>
                      </div>
                   </div>

                   <div className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-[#F3ECE0]/60 cursor-pointer transition-colors">
                      <div className="h-8 w-8 rounded-full bg-[#EBE4D8] text-[#3D372E] border border-[#DDD5C7] flex items-center justify-center text-xs font-bold shrink-0">SA</div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-[#171513] truncate">Sarah Ali</div>
                        <div className="text-[10px] text-[#7A7163] truncate">LGTM! Let's deploy.</div>
                      </div>
                   </div>
                 </div>

                 {/* Message Stream with Crisp High-Contrast Speech Bubbles */}
                 <div className="w-full sm:w-2/3 p-4 sm:p-6 flex flex-col justify-end bg-white">
                    <div className="flex items-start gap-2.5 mb-4">
                       <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#EBE4D8] text-[#3D372E] border border-[#DDD5C7] flex items-center justify-center text-[11px] font-bold shrink-0">
                         SA
                       </div>
                       <div className="bg-[#FAF8F5] border border-[#E6DFD3] p-3 rounded-2xl rounded-tl-sm text-xs text-[#26221C] max-w-[85%] leading-relaxed shadow-2xs">
                         Did anyone check the new auth flow on staging before we merge?
                       </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5 mb-2 flex-row-reverse">
                       <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#181614] text-[#FAF8F5] border border-[#38332E] flex items-center justify-center text-[11px] font-bold shrink-0 shadow-2xs">
                         AA
                       </div>
                       <div className="bg-[#181614] text-[#FAF8F5] p-3 rounded-2xl rounded-tr-sm text-xs max-w-[85%] leading-relaxed shadow-sm">
                         Checking now. The <code className="bg-[#2D2A26] text-[#E8C88A] px-1 rounded text-[11px] font-mono">JWT_SECRET</code> was missing in the staging secret manager. Fixed and deployed.
                       </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F2EDE4] flex items-center justify-between text-[11px] text-[#7A7163]">
                       <span className="flex items-center gap-1.5 font-medium">
                         <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A42]"></span>
                         Socket Live: 8ms latency
                       </span>
                       <span className="font-mono">Synced</span>
                    </div>
                 </div>
               </div>
            </motion.div>
          </motion.div>

          {/* Section 02: Omniscient Search Engine */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center"
          >
            <motion.div variants={fadeIn} className="order-1">
               <div className="w-full aspect-[4/5] sm:aspect-[4/3] bg-[#F7F4EE] rounded-2xl shadow-inner p-4 sm:p-6 lg:p-10 flex flex-col justify-center items-center relative overflow-hidden border border-[#E6DFD3]">
                  
                  {/* Floating Command Palette Modal */}
                  <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_16px_40px_-10px_rgba(35,28,20,0.12)] overflow-hidden relative z-10 flex flex-col border border-[#DDD5C7]">
                     <div className="flex items-center gap-3 p-3.5 sm:p-4 border-b border-[#F0EBE2] bg-[#FAF8F5]">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-[#9E7432]" />
                        <span className="text-xs sm:text-sm font-semibold text-[#171513]">"JWT secret"</span>
                        <span className="ml-auto text-[10px] font-mono bg-[#FAF3E6] text-[#8C6225] px-1.5 py-0.5 rounded border border-[#EADBBD]">3 MATCHES</span>
                     </div>
                     <div className="p-2 flex flex-col bg-white divide-y divide-[#F5F0E6]">
                        <div className="p-2.5 sm:p-3 hover:bg-[#FAF8F5] rounded-xl flex gap-3 cursor-pointer transition-colors">
                           <MessageSquare className="h-4 w-4 text-[#9E7432] mt-0.5 shrink-0" />
                           <div>
                              <div className="text-xs font-bold text-[#171513]">
                                Team Chat <span className="text-[#877E71] font-normal ml-2">2 mins ago</span>
                              </div>
                              <div className="text-xs text-[#524B40] mt-1 leading-relaxed">
                                Checking now. The <mark className="bg-[#FAF3E6] text-[#8C6225] font-semibold px-1 rounded border border-[#EADBBD]">JWT secret</mark> was missing in the staging...
                              </div>
                           </div>
                        </div>

                        <div className="p-2.5 sm:p-3 hover:bg-[#FAF8F5] rounded-xl flex gap-3 cursor-pointer transition-colors">
                           <CheckCircle2 className="h-4 w-4 text-[#2D6A42] mt-0.5 shrink-0" />
                           <div>
                              <div className="text-xs font-bold text-[#171513]">
                                NEX-098 <span className="text-[#877E71] font-normal ml-2">Security Module</span>
                              </div>
                              <div className="text-xs text-[#524B40] mt-1 leading-relaxed">
                                Zero-Trust <mark className="bg-[#FAF3E6] text-[#8C6225] font-semibold px-1 rounded border border-[#EADBBD]">JWT</mark> Auth & IDOR Shield implementation.
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </motion.div>
            
            <motion.div variants={fadeIn} className="order-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3ECE0] border border-[#E2D6C0] text-[#7A5822] text-xs font-mono font-bold mb-3 sm:mb-4">
                <span>02</span>
                <span>•</span>
                <span>SUB-MILLISECOND RETRIEVAL</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171513] mb-4 sm:mb-5">
                Omniscient Search Engine
              </h3>
              <p className="text-[#4A433A] font-normal leading-relaxed text-base sm:text-lg">
                Never lose a thought. We engineered custom MongoDB inverted text indexes to allow you to instantly query through millions of tickets, descriptions, code diffs, and comments with zero lag.
              </p>
            </motion.div>
          </motion.div>

          {/* Section 03: Continuous Telemetry & Analytics */}
          <motion.div 
            id="telemetry-preview"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center"
          >
            <motion.div variants={fadeIn} className="order-2 lg:order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3ECE0] border border-[#E2D6C0] text-[#7A5822] text-xs font-mono font-bold mb-3 sm:mb-4">
                <span>03</span>
                <span>•</span>
                <span>REAL-TIME TELEMETRY</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171513] mb-4 sm:mb-5">
                Velocity & Pipeline Analytics
              </h3>
              <p className="text-[#4A433A] font-normal leading-relaxed text-base sm:text-lg">
                Complete engineering visibility. Understand sprint saturation, track WIP limits, audit operative load across team members, and observe your cycle time velocity in a single unified view.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="order-1 lg:order-2">
               <div className="w-full aspect-[4/5] sm:aspect-[4/3] bg-white border border-[#E6DFD3] rounded-2xl shadow-[0_12px_40px_-10px_rgba(35,28,20,0.07)] p-5 sm:p-7 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE1]">
                     <div className="flex items-center gap-2">
                        <BarChart3 className="text-[#9E7432]" size={18} />
                        <span className="text-xs font-bold text-[#171513]">Workspace Pipeline Telemetry</span>
                     </div>
                     <span className="text-[11px] font-mono font-bold text-[#2D6A42] bg-[#F0F7F2] px-2 py-0.5 rounded border border-[#CDE5D4]">
                       Active Sprint
                     </span>
                  </div>

                  {/* Stage Distribution Breakdown */}
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-semibold text-[#544D42]">
                        <span>Stage Allocation</span>
                        <span className="font-mono text-[#8C6225]">128 Total Units</span>
                     </div>
                     <div className="w-full h-3 bg-[#F2EDE4] rounded-full overflow-hidden flex">
                        <div className="h-full bg-[#C29548]" style={{ width: '45%' }} title="Done (45%)"></div>
                        <div className="h-full bg-[#D97706]" style={{ width: '30%' }} title="In Progress (30%)"></div>
                        <div className="h-full bg-[#877E71]" style={{ width: '25%' }} title="Todo (25%)"></div>
                     </div>
                     <div className="flex justify-between text-[11px] font-mono text-[#7A7163] pt-1">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#C29548]"></span> Done 45%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#D97706]"></span> In Progress 30%</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#877E71]"></span> Backlog 25%</span>
                     </div>
                  </div>

                  {/* Operative Load Mini Metric Cards */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <div className="bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl p-3 flex flex-col">
                        <span className="text-[10px] font-mono uppercase text-[#7A7163] font-bold">Throughput</span>
                        <span className="text-xl font-extrabold text-[#171513] font-mono mt-0.5">24 units/d</span>
                     </div>
                     <div className="bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl p-3 flex flex-col">
                        <span className="text-[10px] font-mono uppercase text-[#7A7163] font-bold">P99 Latency</span>
                        <span className="text-xl font-extrabold text-[#2D6A42] font-mono mt-0.5">8.2 ms</span>
                     </div>
                  </div>
               </div>
            </motion.div>
          </motion.div>

          {/* Section 04: Isolated Workspaces */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center"
          >
            <motion.div variants={fadeIn} className="order-1">
               <div className="w-full aspect-[4/5] sm:aspect-[4/3] bg-white border border-[#E6DFD3] rounded-2xl shadow-[0_12px_40px_-10px_rgba(35,28,20,0.07)] p-4 sm:p-6 flex flex-col justify-center gap-3 sm:gap-4">
                  <div className="text-[11px] font-bold font-mono text-[#7D7364] uppercase tracking-wider mb-1">
                    Isolated Tenant Workspaces
                  </div>
                  
                  {/* Active Engineering Workspace */}
                  <div className="bg-[#FAF8F5] border-2 border-[#181614] rounded-xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 bg-[#181614] text-[#FAF8F5] rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold font-mono shrink-0 shadow-xs">
                          EN
                        </div>
                        <div>
                           <div className="text-xs sm:text-sm font-bold text-[#171513]">Engineering Core</div>
                           <div className="text-[11px] text-[#70675B] font-medium">12 Active Members • Private VPC</div>
                        </div>
                     </div>
                     <span className="bg-[#F3ECE0] text-[#7A5822] border border-[#E2D6C0] text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                       ACTIVE TENANT
                     </span>
                  </div>

                  {/* Core Infra Workspace */}
                  <div className="bg-white border border-[#E5DFD3] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 bg-[#EBE4D8] text-[#3D372E] border border-[#DDD5C7] rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold font-mono shrink-0">
                          IN
                        </div>
                        <div>
                           <div className="text-xs sm:text-sm font-bold text-[#171513]">Infrastructure & SRE</div>
                           <div className="text-[11px] text-[#70675B]">6 Members • Isolated Database</div>
                        </div>
                     </div>
                     <span className="text-[11px] font-mono text-[#8C8375]">SWITCH</span>
                  </div>

                  {/* Product Design Workspace */}
                  <div className="bg-white border border-[#E5DFD3] rounded-xl p-3.5 sm:p-4 shadow-2xs flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer">
                     <div className="flex items-center gap-3">
                        <div className="h-9 w-9 sm:h-10 sm:w-10 bg-[#EBE4D8] text-[#3D372E] border border-[#DDD5C7] rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold font-mono shrink-0">
                          DS
                        </div>
                        <div>
                           <div className="text-xs sm:text-sm font-bold text-[#171513]">Product & UX Design</div>
                           <div className="text-[11px] text-[#70675B]">5 Members • Design Tokens</div>
                        </div>
                     </div>
                     <span className="text-[11px] font-mono text-[#8C8375]">SWITCH</span>
                  </div>
               </div>
            </motion.div>
            
            <motion.div variants={fadeIn} className="order-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3ECE0] border border-[#E2D6C0] text-[#7A5822] text-xs font-mono font-bold mb-3 sm:mb-4">
                <span>04</span>
                <span>•</span>
                <span>TENANT BOUNDARY</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171513] mb-4 sm:mb-5">
                Isolated Workspaces
              </h3>
              <p className="text-[#4A433A] font-normal leading-relaxed text-base sm:text-lg">
                Create dedicated environments for different departments. Infrastructure, Core Engineering, and Design can all operate in their own silos without overwhelming each other, yet still remain under one unified company roof.
              </p>
            </motion.div>
          </motion.div>

          {/* Section 05: Enterprise Security & Silent Audit Trails */}
          <motion.div 
            id="security-preview"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center"
          >
            <motion.div variants={fadeIn} className="order-2 lg:order-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3ECE0] border border-[#E2D6C0] text-[#7A5822] text-xs font-mono font-bold mb-3 sm:mb-4">
                <span>05</span>
                <span>•</span>
                <span>ENTERPRISE SANCTUARY</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171513] mb-4 sm:mb-5">
                Enterprise Security & Audit Trails
              </h3>
              <p className="text-[#4A433A] font-normal leading-relaxed text-base sm:text-lg">
                Complete peace of mind. Stateful invitation lifecycles, encrypted JWT authentication, strict IDOR middleware, and automated activity logging keep your operations fully observable and isolated.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="order-1 lg:order-2">
               <div className="w-full aspect-[4/5] sm:aspect-[4/3] bg-white border border-[#E6DFD3] rounded-2xl shadow-[0_12px_40px_-10px_rgba(35,28,20,0.07)] p-5 sm:p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3">
                     <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-[#9E7432]" />
                        <span className="font-bold text-xs sm:text-sm text-[#171513]">Immutable Activity Trail</span>
                     </div>
                     <span className="text-[10px] font-mono text-[#2D6A42] font-bold bg-[#F0F7F2] px-2 py-0.5 rounded border border-[#CDE5D4]">
                       Verified
                     </span>
                  </div>

                  <div className="flex flex-col gap-4 relative my-auto">
                     <div className="absolute left-3.5 sm:left-4 top-2 bottom-2 w-px bg-[#E8E1D5]"></div>
                     
                     <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#181614] text-[#FAF8F5] flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 shadow-2xs border-2 border-white">
                          AA
                        </div>
                        <div className="pt-0.5">
                           <div className="text-xs sm:text-sm text-[#26221C] leading-snug">
                             <span className="font-bold">Ahmad Aamir</span> moved <span className="font-mono font-semibold text-[#8C6225]">NEX-103</span> to <span className="font-bold text-[#171513] font-mono">IN PROGRESS</span>
                           </div>
                           <div className="text-[11px] text-[#7A7163] mt-0.5 font-mono">2 minutes ago • Automated Socket Dispatch</div>
                        </div>
                     </div>

                     <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#EBE4D8] text-[#3D372E] border border-[#DDD5C7] flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 shadow-2xs">
                          SA
                        </div>
                        <div className="pt-0.5">
                           <div className="text-xs sm:text-sm text-[#26221C] leading-snug">
                             <span className="font-bold">Sarah Ali</span> commented on <span className="font-mono font-semibold text-[#8C6225]">NEX-102</span>
                           </div>
                           <div className="text-[11px] text-[#7A7163] mt-0.5 font-mono">1 hour ago • Direct Attachment</div>
                        </div>
                     </div>
                  </div>

                  {/* Security Verification Badge */}
                  <div className="bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl p-3 flex items-center justify-between text-xs">
                     <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#9E7432]" />
                        <span className="font-semibold text-[#171513]">IDOR Protection & RBAC Active</span>
                     </div>
                     <span className="text-[10px] font-mono text-[#8C6225] font-bold">100% PASS</span>
                  </div>
               </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 9. Final Studio Call to Action */}
      <section className="bg-[#181614] py-24 sm:py-32 px-4 sm:px-6 text-center text-[#FAF8F5] relative overflow-hidden z-10 border-t border-[#332E27]">
         
         {/* Warm Halo Glow behind CTA */}
         <div 
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-[120px] pointer-events-none opacity-25"
           style={{ background: 'radial-gradient(circle, rgba(212, 165, 80, 0.45) 0%, transparent 70%)' }}
         />

         <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={staggerContainer}
            className="mx-auto max-w-3xl relative z-10"
         >
            <motion.div variants={fadeIn}>
              <div className="w-14 h-14 rounded-2xl bg-[#29241E] border border-[#423C32] mx-auto mb-6 flex items-center justify-center shadow-lg">
                <img src={nexusIcon} alt="Nexus" className="h-7 w-7 object-contain opacity-90" />
              </div>
            </motion.div>
            
            <motion.h2 variants={fadeIn} className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 sm:mb-8 text-[#FAF8F5]">
               Ready to reclaim your focus?
            </motion.h2>

            <motion.p variants={fadeIn} className="text-sm sm:text-lg text-[#C2B7A5] max-w-xl mx-auto mb-8 sm:mb-10 font-normal leading-relaxed">
               Join disciplined teams using NEXUS to coordinate deliverables, observe real-time telemetry, and eliminate workflow friction.
            </motion.p>
            
            <motion.div variants={fadeIn}>
              <Link
                  to="/signup"
                  className="inline-flex items-center gap-3 bg-[#FAF8F5] hover:bg-white text-[#181614] px-8 sm:px-11 py-4 sm:py-4.5 text-sm sm:text-base font-bold rounded-full shadow-[0_12px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_40px_rgba(200,160,80,0.3)] hover:-translate-y-0.5 transition-all"
                >
                  <span>Start building today</span>
                  <ArrowRight size={17} />
              </Link>
            </motion.div>
         </motion.div>
      </section>

      {/* 10. Refined Apple-Style Footer */}
      <footer className="bg-[#FAF7F2] border-t border-[#E8E1D5] pt-16 sm:pt-20 pb-10 sm:pb-12 px-6 lg:px-12 relative z-10">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
           <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={nexusLogo} alt="Nexus" className="h-5 sm:h-6 object-contain" />
              </div>
              <p className="text-xs sm:text-sm text-[#595248] font-normal leading-relaxed mb-6">
                The classically crafted workspace engineered for elite engineering teams who refuse to compromise on clarity.
              </p>
           </div>
           
           <div>
              <h4 className="font-bold text-[#171513] mb-4 text-xs font-mono tracking-wider uppercase">Product</h4>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#595248]">
                 <li><a href="#kanban-preview" className="hover:text-[#171513] transition-colors">Real-Time Kanban</a></li>
                 <li><a href="#telemetry-preview" className="hover:text-[#171513] transition-colors">Sprint Telemetry</a></li>
                 <li><a href="#chat-preview" className="hover:text-[#171513] transition-colors">Contextual Chat</a></li>
                 <li><a href="#security-preview" className="hover:text-[#171513] transition-colors">Security & Audit</a></li>
              </ul>
           </div>

           <div>
              <h4 className="font-bold text-[#171513] mb-4 text-xs font-mono tracking-wider uppercase">Resources</h4>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#595248]">
                 <li><Link to="/login" className="hover:text-[#171513] transition-colors">Documentation</Link></li>
                 <li><Link to="/login" className="hover:text-[#171513] transition-colors">API Architecture</Link></li>
                 <li><Link to="/login" className="hover:text-[#171513] transition-colors">MongoDB Text Indexing</Link></li>
                 <li><Link to="/login" className="hover:text-[#171513] transition-colors">Release Notes</Link></li>
              </ul>
           </div>

           <div>
              <h4 className="font-bold text-[#171513] mb-4 text-xs font-mono tracking-wider uppercase">Organization</h4>
              <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-[#595248]">
                 <li><Link to="/login" className="hover:text-[#171513] transition-colors">About Us</Link></li>
                 <li><Link to="/login" className="hover:text-[#171513] transition-colors">Security Architecture</Link></li>
                 <li><Link to="/login" className="hover:text-[#171513] transition-colors">Privacy Policy</Link></li>
                 <li><Link to="/login" className="hover:text-[#171513] transition-colors">Terms of Service</Link></li>
              </ul>
           </div>
        </div>

        <div className="mx-auto max-w-7xl border-t border-[#E8E1D5] pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
           <p className="text-[#6B6254] text-xs sm:text-sm font-normal">© 2026 NEXUS Inc. All rights reserved.</p>
           <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2D6A42] font-semibold bg-[#F0F7F2] px-3 py-1 rounded-full border border-[#CDE5D4]">
              <span className="w-2 h-2 rounded-full bg-[#2D6A42] animate-pulse"></span>
              <span>All Workspace & Socket Telemetry Operational</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;