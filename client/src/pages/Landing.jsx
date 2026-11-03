import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  MessageSquare,
  Users,
  History,
  Kanban,
  BarChart3,
  AlignLeft,
  ChevronDown,
  Lock,
  Plus
} from 'lucide-react';
import nexusLogo from '../assets/nexus_logo.png';
import useDocumentTitle from '../hooks/useDocumentTitle';

const Landing = () => {
  useDocumentTitle('Nexus | Simple Project Workspace for Teams');

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#141311] font-sans selection:bg-[#E8DFD1] selection:text-[#141311] antialiased">
      
      {/* 1. Header Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E1D5]">
        <div className="mx-auto flex h-16 sm:h-20 max-w-6xl items-center justify-between px-4 sm:px-8">
          
          <Link to="/" className="flex items-center gap-2.5">
            <img src={nexusLogo} alt="Nexus" className="h-6 sm:h-7 object-contain" />
          </Link>

          {/* Clean, Human Section Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-medium text-[#5C5446]">
            <a href="#boards" className="hover:text-[#141311] transition-colors">Task Boards</a>
            <a href="#chat" className="hover:text-[#141311] transition-colors">Team Chat</a>
            <a href="#search" className="hover:text-[#141311] transition-colors">Search</a>
            <a href="#workspaces" className="hover:text-[#141311] transition-colors">Workspaces</a>
          </div>

          {/* Simple Authentication Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link 
              to="/login" 
              className="text-xs sm:text-sm font-medium text-[#5C5446] hover:text-[#141311] transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1.5 bg-[#141311] hover:bg-[#26221D] text-[#FAF8F5] px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg border border-[#302B24] transition-all shadow-xs"
            >
              <span>Get started free</span>
              <ArrowRight size={14} className="text-[#C7B596]" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section: Open, Unrushed, Editorial */}
      <header className="relative pt-32 sm:pt-44 lg:pt-52 pb-20 sm:pb-28 px-4 sm:px-8 max-w-6xl mx-auto text-center">
        
        <p className="text-xs font-mono uppercase tracking-widest text-[#827869] font-medium mb-6">
          SIMPLE PROJECT WORKSPACE FOR TEAMS
        </p>

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight text-[#141311] leading-[1.06] mb-8 max-w-4xl mx-auto">
          The clarity your team <br className="hidden sm:inline" />
          <span className="font-serif italic text-[#966F2D]">requires.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-[#4A4338] font-normal leading-relaxed mb-10">
          Everything your team needs to stay aligned. Visual task boards, built-in conversations, instant search, and separate team spaces—completely free.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#141311] hover:bg-[#26221D] text-[#FAF8F5] px-8 py-3.5 text-sm sm:text-base font-medium rounded-lg border border-[#332D25] shadow-sm hover:-translate-y-0.5 transition-all"
          >
            <span>Start using Nexus for free</span>
            <ArrowRight size={16} className="text-[#C7B596]" />
          </Link>
          <a
            href="#boards"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-[#F2ECE1] text-[#3D372D] px-6 py-3.5 text-sm sm:text-base font-medium rounded-lg border border-[#D8CEBE] shadow-2xs hover:-translate-y-0.5 transition-all"
          >
            <span>See how it works</span>
          </a>
        </div>

        <p className="text-xs text-[#7A7162] font-normal">
          100% free to use • No credit card required • Ready in seconds
        </p>

        {/* 3. Hero Visual: A Spacious, Clean View of the Actual Kanban Board */}
        <div className="mt-16 sm:mt-24 w-full bg-white border border-[#E3DACB] rounded-xl sm:rounded-2xl shadow-[0_12px_45px_-10px_rgba(25,20,15,0.06)] overflow-hidden text-left">
          
          {/* Header of the Board */}
          <div className="h-14 border-b border-[#E8E1D5] bg-[#F7F3EB] px-5 sm:px-7 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#141311]">Engineering Workspace</span>
              <span className="text-[#A39988] hidden sm:inline">/</span>
              <span className="text-xs text-[#6B6253] hidden sm:inline">Sprint Tasks</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 bg-white border border-[#DDD3C2] px-3 py-1.5 rounded-md text-xs text-[#706757]">
                <Search size={13} className="text-[#966F2D]" />
                <span>Search tasks or messages...</span>
                <kbd className="font-mono text-[10px] bg-[#F0EAE0] px-1 rounded text-[#595042]">⌘K</kbd>
              </div>
              <div className="h-7 w-7 rounded bg-[#141311] text-[#FAF8F5] flex items-center justify-center text-xs font-bold">
                AA
              </div>
            </div>
          </div>

          {/* 3 Columns of Tasks with Real Content & Breathing Room */}
          <div className="p-5 sm:p-8 bg-[#FAF8F5] grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Column 1: To Do */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-[#4A4338] flex items-center gap-1.5">
                  <Clock size={13} className="text-[#966F2D]" />
                  <span>To Do</span>
                </span>
                <span className="text-xs font-mono text-[#7A7162] bg-white border border-[#E0D7C8] px-2 py-0.5 rounded">
                  2
                </span>
              </div>

              {/* Task 1 */}
              <div className="bg-white border border-[#E3DACB] rounded-lg p-4 shadow-2xs flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-semibold text-[#8C6225] bg-[#FAF3E6] border border-[#EADBBD] px-1.5 py-0.5 rounded">
                    High
                  </span>
                  <span className="text-[11px] font-mono text-[#857B6C]">NEX-101</span>
                </div>
                <h4 className="text-sm font-semibold text-[#141311]">
                  Finish user profile settings page
                </h4>
                <p className="text-xs text-[#5C5447] leading-relaxed">
                  Add password change form, notification toggles, and avatar upload.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#F2EDE4] text-xs text-[#7A7162]">
                  <span>3 subtasks</span>
                  <span className="h-5 w-5 bg-[#EAE3D6] text-[#383228] font-bold rounded flex items-center justify-center text-[10px]">
                    JD
                  </span>
                </div>
              </div>

              {/* Task 2 */}
              <div className="bg-white border border-[#E3DACB] rounded-lg p-4 shadow-2xs flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-semibold text-[#544D41] bg-[#F2EDE4] border border-[#DDD5C7] px-1.5 py-0.5 rounded">
                    Normal
                  </span>
                  <span className="text-[11px] font-mono text-[#857B6C]">NEX-102</span>
                </div>
                <h4 className="text-sm font-semibold text-[#141311]">
                  Review invitation email copy
                </h4>
                <div className="flex items-center justify-between pt-2 border-t border-[#F2EDE4] text-xs text-[#7A7162]">
                  <span>2 comments</span>
                  <span className="h-5 w-5 bg-[#EAE3D6] text-[#383228] font-bold rounded flex items-center justify-center text-[10px]">
                    SA
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: In Progress */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-[#141311] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
                  <span>In Progress</span>
                </span>
                <span className="text-xs font-mono text-[#8C6225] bg-[#FAF3E6] border border-[#EADBBD] px-2 py-0.5 rounded font-semibold">
                  1
                </span>
              </div>

              {/* In Progress Task */}
              <div className="bg-white border-2 border-[#D4C7B3] rounded-lg p-4 shadow-xs flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-semibold text-[#8C6225] bg-[#FAF3E6] border border-[#EADBBD] px-1.5 py-0.5 rounded">
                    In Progress
                  </span>
                  <span className="text-[11px] font-mono text-[#857B6C]">NEX-103</span>
                </div>
                <h4 className="text-sm font-semibold text-[#141311]">
                  Live board updates when tasks move
                </h4>
                <p className="text-xs text-[#4D4537] leading-relaxed">
                  When a teammate drags a card, update everyone's board without refreshing.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-[#F2EDE4] text-xs">
                  <span className="text-[#2D6A42] font-medium text-[11px]">Ready for review</span>
                  <span className="h-5 w-5 bg-[#141311] text-[#FAF8F5] font-bold rounded flex items-center justify-center text-[10px]">
                    AA
                  </span>
                </div>
              </div>
            </div>

            {/* Column 3: Done */}
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-[#4A4338] flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#2D6A42]" />
                  <span>Done</span>
                </span>
                <span className="text-xs font-mono text-[#7A7162] bg-white border border-[#E0D7C8] px-2 py-0.5 rounded">
                  8
                </span>
              </div>

              {/* Done Task 1 */}
              <div className="bg-white/80 border border-[#E3DACB] rounded-lg p-4 shadow-2xs flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-semibold text-[#2D6A42] bg-[#EAF5ED] border border-[#CDE5D4] px-1.5 py-0.5 rounded">
                    Completed
                  </span>
                  <span className="text-[11px] font-mono text-[#857B6C]">NEX-098</span>
                </div>
                <h4 className="text-sm font-medium text-[#665E50] line-through">
                  Setup team member email invitations
                </h4>
                <div className="pt-1 text-[11px] text-[#827867]">
                  Done yesterday by Ahmad
                </div>
              </div>

              {/* Done Task 2 */}
              <div className="bg-white/80 border border-[#E3DACB] rounded-lg p-4 shadow-2xs flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] font-semibold text-[#2D6A42] bg-[#EAF5ED] border border-[#CDE5D4] px-1.5 py-0.5 rounded">
                    Completed
                  </span>
                  <span className="text-[11px] font-mono text-[#857B6C]">NEX-097</span>
                </div>
                <h4 className="text-sm font-medium text-[#665E50] line-through">
                  Fast search across tasks and comments
                </h4>
                <div className="pt-1 text-[11px] text-[#827867]">
                  Done by John
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* 4. Feature 1: Task Boards (Spacious, Open Spotlight) */}
      <section id="boards" className="scroll-mt-28 py-24 sm:py-32 border-t border-[#E8E1D5] bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-12 gap-12 sm:gap-16 items-center">
            
            <div className="md:col-span-5">
              <span className="text-xs font-mono uppercase tracking-widest text-[#827869] font-semibold block mb-3">
                01 // VISUAL TASK BOARDS
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#141311] leading-tight mb-5">
                Organize work visually. <br />
                <span className="font-serif italic text-[#966F2D]">Move fast together.</span>
              </h2>
              <p className="text-[#4A4338] text-base leading-relaxed mb-6 font-normal">
                Drag and drop tasks from To Do to Done. Set priority levels, assign teammates, and add subtask checklists so nothing slips through the cracks.
              </p>
              <ul className="space-y-3 text-sm text-[#4A4338]">
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#966F2D]"></span>
                  <span>Drag-and-drop between customizable stages</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#966F2D]"></span>
                  <span>Live updates for everyone without page refreshes</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#966F2D]"></span>
                  <span>Clear priority flags: Low, Normal, High, Urgent</span>
                </li>
              </ul>
            </div>

            <div className="md:col-span-7 bg-white border border-[#E3DACB] rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="text-xs font-semibold text-[#7A7162] mb-4 pb-3 border-b border-[#F0EAE0]">
                Task Details Example
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-[#8C6225] bg-[#FAF3E6] border border-[#EADBBD] px-2 py-0.5 rounded font-semibold">
                    HIGH PRIORITY
                  </span>
                  <span className="text-xs font-mono text-[#827867]">Assigned to: Sarah Ali</span>
                </div>
                <h3 className="text-lg font-semibold text-[#141311]">
                  Redesign the project landing page
                </h3>
                <p className="text-sm text-[#544D41] leading-relaxed">
                  Make the text easy to read, keep layout open and relaxed, and remove unnecessary buzzwords.
                </p>
                <div className="bg-[#FAF8F5] border border-[#E8E1D5] rounded-lg p-3 text-xs space-y-2">
                  <div className="font-semibold text-[#141311]">Checklist (3 of 4 completed)</div>
                  <div className="space-y-1.5 text-[#544D41]">
                    <div className="flex items-center gap-2 line-through text-[#827867]">
                      <CheckCircle2 size={13} className="text-[#2D6A42]" /> High contrast colors applied
                    </div>
                    <div className="flex items-center gap-2 line-through text-[#827867]">
                      <CheckCircle2 size={13} className="text-[#2D6A42]" /> Smooth scrolling enabled
                    </div>
                    <div className="flex items-center gap-2 line-through text-[#827867]">
                      <CheckCircle2 size={13} className="text-[#2D6A42]" /> Free pricing clearly stated
                    </div>
                    <div className="flex items-center gap-2 text-[#141311] font-medium">
                      <span className="w-3 h-3 rounded border border-[#8C6225]"></span> Review with team
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Feature 2: Built-in Team Chat (Spacious Spotlight) */}
      <section id="chat" className="scroll-mt-28 py-24 sm:py-32 border-t border-[#E8E1D5] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-12 gap-12 sm:gap-16 items-center">
            
            <div className="md:col-span-7 md:order-1 order-2 bg-white border border-[#E3DACB] rounded-xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F0EAE0]">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded bg-[#141311] text-[#FAF8F5] flex items-center justify-center text-xs font-bold">
                    NX
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#141311]">#general</div>
                    <div className="text-[11px] text-[#7A7162]">5 team members active</div>
                  </div>
                </div>
                <span className="text-xs font-mono text-[#2D6A42] font-semibold bg-[#EAF5ED] px-2 py-0.5 rounded border border-[#CDE5D4]">
                  Online
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded bg-[#EAE3D6] text-[#383228] font-bold flex items-center justify-center text-[10px] shrink-0">
                    JD
                  </div>
                  <div className="bg-[#F7F4EE] border border-[#E8E1D5] p-3 rounded-lg text-[#3D372D] flex-1 leading-relaxed">
                    <span className="font-semibold text-[#141311] block mb-0.5">John Doe</span>
                    Did anyone check the new login page on mobile?
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded bg-[#141311] text-[#FAF8F5] font-bold flex items-center justify-center text-[10px] shrink-0">
                    AA
                  </div>
                  <div className="bg-[#141311] text-[#FAF8F5] p-3 rounded-lg flex-1 leading-relaxed">
                    <span className="font-semibold text-[#C7B596] block mb-0.5">Ahmad Aamir</span>
                    Just checked it on iPhone and Android. Spacing looks great and all buttons are easy to tap.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded bg-[#EAE3D6] text-[#383228] font-bold flex items-center justify-center text-[10px] shrink-0">
                    SA
                  </div>
                  <div className="bg-[#F7F4EE] border border-[#E8E1D5] p-3 rounded-lg text-[#3D372D] flex-1 leading-relaxed">
                    <span className="font-semibold text-[#141311] block mb-0.5">Sarah Ali</span>
                    Awesome! I will mark ticket NEX-101 as done.
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-5 md:order-2 order-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[#827869] font-semibold block mb-3">
                02 // BUILT-IN TEAM CHAT
              </span>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#141311] leading-tight mb-5">
                Talk where the work happens. <br />
                <span className="font-serif italic text-[#966F2D]">No tab switching.</span>
              </h2>
              <p className="text-[#4A4338] text-base leading-relaxed mb-6 font-normal">
                Stop switching between Slack, WhatsApp, and project tools. Message your teammates directly or in group channels right inside Nexus.
              </p>
              <ul className="space-y-3 text-sm text-[#4A4338]">
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#966F2D]"></span>
                  <span>Direct messages and team channels</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#966F2D]"></span>
                  <span>Discuss tasks directly on their cards</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#966F2D]"></span>
                  <span>Press ⌘J anytime to quickly open chat</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Feature 3: Instant Search & Workspaces */}
      <section id="search" className="scroll-mt-28 py-24 sm:py-32 border-t border-[#E8E1D5] bg-[#F7F4EE]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-[#827869] font-semibold block mb-3">
              03 // SEARCH & WORKSPACES
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#141311] leading-tight mb-4">
              Find anything instantly. <br />
              <span className="font-serif italic text-[#966F2D]">Keep projects separated.</span>
            </h2>
            <p className="text-[#4A4338] text-base leading-relaxed">
              Whether you have 10 tasks or 1,000, find any deliverable or conversation in seconds. Create separate workspaces for each project or department.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Card 1: Search */}
            <div className="bg-white border border-[#E3DACB] rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#8C6225] font-mono">INSTANT SEARCH</span>
                  <span className="text-xs font-mono text-[#827867]">Press ⌘K</span>
                </div>
                <h3 className="text-xl font-semibold text-[#141311] mb-2">
                  Never lose track of a task or comment
                </h3>
                <p className="text-sm text-[#4D4537] leading-relaxed mb-6">
                  Type what you are looking for and get instant results across all your tickets, descriptions, and messages.
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E8E1D5] rounded-lg p-3.5 space-y-2.5">
                <div className="flex items-center gap-2 bg-white border border-[#DDD3C2] p-2 rounded text-xs font-mono">
                  <Search size={13} className="text-[#966F2D]" />
                  <span className="text-[#141311]">"landing page"</span>
                  <span className="ml-auto text-[10px] text-[#827867]">2 matches</span>
                </div>
                <div className="bg-white border border-[#E8E1D5] p-2.5 rounded text-xs">
                  <div className="font-semibold text-[#141311]">Redesign the project landing page</div>
                  <div className="text-[11px] text-[#7A7162] mt-0.5">In Progress • Assigned to Sarah</div>
                </div>
              </div>
            </div>

            {/* Card 2: Multiple Workspaces */}
            <div id="workspaces" className="scroll-mt-28 bg-white border border-[#E3DACB] rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-[#8C6225] font-mono">SEPARATE WORKSPACES</span>
                  <span className="text-xs font-mono text-[#827867]">One account</span>
                </div>
                <h3 className="text-xl font-semibold text-[#141311] mb-2">
                  Organize different teams or clients
                </h3>
                <p className="text-sm text-[#4D4537] leading-relaxed mb-6">
                  Switch between Engineering, Marketing, and Client projects with one click. Invite team members with a simple email.
                </p>
              </div>

              <div className="bg-[#FAF8F5] border border-[#E8E1D5] rounded-lg p-3 space-y-2">
                <div className="bg-white border-2 border-[#141311] p-3 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded bg-[#141311] text-[#FAF8F5] text-[10px] font-bold flex items-center justify-center">
                      EN
                    </span>
                    <span className="text-xs font-semibold text-[#141311]">Engineering Team</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold text-[#2D6A42] bg-[#EAF5ED] px-2 py-0.5 rounded">Active</span>
                </div>

                <div className="bg-white border border-[#E3DACB] p-3 rounded flex items-center justify-between text-xs text-[#544D41]">
                  <div className="flex items-center gap-2.5">
                    <span className="h-6 w-6 rounded bg-[#EAE3D6] text-[#383228] text-[10px] font-bold flex items-center justify-center">
                      MK
                    </span>
                    <span>Marketing Launch</span>
                  </div>
                  <span className="text-[11px] text-[#827867]">5 members</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Simple Team Activity & Progress */}
      <section className="py-24 sm:py-32 border-t border-[#E8E1D5] bg-[#FAF8F5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 text-center">
          
          <span className="text-xs font-mono uppercase tracking-widest text-[#827869] font-semibold block mb-3">
            04 // ACTIVITY & PROGRESS
          </span>

          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#141311] leading-tight mb-4 max-w-2xl mx-auto">
            Know what is getting done without asking for updates.
          </h2>

          <p className="max-w-xl mx-auto text-[#4A4338] text-base leading-relaxed mb-12">
            Nexus records every ticket move, comment, and member addition in a clean activity timeline.
          </p>

          <div className="max-w-2xl mx-auto bg-white border border-[#E3DACB] rounded-xl p-6 sm:p-8 text-left shadow-sm">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F0EAE0] text-xs font-semibold text-[#141311]">
              <History size={14} className="text-[#966F2D]" />
              <span>Recent Team Activity</span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded bg-[#141311] text-[#FAF8F5] text-[10px] font-bold flex items-center justify-center shrink-0">
                  AA
                </div>
                <div>
                  <span className="font-semibold text-[#141311]">Ahmad Aamir</span> moved <span className="font-semibold text-[#8C6225]">NEX-103</span> to <span className="font-bold text-[#141311]">In Progress</span>
                  <div className="text-[11px] text-[#7A7162] mt-0.5">5 minutes ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded bg-[#EAE3D6] text-[#383228] text-[10px] font-bold flex items-center justify-center shrink-0">
                  SA
                </div>
                <div>
                  <span className="font-semibold text-[#141311]">Sarah Ali</span> commented on <span className="font-semibold text-[#8C6225]">NEX-101</span>: "Ready for testing on mobile"
                  <div className="text-[11px] text-[#7A7162] mt-0.5">1 hour ago</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded bg-[#EAE3D6] text-[#383228] text-[10px] font-bold flex items-center justify-center shrink-0">
                  JD
                </div>
                <div>
                  <span className="font-semibold text-[#141311]">John Doe</span> marked <span className="font-semibold text-[#8C6225]">NEX-098</span> as <span className="font-bold text-[#2D6A42]">Done</span>
                  <div className="text-[11px] text-[#7A7162] mt-0.5">Yesterday</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 8. Honest, Calm Closing Section (100% Free, No fake trials, No neon orbs) */}
      <section className="bg-[#141311] text-[#FAF8F5] py-24 sm:py-32 px-4 sm:px-8 border-t border-[#29241E] text-center">
        <div className="max-w-3xl mx-auto">
          
          <h2 className="text-3xl sm:text-5xl font-normal tracking-tight leading-tight mb-6">
            Get your team organized today. <br />
            <span className="font-serif italic text-[#C7A35F]">Completely free.</span>
          </h2>

          <p className="text-[#A39988] text-base sm:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            Create your workspace in seconds. Invite your teammates and start tracking tasks with zero friction.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#FAF8F5] hover:bg-white text-[#141311] px-8 py-3.5 text-sm sm:text-base font-semibold rounded-lg shadow-sm hover:-translate-y-0.5 transition-all"
            >
              <span>Create your free workspace</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#211E1A] hover:bg-[#2E2A24] text-[#FAF8F5] px-6 py-3.5 text-sm sm:text-base font-medium rounded-lg border border-[#383228] transition-all"
            >
              <span>Sign in</span>
            </Link>
          </div>

          <p className="text-xs font-mono text-[#786E5E]">
            Free for all teams • No credit card required • No hidden limits
          </p>

        </div>
      </section>

      {/* 9. Clean, Minimal Footer */}
      <footer className="bg-[#FAF8F5] border-t border-[#E8E1D5] py-12 px-4 sm:px-8 text-xs text-[#665E50]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex items-center gap-3">
            <img src={nexusLogo} alt="Nexus" className="h-5 object-contain" />
            <span className="text-[#A39988]">/</span>
            <span>Simple project workspace for teams</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-[#544D41]">
            <a href="#boards" className="hover:text-[#141311] transition-colors">Task Boards</a>
            <a href="#chat" className="hover:text-[#141311] transition-colors">Team Chat</a>
            <a href="#search" className="hover:text-[#141311] transition-colors">Search</a>
            <a href="#workspaces" className="hover:text-[#141311] transition-colors">Workspaces</a>
            <Link to="/login" className="hover:text-[#141311] transition-colors">Sign in</Link>
          </div>

          <div className="text-[#8C8373]">
            © 2026 Nexus. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Landing;