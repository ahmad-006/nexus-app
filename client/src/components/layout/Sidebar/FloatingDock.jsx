import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, BarChart3, MessageSquare, Settings, LogOut } from 'lucide-react';
import nexusIcon from '../../../assets/nexus_icon.png';
import useAuthStore from '../../../store/authStore';
import useChatStore from '../../../store/chatStore';
import { useMyInvites } from '../../../hooks/useTeams';
import ConfirmationModal from '../../ui/ConfirmationModal';
import Tooltip from '../../ui/Tooltip';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Workspace' },
  { to: '/my-tasks', icon: CheckSquare, label: 'My Tasks' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

const FloatingDock = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logout } = useAuthStore();
  const { unreadCounts } = useChatStore();
  const { data: myInvites = [] } = useMyInvites();
  const pendingInvitesCount = myInvites.filter((inv) => inv.status === 'PENDING').length;
  const unreadMessagesCount = Object.values(unreadCounts).reduce(
    (sum, count) => sum + (Number(count) || 0),
    0
  );

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <aside 
        className="fixed z-50 flex bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] select-none
          /* Mobile: Bottom Floating Bar */
          bottom-4 left-1/2 -translate-x-1/2 flex-row items-center px-4 py-3 rounded-full w-[90%] max-w-[400px] justify-between
          /* Desktop: Left Vertical Fixed Pill */
          lg:left-6 lg:top-1/2 lg:-translate-y-1/2 lg:flex-col lg:py-6 lg:rounded-[2rem] lg:w-16 lg:items-center"
      >
        {/* Logo Glyph (Desktop) */}
        <div className="hidden lg:flex items-center justify-center mb-6 w-full">
          <img 
            src={nexusIcon} 
            alt="Nexus" 
            className="h-7 w-7 object-contain"
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-row lg:flex-col gap-2 w-full justify-around lg:justify-start items-center">
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.to} content={item.label} position="right">
              <NavLink
                to={item.to === '/settings' && pendingInvitesCount > 0 ? '/settings?tab=teams' : item.to}
                className={({ isActive }) =>
                  `relative flex items-center justify-center rounded-xl transition-colors
                  /* Mobile */
                  w-10 h-10 p-2.5
                  /* Desktop */
                  lg:w-11 lg:h-11
                  ${isActive 
                      ? 'bg-slate-900 text-white font-semibold shadow-xs' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                  }`
                }
              >
                {({ isActive }) => (
                  <div className="relative shrink-0 flex items-center justify-center">
                    <item.icon 
                      className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : ''}`} 
                      strokeWidth={2}
                    />
                    {item.to === '/settings' && pendingInvitesCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 px-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[9px] font-mono font-bold rounded flex items-center justify-center ring-1 ring-white shadow-xs">
                        {pendingInvitesCount}
                      </span>
                    )}
                    {item.to === '/messages' && unreadMessagesCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 px-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[9px] font-mono font-bold rounded flex items-center justify-center ring-1 ring-white shadow-xs">
                        {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            </Tooltip>
          ))}
          
          {/* Subtle Divider for Desktop */}
          <div className="hidden lg:block h-px bg-slate-200 my-2 w-7 opacity-70"></div>
          
          {/* Logout Button */}
          <Tooltip content="Sign out" position="right">
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="relative flex items-center justify-center rounded-xl transition-colors text-slate-400 hover:text-rose-600 hover:bg-rose-50 w-10 h-10 lg:w-11 lg:h-11 cursor-pointer"
              title="Logout"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5 shrink-0" strokeWidth={2} />
            </button>
          </Tooltip>
        </nav>
      </aside>

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out of NEXUS"
        message="Are you sure you want to end your session? You will need to log back in to access your workspace."
        confirmText="Sign Out"
        cancelText="Cancel"
        isDestructive={false}
      />
    </>
  );
};

export default FloatingDock;
