import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, Hexagon, Search, Shield, Zap, CheckCircle2, Clock, MessageSquare, AlignLeft, Users, History } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-blue-900 selection:text-white overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-slate-200">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <Hexagon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-900" strokeWidth={2.5} />
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-blue-900">NEXUS</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/login" className="text-xs sm:text-sm font-medium text-slate-500 hover:text-blue-900 transition-colors">
              Sign in
            </Link>
            <Link
              to="/signup"
              className="bg-blue-900 px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-blue-800 transition-colors rounded-sm"
            >
              Start for free
            </Link>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <header className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="mx-auto max-w-5xl text-center relative z-10 flex flex-col items-center">
          
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter text-blue-900 leading-[1.1] sm:leading-[1.05] mb-6 sm:mb-8">
            The clarity your team <span className="font-serif italic text-amber-500 font-normal">requires.</span>
          </h1>
          
          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-slate-500 font-light leading-relaxed mb-8 sm:mb-10 px-4 sm:px-0">
            A classically crafted collaboration engine. Real-time Kanban, context-aware chat, isolated workspaces, and an omniscient search—without the clutter.
          </p>
          
          <div className="flex items-center justify-center mb-16 sm:mb-24">
             <Link
               to="/signup"
               className="group inline-flex items-center gap-3 sm:gap-4 bg-blue-900 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-900/10 hover:bg-blue-800 hover:-translate-y-1 transition-all duration-300 rounded-sm"
             >
               Enter the workspace
               <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </Link>
          </div>

          {/* Centered Kanban Mockup */}
          <div className="w-full max-w-6xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 rounded-xl overflow-hidden flex flex-col text-left">
             <div className="h-10 sm:h-12 border-b border-slate-100 bg-[#FAFAFA] flex items-center justify-between px-3 sm:px-4 shrink-0">
                <div className="flex gap-1.5 sm:gap-2">
                   <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-slate-300"></div>
                   <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-slate-300"></div>
                   <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-slate-300"></div>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-md w-48 sm:w-64 text-[10px] sm:text-xs text-slate-400 shadow-sm hidden md:flex">
                   <Search size={12} /> Search tickets...
                </div>
                <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[10px] font-bold text-blue-900">
                   AA
                </div>
             </div>
             
             {/* Scrollable Kanban Columns for Mobile */}
             <div className="flex-1 bg-slate-50/50 p-4 sm:p-6 md:p-8 flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* Column 1: TODO */}
                <div className="w-[85vw] sm:w-[300px] min-w-[260px] max-w-[300px] h-[400px] sm:h-auto flex flex-col gap-4 snap-center shrink-0">
                   <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-500 flex items-center gap-2"><Clock size={14}/> TODO</span>
                      <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-500 px-2 rounded-md">2</span>
                   </div>
                   
                   <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                         <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">HIGH</span>
                         <span className="text-[10px] text-slate-400">NEX-101</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-900">Finalize Database Schema</p>
                      <div className="flex items-center justify-between mt-2">
                         <div className="flex items-center gap-1 text-slate-400"><AlignLeft size={14}/></div>
                         <div className="h-6 w-6 rounded-full bg-blue-900 flex items-center justify-center text-[10px] font-bold text-white">JD</div>
                      </div>
                   </div>

                   <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                         <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">LOW</span>
                         <span className="text-[10px] text-slate-400">NEX-102</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-900">Update Typography Weights</p>
                      <div className="flex items-center justify-between mt-2">
                         <div className="flex items-center gap-1 text-slate-400"><MessageSquare size={14}/> <span className="text-xs">3</span></div>
                         <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-700">SA</div>
                      </div>
                   </div>
                </div>

                {/* Column 2: IN PROGRESS */}
                <div className="w-[85vw] sm:w-[300px] min-w-[260px] max-w-[300px] h-[400px] sm:h-auto flex flex-col gap-4 snap-center shrink-0">
                   <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-2"><Zap size={14}/> IN PROGRESS</span>
                      <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-500 px-2 rounded-md">1</span>
                   </div>
                   
                   <div className="bg-white border border-blue-900 rounded-lg p-4 shadow-lg shadow-blue-900/5 flex flex-col gap-3 transform -rotate-1 cursor-grab relative">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-amber-50 rounded-bl-full"></div>
                      <div className="flex justify-between items-start relative z-10">
                         <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">MEDIUM</span>
                         <span className="text-[10px] text-slate-400">NEX-103</span>
                      </div>
                      <p className="text-sm font-semibold text-blue-900 relative z-10">Design System Finalization</p>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed relative z-10">Ensure typography and spacing perfectly align with the premium guidelines.</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 relative z-10">
                         <div className="flex items-center gap-3 text-slate-400">
                            <div className="flex items-center gap-1 text-blue-600"><CheckCircle2 size={14}/> <span className="text-xs">2/2</span></div>
                         </div>
                         <div className="h-6 w-6 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-amber-500/30">AA</div>
                      </div>
                   </div>
                </div>

                {/* Column 3: DONE */}
                <div className="w-[85vw] sm:w-[300px] min-w-[260px] max-w-[300px] h-[400px] sm:h-auto flex flex-col gap-4 opacity-50 snap-center shrink-0">
                   <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-2"><CheckCircle2 size={14}/> DONE</span>
                      <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-400 px-2 rounded-md">12</span>
                   </div>
                   <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-3">
                      <p className="text-sm font-semibold text-slate-400 line-through">Setup User Authentication</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* 2. Logos */}
      <section className="border-y border-slate-200 bg-white py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <p className="text-[10px] sm:text-xs font-bold tracking-widest text-slate-400 uppercase mb-6 sm:mb-8">Trusted by elite engineering teams</p>
          <div className="flex flex-wrap justify-center gap-8 sm:gap-12 opacity-40 grayscale items-center text-blue-900">
            <span className="text-lg sm:text-xl font-bold tracking-tighter">VERTEX</span>
            <span className="text-lg sm:text-xl font-serif italic">Lumina</span>
            <span className="text-lg sm:text-xl font-bold tracking-widest">QUANTUM</span>
            <span className="text-lg sm:text-xl font-bold tracking-tight">O B S I D I A N</span>
          </div>
        </div>
      </section>

      {/* Sections 3-7: Features */}
      <section className="py-16 sm:py-24 lg:py-40 bg-[#FAFAFA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12 flex flex-col gap-20 sm:gap-32">
          
          {/* Section 3: Contextual Chat */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <span className="font-serif text-4xl sm:text-5xl text-blue-900/40 italic block mb-2 sm:mb-4">01</span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 mb-4">Contextual Dialogue</h3>
              <p className="text-slate-500 font-light leading-relaxed text-base sm:text-lg">
                Conversations where they belong. Stop switching tabs to clarify a requirement. Real-time team messaging is built directly into the fabric of your workspace.
              </p>
            </div>
            <div className="order-1 lg:order-2">
               <div className="w-full aspect-[4/5] sm:aspect-[4/3] bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 flex overflow-hidden">
                 {/* Sidebar hidden on mobile to prevent squishing */}
                 <div className="hidden sm:flex w-1/3 border-r border-slate-100 bg-slate-50/50 p-4 flex-col">
                   <div className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-4">Channels</div>
                   <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm mb-2 cursor-pointer">
                      <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold shrink-0">JD</div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-blue-900 truncate">John Doe</div>
                        <div className="text-[10px] text-slate-500 truncate">Sent an attachment</div>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100/50 cursor-pointer">
                      <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0">SA</div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-blue-900 truncate">Sarah Ali</div>
                        <div className="text-[10px] text-slate-500 truncate">LGTM! Let's deploy.</div>
                      </div>
                   </div>
                 </div>
                 {/* Chat area takes full width on mobile */}
                 <div className="w-full sm:w-2/3 p-4 sm:p-6 flex flex-col justify-end bg-white">
                    <div className="flex items-start gap-2 sm:gap-3 mb-4">
                       <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">SA</div>
                       <div className="bg-slate-100 p-2.5 sm:p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl text-[11px] sm:text-xs text-slate-700 max-w-[90%] sm:max-w-[85%] leading-relaxed">
                         Did anyone check the new auth flow on staging?
                       </div>
                    </div>
                    <div className="flex items-start gap-2 sm:gap-3 mb-4 sm:mb-6 flex-row-reverse">
                       <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0">AA</div>
                       <div className="bg-blue-900 text-white p-2.5 sm:p-3 rounded-tl-xl rounded-bl-xl rounded-br-xl text-[11px] sm:text-xs max-w-[90%] sm:max-w-[85%] leading-relaxed shadow-sm">
                         Checking now. The JWT secret wasn't passed into the environment variables. Fixed it.
                       </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>

          {/* Section 4: Omniscient Search */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="order-1">
               <div className="w-full aspect-[4/5] sm:aspect-[4/3] bg-blue-900 rounded-xl shadow-2xl p-4 sm:p-6 lg:p-10 flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)]" style={{ backgroundSize: '20px 20px' }}></div>
                  <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden relative z-10 flex flex-col border border-slate-200">
                     <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-slate-100 bg-slate-50">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />
                        <span className="text-xs sm:text-sm font-medium text-slate-800">"JWT secret"</span>
                     </div>
                     <div className="p-2 flex flex-col bg-white">
                        <div className="p-2 sm:p-3 hover:bg-slate-50 rounded-lg flex gap-2 sm:gap-3 cursor-pointer">
                           <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-slate-400 mt-0.5 shrink-0" />
                           <div>
                              <div className="text-[11px] sm:text-xs font-bold text-blue-900">Team Chat <span className="text-slate-400 font-normal ml-1 sm:ml-2">2 mins ago</span></div>
                              <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">Checking now. The <span className="bg-amber-100 text-amber-800 font-bold px-1 rounded mx-0.5">JWT secret</span> wasn't passed...</div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="order-2 text-center lg:text-left">
              <span className="font-serif text-4xl sm:text-5xl text-blue-900/40 italic block mb-2 sm:mb-4">02</span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 mb-4">Omniscient Search Engine</h3>
              <p className="text-slate-500 font-light leading-relaxed text-base sm:text-lg">
                Never lose a thought. We engineered custom MongoDB inverted text indexes to allow you to instantly query through millions of tickets, descriptions, and comments with zero lag.
              </p>
            </div>
          </div>

          {/* Section 5: Isolated Workspaces */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <span className="font-serif text-4xl sm:text-5xl text-blue-900/40 italic block mb-2 sm:mb-4">03</span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 mb-4">Isolated Workspaces</h3>
              <p className="text-slate-500 font-light leading-relaxed text-base sm:text-lg">
                Create dedicated environments for different departments. Marketing, Engineering, and Design can all operate in their own silos without overwhelming each other, yet still remain under one unified organization.
              </p>
            </div>
            <div className="order-1 lg:order-2">
               <div className="w-full aspect-[4/5] sm:aspect-[4/3] bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 p-4 sm:p-6 flex flex-col justify-center gap-3 sm:gap-4">
                  <div className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Teams</div>
                  <div className="bg-white border-2 border-blue-900 rounded-lg p-3 sm:p-4 shadow-sm flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-900 text-white rounded-md flex items-center justify-center text-xs sm:text-base font-bold shrink-0">EN</div>
                        <div>
                           <div className="text-xs sm:text-sm font-bold text-blue-900">Engineering</div>
                           <div className="text-[10px] sm:text-xs text-slate-500">12 Members</div>
                        </div>
                     </div>
                     <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">ACTIVE</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-sm flex items-center justify-between opacity-60">
                     <div className="flex items-center gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-slate-100 text-slate-600 rounded-md flex items-center justify-center text-xs sm:text-base font-bold shrink-0">MK</div>
                        <div>
                           <div className="text-xs sm:text-sm font-bold text-slate-900">Marketing</div>
                           <div className="text-[10px] sm:text-xs text-slate-500">5 Members</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Section 6: Security */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="order-1">
               <div className="w-full min-h-[300px] sm:aspect-[4/3] bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 flex flex-col justify-center items-center relative overflow-hidden py-8 sm:py-0">
                  <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle_at_center,_black_1px,_transparent_1px)]" style={{ backgroundSize: '16px 16px' }}></div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 relative z-10 w-full px-8">
                     <div className="bg-white w-full sm:w-auto p-3 sm:p-4 rounded-xl shadow-sm border border-slate-200 flex flex-row sm:flex-col items-center justify-center sm:gap-2">
                        <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mr-3 sm:mr-0 shrink-0"><Users size={16} className="sm:w-5 sm:h-5"/></div>
                        <div className="text-[11px] sm:text-xs font-bold text-slate-800">Invite Sent</div>
                     </div>
                     <div className="flex flex-col items-center gap-1 sm:gap-2">
                        <ArrowRight className="text-amber-500 hidden sm:block" size={24} />
                        <ArrowDown className="text-amber-500 sm:hidden" size={20} />
                        <div className="text-[8px] sm:text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-amber-100">JWT Verified</div>
                     </div>
                     <div className="bg-white w-full sm:w-auto p-3 sm:p-4 rounded-xl shadow-lg shadow-blue-900/10 border-2 border-blue-900 flex flex-row sm:flex-col items-center justify-center sm:gap-2">
                        <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center mr-3 sm:mr-0 shrink-0"><Shield size={16} className="sm:w-5 sm:h-5"/></div>
                        <div className="text-[11px] sm:text-xs font-bold text-blue-900">Access Granted</div>
                     </div>
                  </div>
               </div>
            </div>
            <div className="order-2 text-center lg:text-left">
              <span className="font-serif text-4xl sm:text-5xl text-blue-900/40 italic block mb-2 sm:mb-4">04</span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 mb-4">Enterprise-grade Security</h3>
              <p className="text-slate-500 font-light leading-relaxed text-base sm:text-lg">
                Your workspace is a sanctuary. Stateful invitation lifecycles, encrypted JWT authentication, and strict IDOR middleware keep your team's data completely isolated and locked down.
              </p>
            </div>
          </div>

          {/* Section 7: Audit Trails */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <span className="font-serif text-4xl sm:text-5xl text-blue-900/40 italic block mb-2 sm:mb-4">05</span>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-900 mb-4">Silent Audit Trails</h3>
              <p className="text-slate-500 font-light leading-relaxed text-base sm:text-lg">
                Complete peace of mind. Our Activity engine tracks every ticket movement, comment, and team invitation. You never have to wonder who changed what, or when it happened.
              </p>
            </div>
            <div className="order-1 lg:order-2">
               <div className="w-full aspect-[4/5] sm:aspect-[4/3] bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-200/50 p-4 sm:p-6 flex flex-col justify-center gap-4 sm:gap-6">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 sm:pb-4">
                     <History className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                     <span className="font-bold text-xs sm:text-sm text-slate-800">Activity Log</span>
                  </div>
                  <div className="flex flex-col gap-4 relative ml-2 sm:ml-0">
                     <div className="absolute left-3 sm:left-4 top-2 bottom-2 w-px bg-slate-100"></div>
                     <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 shadow-sm border-2 border-white">AA</div>
                        <div className="pt-0.5 sm:pt-1">
                           <div className="text-xs sm:text-sm text-slate-800 leading-relaxed"><span className="font-bold">Ahmad Aamir</span> moved <span className="font-semibold text-blue-900">NEX-103</span> to <span className="font-bold text-amber-500 whitespace-nowrap">IN PROGRESS</span></div>
                           <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">2 minutes ago</div>
                        </div>
                     </div>
                     <div className="flex items-start gap-3 sm:gap-4 relative z-10">
                        <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 shadow-sm border-2 border-white">SA</div>
                        <div className="pt-0.5 sm:pt-1">
                           <div className="text-xs sm:text-sm text-slate-800 leading-relaxed"><span className="font-bold">Sarah Ali</span> commented on <span className="font-semibold text-slate-600">NEX-102</span></div>
                           <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">1 hour ago</div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* 8. Final CTA */}
      <section className="bg-blue-900 py-24 sm:py-32 px-4 sm:px-6 text-center text-white relative overflow-hidden">
         <div className="mx-auto max-w-3xl relative z-10">
            <Hexagon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-amber-500 mb-6 sm:mb-8" strokeWidth={2} />
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-8 sm:mb-10 px-2">
               Ready to reclaim your focus?
            </h2>
            <Link
                to="/signup"
                className="inline-flex items-center gap-3 sm:gap-4 bg-amber-500 px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-base font-bold text-blue-900 rounded-sm shadow-xl shadow-amber-500/20 hover:bg-amber-400 hover:-translate-y-1 transition-all"
              >
                Start building today
            </Link>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 sm:pt-20 pb-8 sm:pb-10 px-6 lg:px-12">
        <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
           <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Hexagon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-900" strokeWidth={2.5} />
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-blue-900">NEXUS</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-light leading-relaxed mb-6">
                The classically crafted workspace engineered for elite teams who refuse to compromise.
              </p>
           </div>
           
           <div>
              <h4 className="font-bold text-blue-900 mb-4 sm:mb-6 text-sm sm:text-base">Product</h4>
              <ul className="flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                 <li><a href="#" className="hover:text-blue-900 transition-colors">Real-time Kanban</a></li>
                 <li><a href="#" className="hover:text-blue-900 transition-colors">Contextual Chat</a></li>
                 <li><a href="#" className="hover:text-blue-900 transition-colors">Global Search</a></li>
                 <li><a href="#" className="hover:text-blue-900 transition-colors">Audit Trails</a></li>
              </ul>
           </div>

           <div>
              <h4 className="font-bold text-blue-900 mb-4 sm:mb-6 text-sm sm:text-base">Resources</h4>
              <ul className="flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                 <li><a href="#" className="hover:text-blue-900 transition-colors">Documentation</a></li>
                 <li><a href="#" className="hover:text-blue-900 transition-colors">API Reference</a></li>
                 <li><a href="#" className="hover:text-blue-900 transition-colors">Community</a></li>
                 <li><a href="#" className="hover:text-blue-900 transition-colors">Blog</a></li>
              </ul>
           </div>

           <div>
              <h4 className="font-bold text-blue-900 mb-4 sm:mb-6 text-sm sm:text-base">Company</h4>
              <ul className="flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm text-slate-500">
                 <li><a href="#" className="hover:text-blue-900 transition-colors">About Us</a></li>
                 <li><a href="#" className="hover:text-blue-900 transition-colors">Careers</a></li>
                 <li><a href="#" className="hover:text-blue-900 transition-colors">Privacy Policy</a></li>
                 <li><a href="#" className="hover:text-blue-900 transition-colors">Terms of Service</a></li>
              </ul>
           </div>
        </div>

        <div className="mx-auto max-w-7xl border-t border-slate-200 pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
           <p className="text-slate-400 text-xs sm:text-sm">© 2026 NEXUS Inc. All rights reserved.</p>
           <div className="flex gap-6 text-xs sm:text-sm text-slate-400">
              <span>Status: All systems operational</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
