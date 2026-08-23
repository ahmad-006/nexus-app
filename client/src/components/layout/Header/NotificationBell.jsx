import { Bell } from 'lucide-react';

const NotificationBell = () => {
  return (
    <button className="relative p-2 text-slate-400 hover:text-blue-900 transition-colors rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20">
      <Bell size={20} />
      <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
    </button>
  );
};

export default NotificationBell;
