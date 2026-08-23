import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Hexagon, LayoutDashboard, Users, BarChart3, Settings, LogOut } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import ConfirmationModal from '../../ui/ConfirmationModal';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Workspace' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

const FloatingDock = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <aside 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed z-50 flex bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 ease-out overflow-hidden
          
          /* Mobile: Bottom Floating Bar */
          bottom-4 left-1/2 -translate-x-1/2 flex-row items-center px-4 py-3 rounded-full w-[90%] max-w-[400px] justify-between
          
          /* Desktop: Left Vertical Pill */
          lg:left-6 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:bottom-auto lg:flex-col lg:py-6 lg:rounded-[2rem] lg:justify-start
          
          ${isHovered ? 'lg:w-60 lg:px-4 lg:items-start' : 'lg:w-[72px] lg:px-0 lg:items-center'}`}
      >
        {/* Logo (Hidden on mobile bottom bar) */}
        <div className={`hidden lg:flex items-center gap-3 mb-8 transition-all duration-300 w-full ${isHovered ? 'px-2 justify-start' : 'justify-center'}`}>
          <Hexagon className="h-7 w-7 text-slate-900 shrink-0" strokeWidth={2.5} />
          <span className={`font-serif text-xl font-bold tracking-tight text-slate-900 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>
            NEXUS
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-row lg:flex-col gap-2 w-full justify-around lg:justify-start items-center lg:items-stretch">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-4 rounded-xl transition-all duration-200 group
                /* Mobile */
                justify-center w-10 h-10 p-2.5 sm:p-3
                /* Desktop */
                ${isHovered ? 'lg:w-full lg:px-3 lg:py-3 lg:justify-start' : 'lg:w-12 lg:h-12 lg:mx-auto lg:p-0'}
                ${isActive 
                    ? 'bg-slate-100 text-slate-900 font-semibold' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active Indicator Dot (Only when collapsed on desktop) */}
                  {!isHovered && isActive && (
                    <span className="hidden lg:block absolute -left-1.5 w-1.5 h-1.5 rounded-full bg-slate-900 shadow-sm" />
                  )}
                  {/* Active Indicator Line (Mobile) */}
                  {isActive && (
                    <span className="lg:hidden absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-slate-900" />
                  )}
                  
                  <item.icon 
                    className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 shrink-0 transition-colors ${isActive ? 'text-slate-900' : ''}`} 
                    strokeWidth={2}
                  />
                  {isHovered && (
                    <span className="hidden lg:block tracking-wide text-sm whitespace-nowrap animate-in fade-in duration-300">
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
          
          {/* Divider for desktop */}
          <div className="hidden lg:block h-px bg-slate-200 my-4 mx-auto transition-all duration-300 opacity-50" style={{ width: isHovered ? '100%' : '2rem' }}></div>
          
          {/* Logout Button directly in dock */}
          <button
            onClick={() => setIsLogoutModalOpen(true)}
            className={`relative flex items-center gap-4 rounded-xl transition-all duration-200 group text-red-500 hover:text-red-700 hover:bg-red-50
              /* Mobile */
              justify-center w-10 h-10 p-2.5 sm:p-3
              /* Desktop */
              ${isHovered ? 'lg:w-full lg:px-3 lg:py-3 lg:justify-start' : 'lg:w-12 lg:h-12 lg:mx-auto lg:p-0'}
            `}
            title="Logout"
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 shrink-0" strokeWidth={2} />
            {isHovered && (
              <span className="hidden lg:block tracking-wide text-sm whitespace-nowrap animate-in fade-in duration-300">
                Sign out
              </span>
            )}
          </button>
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
        isDestructive={true}
      />
    </>
  );
};

export default FloatingDock;
