import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  Users,
  UserCheck,
  ArrowRightCircle,
  MessageSquare,
  Clock
} from 'lucide-react';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead
} from '../../../hooks/useNotifications';

const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'TEAM_INVITE':
      return (
        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
          <Users className="w-3.5 h-3.5" />
        </div>
      );
    case 'TICKET_ASSIGNED':
      return (
        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
          <UserCheck className="w-3.5 h-3.5" />
        </div>
      );
    case 'TICKET_STATUS_CHANGED':
      return (
        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
          <ArrowRightCircle className="w-3.5 h-3.5" />
        </div>
      );
    case 'COMMENT_MENTION':
      return (
        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
          <MessageSquare className="w-3.5 h-3.5" />
        </div>
      );
    default:
      return (
        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
          <Bell className="w-3.5 h-3.5" />
        </div>
      );
  }
};

const NotificationBell = () => {
  const navigate = useNavigate();
  const { notifications = [], unreadCount = 0, isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'UNREAD'
  const popoverRef = useRef(null);

  // Close popover on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const displayedNotifications = useMemo(() => {
    if (filterTab === 'UNREAD') {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filterTab]);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification._id);
    }
    setIsOpen(false);

    // Deep-link navigation
    if (notification.type === 'TEAM_INVITE') {
      navigate('/settings?tab=teams');
    } else if (notification.resourceId) {
      navigate(`/dashboard/ticket/${notification.resourceId}`);
    }
  };

  const handleMarkAllRead = (e) => {
    e.stopPropagation();
    markAllAsReadMutation.mutate();
  };

  return (
    <div className="relative pointer-events-auto" ref={popoverRef}>
      {/* 1. Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all duration-200 focus:outline-none ${
          isOpen
            ? 'bg-slate-100 text-slate-900 shadow-sm ring-1 ring-slate-200'
            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell className="w-5 h-5 transition-transform duration-200 hover:scale-105" />

        {/* Unread Pill Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white shadow-sm animate-in zoom-in duration-200">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 2. Linear-Styled Popover Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-[0_16px_48px_rgb(0,0,0,0.12)] z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 origin-top-right duration-200">
          
          {/* Popover Header */}
          <div className="p-4 border-b border-slate-100/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Notifications</h3>
              {unreadCount > 0 ? (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full border border-slate-200">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                  All caught up
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markAllAsReadMutation.isPending}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-4 pt-2.5 pb-2 flex items-center gap-2 border-b border-slate-100 bg-slate-50/50">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                filterTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterTab('UNREAD')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                filterTab === 'UNREAD'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications Scroll Container */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 text-left">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                <span>Loading alerts...</span>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center text-slate-400 flex flex-col items-center">
                {filterTab === 'UNREAD' ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500/80 mb-2" />
                    <p className="text-xs font-bold text-slate-700">No unread alerts</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      You have acknowledged all recent notifications
                    </p>
                  </>
                ) : (
                  <>
                    <BellOff className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-700">No notifications yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px]">
                      When operatives assign you tickets or workspace events occur, you will see them here
                    </p>
                  </>
                )}
              </div>
            ) : (
              displayedNotifications.map((notification) => {
                const sender = notification.senderId;

                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3.5 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-start gap-3 group relative ${
                      !notification.isRead ? 'bg-slate-50/40' : ''
                    }`}
                  >
                    {/* Left Icon */}
                    {getNotificationIcon(notification.type)}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug truncate-2-lines ${
                        !notification.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'
                      }`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeTime(notification.createdAt)}
                        </span>

                        {sender?.name && (
                          <>
                            <span className="text-slate-300 text-[9px]">•</span>
                            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">
                              {sender.name}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Unread Dot Indicator */}
                    {!notification.isRead && (
                      <span className="w-2 h-2 rounded-full bg-slate-900 shrink-0 mt-1.5 shadow-sm" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="px-4 py-2 bg-slate-50/60 border-t border-slate-100 text-center">
            <span className="text-[10px] font-mono text-slate-400">
              NEXUS Live Alert Gateway
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
