import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
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
  Command,
  Check,
  ChevronRight,
  Kanban,
  TrendingUp,
  Cpu,
  Lock,
  Compass,
  FileCode2,
  Plus
} from 'lucide-react';
import nexusLogo from '../assets/nexus_logo.png';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Landing = () => {
  useDocumentTitle('Project Workspace & Engineering Workflow | NEXUS');
  const [activeWorkbenchTab, setActiveWorkbenchTab] = useState('kanban'); // 'kanban' | 'telemetry'

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#141311] font-sans selection:bg-[#E8DFD1] selection:text-[#141311] antialiased">
      
      {/* 1. Architectural Header Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E7E0D3]">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-8 lg:px-12">
          
          {/* Brand Mark */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={nexusLogo} alt="Nexus" className="h-6 sm:h-7 object-contain" />
          </Link>

          {/* Monospace Architecture Index */}
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-mono tracking-widest uppercase text-[#6B6355]">
            <a href="#workbench" className="hover:text-[#141311] transition-colors">01 // Workbench</a>
            <a href="#telemetry" className="hover:text-[#141311] transition-colors">02 // Telemetry</a>
            <a href="#dialogue" className="hover:text-[#141311] transition-colors">03 // Dialogue</a>
            <a href="#architecture" className="hover:text-[#141311] transition-colors">04 // Isolation</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link 
              to="/login" 
              className="text-xs sm:text-sm font-medium text-[#544D42] hover:text-[#141311] transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 bg-[#141311] hover:bg-[#26231F] text-[#FAF7F2] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg border border-[#302B24] transition-all shadow-xs"
            >
              <span>Enter Workspace</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform text-[#C7B596]" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section: Editorial Typography & Spatial Workbench */}
      <header className="relative pt-32 sm:pt-40 lg:pt-48 pb-16 sm:pb-24 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        {/* Editorial Eyebrow */}
        <div className="flex items-center gap-3 mb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#857B6C] font-semibold">
            SYSTEM SPECIFICATION // NEXUS WORKSPACE
          </span>
          <div className="h-px flex-1 max-w-[120px] bg-[#DDD4C4]"></div>
        </div>

        {/* Master Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[88px] font-medium tracking-tight text-[#141311] leading-[1.03] mb-8 max-w-5xl">
          The clarity your team <br className="hidden sm:inline" />
          <span className="font-serif italic font-normal text-[#966F2D] tracking-normal">
            requires.
          </span>
        </h1>

        {/* Lead Narrative & Direct Action Strip */}
        <div className="grid md:grid-cols-12 gap-8 items-end mb-16 sm:mb-20">
          <p className="md:col-span-7 text-base sm:text-lg md:text-xl text-[#4A4338] font-normal leading-relaxed">
            A single workspace engineered for disciplined software teams. Real-time spatial Kanban, continuous pipeline telemetry, in-fabric dialogue, and an omniscient search engine—without the friction.
          </p>
          <div className="md:col-span-5 flex flex-wrap items-center md:justify-end gap-3 sm:gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2.5 bg-[#141311] hover:bg-[#26231F] text-[#FAF7F2] px-6 sm:px-7 py-3 sm:py-3.5 text-sm font-medium rounded-lg border border-[#332D25] shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <span>Start building with Nexus</span>
              <ArrowRight size={16} className="text-[#C7B596]" />
            </Link>
            <a
              href="#workbench"
              className="inline-flex items-center gap-2 bg-white hover:bg-[#F2ECE1] text-[#3D372D] px-5 sm:px-6 py-3 sm:py-3.5 text-sm font-medium rounded-lg border border-[#D8CEBE] shadow-2xs hover:-translate-y-0.5 transition-all"
            >
              <span>Explore Interactive Views</span>
            </a>
          </div>
        </div>

        {/* 3. The Interactive Studio Workbench (Authentic Post-Login Visual) */}
        <div 
          id="workbench"
          className="w-full bg-[#FCFBF8] border border-[#E3DACB] rounded-xl sm:rounded-2xl shadow-[0_12px_45px_-10px_rgba(25,20,15,0.06)] overflow-hidden"
        >
          {/* Workbench Application Header Bar */}
          <div className="h-12 sm:h-14 border-b border-[#E7DFD2] bg-[#F5EFE4] px-4 sm:px-6 flex items-center justify-between gap-4">
            
            {/* Left: Breadcrumbs & Real Socket Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#4D463C]">
                <span className="font-bold text-[#141311]">NEXUS</span>
                <span className="text-[#A39988]">/</span>
                <span className="hidden sm:inline">CORE ENGINEERING</span>
              </div>
              <div className="h-3 w-px bg-[#DDD3C2] hidden sm:block"></div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#2D6A42] bg-[#EAF5ED] px-2 py-0.5 rounded border border-[#CDE5D4]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A42]"></span>
                <span className="hidden sm:inline">WS 6.2ms</span>
                <span className="sm:hidden">LIVE</span>
              </div>
            </div>

            {/* Center: Interactive Mode Switcher */}
            <div className="flex items-center bg-[#E8E0D1] p-1 rounded-lg border border-[#D8CFBF] text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveWorkbenchTab('kanban')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  activeWorkbenchTab === 'kanban'
                    ? 'bg-white text-[#141311] font-semibold shadow-2xs'
                    : 'text-[#6B6253] hover:text-[#141311]'
                }`}
              >
                Kanban Flow
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkbenchTab('telemetry')}
                className={`px-3 py-1 rounded transition-all cursor-pointer ${
                  activeWorkbenchTab === 'telemetry'
                    ? 'bg-white text-[#141311] font-semibold shadow-2xs'
                    : 'text-[#6B6253] hover:text-[#141311]'
                }`}
              >
                Live Telemetry
              </button>
            </div>

            {/* Right: Search Bar & User Initials */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-white border border-[#DCD3C3] px-2.5 py-1 rounded text-xs text-[#706757] shadow-2xs font-mono">
                <Search size={12} className="text-[#966F2D]" />
                <span className="text-[11px]">⌘K search</span>
              </div>
              <div className="h-7 w-7 rounded bg-[#141311] text-[#FAF7F2] flex items-center justify-center text-xs font-mono font-bold shadow-2xs">
                AA
              </div>
            </div>
          </div>

          {/* Workbench Dynamic Workspace Area */}
          <div className="p-4 sm:p-6 lg:p-8 bg-[#FAF7F2]">
            <AnimatePresence mode="wait">
              {activeWorkbenchTab === 'kanban' ? (
                /* KANBAN BOARD VIEW */
                <motion.div
                  key="kanban-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-5"
                >
                  {/* Column 1: TODO */}
                  <div className="bg-[#F4EFE6] border border-[#E4DBD0] rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-1 border-b border-[#E8E1D5]">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#544D41]">
                        <Clock size={13} className="text-[#966F2D]" />
                        <span>Queued Backlog</span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#DDD3C2] text-[#4A4337]">
                        2
                      </span>
                    </div>

                    {/* Card 1 */}
                    <div className="bg-white border border-[#E3DACB] rounded-lg p-3.5 shadow-2xs flex flex-col gap-2.5 hover:border-[#CFBEA6] transition-all">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold text-[#8C6225] bg-[#FAF3E6] px-1.5 py-0.5 rounded border border-[#EADBBD]">
                          HIGH PRIORITY
                        </span>
                        <span className="text-[#857B6C]">NEX-101</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#141311] leading-snug">
                        Multi-tenant Database Partitioning
                      </h4>
                      <p className="text-xs text-[#5C5447] leading-relaxed">
                        Enforce strict MongoDB tenant boundaries and verify invitation tokens.
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-[11px] font-mono text-[#7A7161]">
                        <span>Subtasks: 4/5</span>
                        <span className="h-5 w-5 bg-[#EAE3D6] text-[#383228] font-bold rounded flex items-center justify-center text-[10px]">
                          JD
                        </span>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white border border-[#E3DACB] rounded-lg p-3.5 shadow-2xs flex flex-col gap-2.5 hover:border-[#CFBEA6] transition-all">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-medium text-[#4A4338] bg-[#F2EDE4] px-1.5 py-0.5 rounded border border-[#DDD5C7]">
                          NORMAL
                        </span>
                        <span className="text-[#857B6C]">NEX-102</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#141311] leading-snug">
                        Editorial Design System Tokens
                      </h4>
                      <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-[11px] font-mono text-[#7A7161]">
                        <span>3 discussions</span>
                        <span className="h-5 w-5 bg-[#EAE3D6] text-[#383228] font-bold rounded flex items-center justify-center text-[10px]">
                          SA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: IN PROGRESS */}
                  <div className="bg-[#F4EFE6] border-2 border-[#D6CBB9] rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-1 border-b border-[#E8E1D5]">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#141311]">
                        <Zap size={13} className="text-[#C28222]" />
                        <span>In Production</span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-[#FAF3E6] border border-[#EADBBD] text-[#8C6225] px-2 py-0.5 rounded">
                        1
                      </span>
                    </div>

                    {/* Card: Active */}
                    <div className="bg-white border-2 border-[#C9BBA5] rounded-lg p-4 shadow-sm flex flex-col gap-3 relative">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-bold text-[#8C6225] bg-[#FAF3E6] px-1.5 py-0.5 rounded border border-[#EADBBD]">
                          URGENT
                        </span>
                        <span className="text-[#857B6C]">NEX-103</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#141311] leading-snug">
                        Low-Latency WebSocket Broadcast Engine
                      </h4>
                      <p className="text-xs text-[#4D4537] leading-relaxed">
                        Broadcasting ticket movements and activity deltas across active tenant sockets in under 10ms.
                      </p>
                      
                      {/* Metric Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-mono text-[#665D4F]">
                          <span>Implementation</span>
                          <span className="font-bold text-[#8C6225]">75%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#F0EAE0] rounded-full overflow-hidden">
                          <div className="h-full bg-[#966F2D] rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#F2ECE1] text-[11px] font-mono">
                        <span className="text-[#2D6A42] font-semibold">3/4 tests passing</span>
                        <span className="h-5 w-5 bg-[#141311] text-[#FAF7F2] font-bold rounded flex items-center justify-center text-[10px]">
                          AA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: DONE */}
                  <div className="bg-[#F4EFE6] border border-[#E4DBD0] rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-1 border-b border-[#E8E1D5]">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#544D41]">
                        <CheckCircle2 size={13} className="text-[#2D6A42]" />
                        <span>Deployed</span>
                      </div>
                      <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-[#DDD3C2] text-[#4A4337]">
                        12
                      </span>
                    </div>

                    {/* Card 1 */}
                    <div className="bg-white/80 border border-[#E3DACB] rounded-lg p-3.5 shadow-2xs flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-semibold text-[#2D6A42] bg-[#EAF5ED] px-1.5 py-0.5 rounded border border-[#CDE5D4]">
                          RESOLVED
                        </span>
                        <span className="text-[#857B6C]">NEX-098</span>
                      </div>
                      <h4 className="text-sm font-medium text-[#665E50] line-through leading-snug">
                        Zero-Trust JWT Token Rotation
                      </h4>
                      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[#827867]">
                        <span>Verified Staging</span>
                        <span className="h-5 w-5 bg-[#EAE3D6] text-[#383228] font-bold rounded flex items-center justify-center text-[10px]">
                          AA
                        </span>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white/80 border border-[#E3DACB] rounded-lg p-3.5 shadow-2xs flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="font-semibold text-[#2D6A42] bg-[#EAF5ED] px-1.5 py-0.5 rounded border border-[#CDE5D4]">
                          RESOLVED
                        </span>
                        <span className="text-[#857B6C]">NEX-097</span>
                      </div>
                      <h4 className="text-sm font-medium text-[#665E50] line-through leading-snug">
                        MongoDB Compound Text Index
                      </h4>
                      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[#827867]">
                        <span>0.8ms Query P99</span>
                        <span className="h-5 w-5 bg-[#EAE3D6] text-[#383228] font-bold rounded flex items-center justify-center text-[10px]">
                          JD
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                /* LIVE TELEMETRY VIEW */
                <motion.div
                  key="telemetry-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#E3DACB] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#736B5E] font-bold">Total Scope</span>
                      <div className="my-2">
                        <span className="text-3xl font-extrabold text-[#141311] font-mono">128</span>
                        <span className="text-xs text-[#736B5E] ml-1.5 font-mono">units registered</span>
                      </div>
                      <div className="w-full h-1 bg-[#EAE2D5] rounded-full overflow-hidden">
                        <div className="h-full bg-[#966F2D]" style={{ width: '68%' }}></div>
                      </div>
                    </div>

                    <div className="bg-white border border-[#E3DACB] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#736B5E] font-bold">Active WIP</span>
                      <div className="my-2">
                        <span className="text-3xl font-extrabold text-[#141311] font-mono">14</span>
                        <span className="text-xs text-[#2D6A42] ml-1.5 font-mono font-semibold">in-flight</span>
                      </div>
                      <span className="text-[11px] text-[#5C5446] font-mono">Zero blocked pipelines</span>
                    </div>

                    <div className="bg-white border border-[#E3DACB] rounded-xl p-4 shadow-2xs flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-[#736B5E] font-bold block">Resolution Velocity</span>
                        <div className="text-3xl font-extrabold text-[#141311] font-mono my-1">92%</div>
                        <span className="text-[11px] text-[#2D6A42] font-mono font-semibold">+14% sprint trend</span>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-[#F0EAE0] border-t-[#966F2D] flex items-center justify-center">
                        <Zap size={14} className="text-[#966F2D]" />
                      </div>
                    </div>

                    <div className="bg-white border border-[#E3DACB] rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-[#736B5E] font-bold">P99 Cycle Latency</span>
                      <div className="my-2">
                        <span className="text-3xl font-extrabold text-[#141311] font-mono">6.4ms</span>
                        <span className="text-xs text-[#736B5E] ml-1.5 font-mono">broadcast</span>
                      </div>
                      <span className="text-[11px] text-[#2D6A42] font-mono font-semibold">99.99% availability</span>
                    </div>
                  </div>

                  {/* Throughput Graphic */}
                  <div className="bg-white border border-[#E3DACB] rounded-xl p-5 shadow-2xs">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-[#141311]">Deployment Throughput & Deliverable Cadence</h4>
                        <p className="text-xs text-[#6B6355]">Completed engineering units across active 24h work windows</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#8C6225] bg-[#FAF3E6] px-2.5 py-1 rounded border border-[#EADBBD]">
                        18 units / day avg
                      </span>
                    </div>

                    <div className="h-32 flex items-end gap-3 sm:gap-6 pt-4 border-b border-[#F0EAE0]">
                      {[
                        { day: 'MON', h: '55%', count: 12 },
                        { day: 'TUE', h: '80%', count: 20 },
                        { day: 'WED', h: '70%', count: 18 },
                        { day: 'THU', h: '95%', count: 25 },
                        { day: 'FRI', h: '88%', count: 22 },
                        { day: 'SAT', h: '40%', count: 8 },
                        { day: 'SUN', h: '30%', count: 5 },
                      ].map((bar, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <span className="text-[10px] font-mono text-[#8C6225] font-bold">{bar.count}</span>
                          <div 
                            className={`w-full rounded-t transition-all ${
                              i === 3 ? 'bg-[#966F2D]' : 'bg-[#DDD3C2] hover:bg-[#C7BAA5]'
                            }`}
                            style={{ height: bar.h }}
                          />
                          <span className="text-[10px] font-mono text-[#736B5E]">{bar.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* 4. Concrete Engineering Metrics Grid (Replacing fake logos) */}
      <section className="border-y border-[#E7E0D3] bg-[#F5EFE5] py-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-[#857B6C] font-semibold">01 // LATENCY</span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#141311]">&lt; 10ms</span>
            <p className="text-xs text-[#524B40] leading-relaxed">
              Sub-10ms state propagation across concurrent team sockets.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-[#857B6C] font-semibold">02 // SEARCH</span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#141311]">100k+</span>
            <p className="text-xs text-[#524B40] leading-relaxed">
              Inverted compound MongoDB text index across tickets and comments.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-[#857B6C] font-semibold">03 // PRIVACY</span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#141311]">100%</span>
            <p className="text-xs text-[#524B40] leading-relaxed">
              Zero third-party trackers, zero advertising pixels, strict data ownership.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-[#857B6C] font-semibold">04 // ISOLATION</span>
            <span className="text-3xl sm:text-4xl font-extrabold font-mono text-[#141311]">Strict</span>
            <p className="text-xs text-[#524B40] leading-relaxed">
              Stateful token rotation & cryptographic IDOR query protection.
            </p>
          </div>

        </div>
      </section>

      {/* 5. Architectural Bento Grid: 4 Core Capabilities */}
      <section className="py-20 sm:py-28 lg:py-36 px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        
        <div className="mb-14">
          <span className="font-mono text-xs uppercase tracking-widest text-[#857B6C] font-semibold block mb-3">
            CAPABILITY ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#141311] max-w-2xl leading-tight">
            Designed for flow. <br />
            <span className="font-serif italic font-normal text-[#966F2D]">Built for rigor.</span>
          </h2>
        </div>

        {/* The Bento Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Bento Cell 1: Spatial Kanban Flow (Span 7) */}
          <div className="lg:col-span-7 bg-[#FCFBF8] border border-[#E3DACB] rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="mb-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#8C6225]">
                01 // ORCHESTRATION
              </span>
              <h3 className="text-2xl font-bold text-[#141311] mt-1 mb-2">
                Spatial Kanban with Fluid State
              </h3>
              <p className="text-sm text-[#4D4537] leading-relaxed max-w-lg">
                Organize deliverables with tactile drag mechanics, explicit WIP limits, and instant socket syncing. Everyone sees identical task status the millisecond changes occur.
              </p>
            </div>

            {/* Visual Micro-Preview */}
            <div className="bg-[#FAF7F2] border border-[#E5DFD2] rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-mono text-[#665E4E]">
                <span>COLUMN: IN PRODUCTION (WIP LIMIT: 3)</span>
                <span className="text-[#2D6A42] font-bold">HEALTHY</span>
              </div>
              <div className="bg-white border border-[#E3DACB] p-3 rounded shadow-2xs flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#8C6225] bg-[#FAF3E6] px-1.5 py-0.5 rounded">HIGH</span>
                    <span className="text-xs font-mono text-[#7D7464]">NEX-104</span>
                  </div>
                  <div className="text-sm font-semibold text-[#141311] mt-1">Multi-AZ Database Replication Failover</div>
                </div>
                <div className="h-6 w-6 rounded bg-[#141311] text-[#FAF7F2] font-mono text-[10px] font-bold flex items-center justify-center">
                  AA
                </div>
              </div>
            </div>
          </div>

          {/* Bento Cell 2: Live Velocity Telemetry (Span 5) */}
          <div id="telemetry" className="lg:col-span-5 bg-[#FCFBF8] border border-[#E3DACB] rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="mb-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#8C6225]">
                02 // OBSERVABILITY
              </span>
              <h3 className="text-2xl font-bold text-[#141311] mt-1 mb-2">
                Continuous Telemetry
              </h3>
              <p className="text-sm text-[#4D4537] leading-relaxed">
                No status meetings required. High-resolution telemetry cards measure deliverable velocity, backlog saturation, and cycle times automatically.
              </p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E5DFD2] rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-[#665E4E]">RESOLUTION EFFICIENCY</span>
                <span className="text-xs font-mono font-bold text-[#966F2D]">92%</span>
              </div>
              <div className="w-full h-2 bg-[#EAE2D5] rounded-full overflow-hidden">
                <div className="h-full bg-[#966F2D]" style={{ width: '92%' }}></div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-center font-mono">
                <div className="bg-white p-2 rounded border border-[#E3DACB]">
                  <div className="text-[10px] text-[#786F5F]">WIP QUEUE</div>
                  <div className="text-base font-bold text-[#141311]">14 units</div>
                </div>
                <div className="bg-white p-2 rounded border border-[#E3DACB]">
                  <div className="text-[10px] text-[#786F5F]">CYCLE TIME</div>
                  <div className="text-base font-bold text-[#2D6A42]">1.4 days</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Cell 3: Contextual Dialogue (Span 6) */}
          <div id="dialogue" className="lg:col-span-6 bg-[#FCFBF8] border border-[#E3DACB] rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="mb-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#8C6225]">
                03 // CONVERSATION
              </span>
              <h3 className="text-2xl font-bold text-[#141311] mt-1 mb-2">
                In-Fabric Contextual Dialogue
              </h3>
              <p className="text-sm text-[#4D4537] leading-relaxed">
                Direct messaging and team channels are woven directly into tickets. No separate chat windows, no fragmented thread context.
              </p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E5DFD2] rounded-lg p-4 space-y-3 font-mono text-xs">
              <div className="flex items-start gap-2.5">
                <span className="h-6 w-6 rounded bg-[#E8E1D3] text-[#3D372B] font-bold flex items-center justify-center text-[10px] shrink-0">
                  SA
                </span>
                <div className="bg-white border border-[#E3DACB] p-2.5 rounded text-[#2E281F] flex-1 leading-relaxed">
                  Has staging passed the new auth IDOR tests?
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="h-6 w-6 rounded bg-[#141311] text-[#FAF7F2] font-bold flex items-center justify-center text-[10px] shrink-0">
                  AA
                </span>
                <div className="bg-[#141311] text-[#FAF7F2] p-2.5 rounded flex-1 leading-relaxed">
                  All 18 regression suites passed. Merging PR #204 now.
                </div>
              </div>
            </div>
          </div>

          {/* Bento Cell 4: Omniscient Search (Span 6) */}
          <div className="lg:col-span-6 bg-[#FCFBF8] border border-[#E3DACB] rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="mb-6">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#8C6225]">
                04 // RETRIEVAL
              </span>
              <h3 className="text-2xl font-bold text-[#141311] mt-1 mb-2">
                Omniscient Text Index
              </h3>
              <p className="text-sm text-[#4D4537] leading-relaxed">
                Query through hundreds of thousands of tickets, markdown narratives, and code references instantly with custom MongoDB inverted indexes.
              </p>
            </div>

            <div className="bg-[#FAF7F2] border border-[#E5DFD2] rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 bg-white border border-[#DDD3C2] p-2.5 rounded text-xs font-mono">
                <Search size={14} className="text-[#966F2D]" />
                <span className="text-[#141311] font-semibold">"database failover"</span>
                <span className="ml-auto text-[10px] text-[#7A7161]">3 results in 0.8ms</span>
              </div>
              <div className="bg-white/70 border border-[#E3DACB] p-2.5 rounded text-xs">
                <span className="font-mono text-[#8C6225] font-semibold">NEX-104</span>
                <p className="text-[#4D4537] text-[11px] mt-0.5">Automated Multi-AZ failover testing for replica set primary nodes.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Multi-Tenant Cryptographic Sanctuary */}
      <section id="architecture" className="border-t border-[#E7E0D3] bg-[#F5EFE5] py-20 sm:py-28 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6">
            <span className="font-mono text-xs uppercase tracking-widest text-[#857B6C] font-semibold block mb-3">
              CRYPTOGRAPHIC ISOLATION
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#141311] leading-tight mb-4">
              Your organization's code and discussions remain an isolated sanctuary.
            </h2>
            <p className="text-[#4D4537] text-base leading-relaxed mb-6">
              NEXUS enforces strict tenant boundaries at the database layer. Every websocket channel, invitation link, and query filter validates cryptographic tenant ownership before emitting a single byte.
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="border border-[#D8CFBF] bg-white p-3 rounded">
                <span className="font-bold text-[#141311] block mb-1">Stateful Token Lifecycle</span>
                <span className="text-[#6B6253]">Automatic revocation upon member role modification.</span>
              </div>
              <div className="border border-[#D8CFBF] bg-white p-3 rounded">
                <span className="font-bold text-[#141311] block mb-1">Immutable Activity Trail</span>
                <span className="text-[#6B6253]">Audit logs recorded per tenant with sub-second accuracy.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white border border-[#E3DACB] rounded-xl p-6 shadow-xs font-mono text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#F0EAE0] text-[#736B5E]">
              <span>TENANT REPLICATION LOG // LIVE</span>
              <span className="text-[#2D6A42] font-bold">MONITORED</span>
            </div>
            <div className="space-y-3 py-3">
              <div className="flex items-center justify-between text-[#4D4537]">
                <span>[12:34:02] Token Verified: org_tenant_core_prod</span>
                <span className="text-[#2D6A42] font-semibold">200 OK</span>
              </div>
              <div className="flex items-center justify-between text-[#4D4537]">
                <span>[12:34:08] Activity Broadcast: NEX-103 moved to IN PROGRESS</span>
                <span className="text-[#8C6225] font-semibold">SOCKET.EMIT</span>
              </div>
              <div className="flex items-center justify-between text-[#4D4537]">
                <span>[12:34:15] IDOR Boundary Check: workspace_id matches payload</span>
                <span className="text-[#2D6A42] font-semibold">SECURE</span>
              </div>
            </div>
            <div className="pt-3 border-t border-[#F0EAE0] text-[11px] text-[#736B5E] flex justify-between">
              <span>ACTIVE KEY: ECDSA SHA-256</span>
              <span>ZERO INTRUSIONS</span>
            </div>
          </div>

        </div>
      </section>

      {/* 7. Architectural Closing Statement (Clean Obsidian Monolith, No neon blobs) */}
      <section className="bg-[#141311] text-[#FAF7F2] py-24 sm:py-32 px-4 sm:px-8 lg:px-12 border-t border-[#29241E]">
        <div className="max-w-4xl mx-auto text-center">
          
          <span className="font-mono text-xs uppercase tracking-widest text-[#A89880] font-semibold block mb-4">
            RECLAIM YOUR MOMENTUM
          </span>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight leading-tight mb-6">
            Stop wrestling your tools. <br />
            <span className="font-serif italic font-normal text-[#C7A35F]">
              Build with conviction.
            </span>
          </h2>

          <p className="text-[#A39988] text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-normal">
            Eliminate context fragmentation. Equip your engineering team with the clarity and speed they need to deliver.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2.5 bg-[#FAF7F2] hover:bg-white text-[#141311] px-8 py-3.5 text-sm font-semibold rounded-lg shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <span>Initialize Workspace</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#211E1A] hover:bg-[#2E2A24] text-[#FAF7F2] px-6 py-3.5 text-sm font-medium rounded-lg border border-[#383228] transition-all"
            >
              <span>Sign in to Existing Workspace</span>
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-[#26221C] text-xs font-mono text-[#786E5E] flex flex-wrap items-center justify-center gap-6">
            <span>● 14-DAY RISK-FREE TRIAL</span>
            <span>● ZERO SEAT MINIMUMS</span>
            <span>● FULL API EXPORT ACCESS</span>
          </div>

        </div>
      </section>

      {/* 8. Architectural Minimalist Footer */}
      <footer className="bg-[#FAF7F2] border-t border-[#E7E0D3] py-14 px-4 sm:px-8 lg:px-12 text-xs font-mono text-[#665E50]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <img src={nexusLogo} alt="Nexus" className="h-5 object-contain" />
            <span className="text-[#998F80]">/</span>
            <span>ENGINEERED FOR TEAMS THAT SHIP</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[#544D41]">
            <Link to="/login" className="hover:text-[#141311] transition-colors">Documentation</Link>
            <Link to="/login" className="hover:text-[#141311] transition-colors">Architecture</Link>
            <Link to="/login" className="hover:text-[#141311] transition-colors">Security</Link>
            <Link to="/login" className="hover:text-[#141311] transition-colors">Terms</Link>
            <Link to="/login" className="hover:text-[#141311] transition-colors">Privacy</Link>
          </div>

          <div className="text-[#8C8373]">
            © 2026 NEXUS ARCHITECTURE INC.
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;