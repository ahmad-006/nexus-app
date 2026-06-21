import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, Building2, Plus, Mail, Loader2 } from 'lucide-react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import UserProfile from './UserProfile';
import useTeamStore from '../../../store/teamStore';
import useChatStore from '../../../store/chatStore';
import useCommandStore from '../../../store/commandStore';
import { useMyTeams, useMyInvites, useAcceptInviteById, useDeclineInviteById } from '../../../hooks/useTeams';
import ProvisionWorkspaceModal from '../../team/ProvisionWorkspaceModal';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Workspace' },
  { to: '/my-tasks', label: 'My Tasks' },
  { to: '/team', label: 'Team' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/messages', label: 'Messages' },
  { to: '/settings', label: 'Settings' }
];

const CommandPill = () => {
  const location = useLocation();
  const { teams: myTeams, activeTeam } = useMyTeams();
  const { setActiveTeam } = useTeamStore();
  const { openCommandPalette } = useCommandStore();
  const { unreadCounts } = useChatStore();
  const { data: myInvites = [] } = useMyInvites();
  const pendingInvites = myInvites.filter((inv) => inv.status === 'PENDING');
  const acceptInviteMutation = useAcceptInviteById();
  const declineInviteMutation = useDeclineInviteById();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const unreadMessagesCount = Object.values(unreadCounts).reduce(
    (sum, count) => sum + (Number(count) || 0),
    0
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-40 px-3 sm:px-6 lg:px-8 pointer-events-none">
      <div className="max-w-[1600px] mx-auto w-full bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl px-3 sm:px-4 py-2 flex items-center justify-between gap-3 pointer-events-auto">
        
        {/* Left Section: Brand & Workspace Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link to="/dashboard" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center shadow-xs group-hover:bg-slate-800 transition-colors">
              <span className="text-[10px] font-bold text-white tracking-tighter">NX</span>
            </div>
            <span className="text-slate-900 font-bold tracking-tight text-sm hidden sm:inline">
              NEXUS
            </span>
          </Link>

          <span className="text-slate-300">/</span>
          
          {/* Team Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1.5 hover:bg-slate-100/80 px-2 py-1 rounded-lg transition-colors text-slate-700 hover:text-slate-900 group cursor-pointer"
              aria-label="Switch workspace"
            >
              <span className="font-semibold text-xs text-slate-800 max-w-[120px] sm:max-w-[180px] truncate">
                {activeTeam?.name || 'Select Team'}
              </span>
              {pendingInvites.length > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-900 text-white rounded-full leading-none shadow-xs">
                  {pendingInvites.length}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.08)] py-1.5 animate-in fade-in slide-in-from-top-2 origin-top-left z-50">
                <div className="px-3 py-1.5 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspaces</p>
                </div>
                
                <div className="max-h-[220px] overflow-y-auto">
                  {myTeams.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-slate-400 text-center">
                      No workspaces found
                    </div>
                  ) : (
                    myTeams.map((team) => (
                      <button
                        key={team._id}
                        onClick={() => {
                          setActiveTeam(team._id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer ${
                          activeTeam?._id === team._id ? 'bg-slate-50 font-semibold' : ''
                        }`}
                      >
                        <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className={`flex-1 truncate ${activeTeam?._id === team._id ? 'text-slate-900' : 'text-slate-600'}`}>
                          {team.name}
                        </span>
                        {activeTeam?._id === team._id && (
                          <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Pending Invites Section */}
                {pendingInvites.length > 0 && (
                  <div className="border-t border-slate-100 mt-1 pt-1.5">
                    <div className="px-3 py-1 flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                        <Mail size={11} />
                        <span>Pending Clearances ({pendingInvites.length})</span>
                      </p>
                    </div>
                    <div className="max-h-40 overflow-y-auto px-2 py-1 space-y-1.5">
                      {pendingInvites.map((invite) => (
                        <div key={invite._id} className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition-colors">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className="w-5 h-5 rounded-md bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                              {invite.teamId?.name?.charAt(0).toUpperCase() || 'W'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {invite.teamId?.name || 'Workspace'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                declineInviteMutation.mutate(invite._id);
                              }}
                              className="flex-1 py-1 px-2 rounded-lg border border-slate-200 bg-white text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                acceptInviteMutation.mutate(invite._id, {
                                  onSuccess: () => setIsDropdownOpen(false)
                                });
                              }}
                              className="flex-1 py-1 px-2 rounded-lg bg-slate-900 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              {acceptInviteMutation.isPending ? (
                                <Loader2 size={11} className="animate-spin" />
                              ) : (
                                <span>Join</span>
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action: Create Workspace */}
                <div className="p-1 border-t border-slate-100 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsProvisionModalOpen(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                      <Plus size={13} />
                    </div>
                    <span>Create Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Desktop Route Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to === '/settings' && pendingInvites.length > 0 ? '/settings?tab=teams' : item.to}
              className={({ isActive }) =>
                `relative px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <span>{item.label}</span>
              {item.to === '/messages' && unreadMessagesCount > 0 && (
                <span
                  className={`min-w-4 h-4 px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center tabular-nums leading-none ${
                    location.pathname === '/messages'
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                </span>
              )}
              {item.to === '/settings' && pendingInvites.length > 0 && (
                <span
                  className={`min-w-4 h-4 px-1 rounded-full text-[9px] font-mono font-bold flex items-center justify-center tabular-nums leading-none ${
                    location.pathname.startsWith('/settings')
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {pendingInvites.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Command Palette Trigger, Notification, Profile */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openCommandPalette}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-xl transition-colors text-slate-500 hover:text-slate-800 text-xs cursor-pointer group"
            aria-label="Open command palette"
          >
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0" />
            <span className="hidden xl:inline text-slate-400 group-hover:text-slate-600 text-xs font-normal">
              Search tickets, teammates...
            </span>
            <span className="hidden sm:inline xl:hidden text-slate-400 group-hover:text-slate-600 text-xs font-normal">
              Search...
            </span>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
              ⌘K
            </kbd>
          </button>

          <NotificationBell />
          <div className="h-4 w-px bg-slate-200 mx-0.5"></div>
          <UserProfile />
        </div>

      </div>

      {/* Workspace Provisioning Wizard */}
      <ProvisionWorkspaceModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
      />
    </header>
  );
};

export default CommandPill;
