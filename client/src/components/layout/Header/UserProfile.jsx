import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import ConfirmationModal from '../../ui/ConfirmationModal';

const UserProfile = () => {
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="relative pointer-events-auto" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 focus:outline-none rounded-full ring-offset-2 focus:ring-2 focus:ring-slate-500/50 transition-all"
        >
          <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm ring-1 ring-slate-900/5 hover:ring-slate-900/10 transition-all">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-slate-900/5 divide-y divide-slate-100 py-1 z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            
            <div className="py-1">
              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <User size={16} />
                Profile
              </button>
              <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                <Settings size={16} />
                Account Settings
              </button>
            </div>
            
            <div className="py-1">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setIsLogoutModalOpen(true);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

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

export default UserProfile;
