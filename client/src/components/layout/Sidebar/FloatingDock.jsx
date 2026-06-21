import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, BarChart3, MessageSquare, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import useChatStore from '../../../store/chatStore';
import { useMyInvites } from '../../../hooks/useTeams';
import ConfirmationModal from '../../ui/ConfirmationModal';
import { socket } from '../../../api/socket';

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
  const { unreadCounts, setActiveConversation } = useChatStore();
  const { data: myInvites = [] } = useMyInvites();
  const pendingInvitesCount = myInvites.filter((inv) => inv.status === 'PENDING').length;
  const unreadMessagesCount = Object.values(unreadCounts).reduce(
    (sum, count) => sum + (Number(count) || 0),
    0
  );

  return (
    <>
      {/* Mobile-Only Bottom Floating Dock */}
      <aside 
        className="lg:hidden fixed z-50 bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-between px-3 py-2 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full w-[92%] max-w-[420px] select-none"
      >
        <nav className="flex flex-row gap-1 w-full justify-around items-center">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to === '/settings' && pendingInvitesCount > 0 ? '/settings?tab=teams' : item.to}
              onClick={() => {
                if (item.to === '/messages') {
                  setActiveConversation({
                    type: 'TEAM',
                    id: 'team',
                    name: 'Team Group',
                  });
                  if (socket && socket.connected) {
                    socket.emit('leave_chat');
                  }
                }
              }}
              className={({ isActive }) =>
                `relative flex items-center justify-center rounded-xl transition-colors w-10 h-10 p-2 ${
                  isActive 
                    ? 'bg-slate-900 text-white font-semibold shadow-xs' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
              aria-label={item.label}
            >
              {({ isActive }) => (
                <div className="relative shrink-0 flex items-center justify-center">
                  <item.icon 
                    className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : ''}`} 
                    strokeWidth={2}
                  />
                  {item.to === '/settings' && pendingInvitesCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 px-1 bg-slate-900 text-white text-[9px] font-mono font-bold rounded flex items-center justify-center ring-1 ring-white shadow-xs">
                      {pendingInvitesCount}
                    </span>
                  )}
                  {item.to === '/messages' && unreadMessagesCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-3.5 h-3.5 px-1 bg-slate-900 text-white text-[9px] font-mono font-bold rounded flex items-center justify-center ring-1 ring-white shadow-xs">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
          
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className="relative flex items-center justify-center rounded-xl transition-colors text-slate-400 hover:text-rose-600 hover:bg-rose-50 w-10 h-10 cursor-pointer"
            title="Logout"
            aria-label="Sign out"
          >
            <LogOut className="w-5 h-5 shrink-0" strokeWidth={2} />
          </button>
        </nav>
      </aside>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
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
