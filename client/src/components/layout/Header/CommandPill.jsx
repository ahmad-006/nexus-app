import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Building2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import UserProfile from './UserProfile';
import useTeamStore from '../../../store/teamStore';

const CommandPill = () => {
  const location = useLocation();
  const { activeTeam, myTeams, setActiveTeam } = useTeamStore();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const pathMap = {
    '/dashboard': 'Workspace',
    '/team': 'Team Management',
    '/analytics': 'Analytics',
    '/settings': 'Settings'
  };
  
  const currentTab = pathMap[location.pathname] || 'Workspace';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-6 left-0 right-0 z-40 flex justify-between items-center px-4 sm:px-6 lg:px-12 pointer-events-none">
      
      {/* Breadcrumbs & Team Switcher (Left) */}
      <div className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-500 pointer-events-auto bg-white/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-slate-200/60 shadow-[0_4px_16px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)] transition-all">
        
        <div className="flex items-center gap-2 px-1">
          <div className="w-5 h-5 bg-gradient-to-tr from-slate-800 to-slate-600 rounded-md flex items-center justify-center shadow-sm">
            <span className="text-[10px] font-bold text-white tracking-tighter">NX</span>
          </div>
          <span className="text-slate-800 font-semibold tracking-tight">NEXUS</span>
        </div>

        <span className="text-slate-300 mx-1">/</span>
        
        {/* Team Switcher Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 hover:bg-slate-100/80 px-2 py-1 rounded-md transition-colors text-slate-600 hover:text-slate-900 group"
          >
            <span className="hidden md:inline font-medium">{activeTeam?.name || 'Select Team'}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-1.5 animate-in fade-in slide-in-from-top-2 origin-top-left z-50">
              <div className="px-3 py-1.5 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Teams</p>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                {myTeams.map((team) => (
                  <button
                    key={team._id}
                    onClick={() => {
                      setActiveTeam(team._id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                      activeTeam?._id === team._id ? 'bg-slate-50/50' : ''
                    }`}
                  >
                    <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className={`flex-1 truncate ${activeTeam?._id === team._id ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                      {team.name}
                    </span>
                    {activeTeam?._id === team._id && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <span className="text-slate-300 mx-1">/</span>
        <span className="text-slate-900 font-bold px-1">{currentTab}</span>
      </div>

      {/* The Command Pill (Center) */}
      <div className="flex-1 max-w-lg mx-auto pointer-events-auto">
        <div className="relative group bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.04)] rounded-full transition-shadow hover:shadow-[0_4px_25px_rgb(0,0,0,0.08)]">
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
      <div className="flex items-center gap-3 pointer-events-auto bg-white/80 backdrop-blur-xl px-3 py-2 rounded-2xl border border-slate-200/60 shadow-[0_4px_16px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_24px_rgb(0,0,0,0.06)] transition-all">
        <NotificationBell />
        <div className="h-5 w-px bg-slate-200"></div>
        <UserProfile />
      </div>
      
    </header>
  );
};

export default CommandPill;
