import { Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import UserProfile from './UserProfile';

const CommandPill = () => {
  const location = useLocation();
  
  const pathMap = {
    '/dashboard': 'Workspace',
    '/team': 'Team Management',
    '/analytics': 'Analytics',
    '/settings': 'Settings'
  };
  
  const currentTab = pathMap[location.pathname] || 'Workspace';

  return (
    <header className="fixed top-6 left-0 right-0 z-40 flex justify-between items-center px-4 sm:px-6 lg:px-12 pointer-events-none">
      
      {/* Breadcrumbs (Left) - Hidden on smallest screens to make room for Search */}
      <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-500 pointer-events-auto bg-white/70 backdrop-blur-md px-5 py-2.5 rounded-full border border-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
        <span className="text-slate-400">NEXUS</span>
        <span className="text-slate-300">/</span>
        <span className="text-slate-600 hidden md:inline">Team Alpha</span>
        <span className="text-slate-300 hidden md:inline">/</span>
        <span className="text-slate-900 font-bold">{currentTab}</span>
      </div>

      {/* The Command Pill (Center) */}
      <div className="flex-1 max-w-lg mx-auto pointer-events-auto">
        <div className="relative group bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-full transition-shadow hover:shadow-[0_4px_25px_rgb(0,0,0,0.08)]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search tickets, teammates, or commands... (⌘K)"
            className="block w-full pl-11 pr-4 py-3 bg-transparent border-none rounded-full leading-5 focus:outline-none focus:ring-0 text-sm text-slate-900 placeholder-slate-400 font-medium"
          />
        </div>
      </div>

      {/* Actions (Right) */}
      <div className="flex items-center gap-3 pointer-events-auto bg-white/70 backdrop-blur-xl px-3 py-2 rounded-full border border-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
        <NotificationBell />
        <div className="h-5 w-px bg-slate-200"></div>
        <UserProfile />
      </div>
      
    </header>
  );
};

export default CommandPill;
