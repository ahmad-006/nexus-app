import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import useChatStore from '../../store/chatStore';

export default function ChatTrigger() {
  const navigate = useNavigate();
  const { unreadCounts } = useChatStore();

  const totalUnread = Object.values(unreadCounts).reduce(
    (sum, count) => sum + (Number(count) || 0),
    0
  );

  return (
    <button
      type="button"
      onClick={() => navigate('/messages')}
      className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 transition-colors cursor-pointer"
      title="Messages & Team Chat (⌘J)"
      aria-label="Open messages"
    >
      <MessageSquare className="w-5 h-5 text-slate-600" />
      {totalUnread > 0 && (
        <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-mono font-bold flex items-center justify-center tabular-nums leading-none shadow-xs">
          {totalUnread > 99 ? '99+' : totalUnread}
        </span>
      )}
    </button>
  );
}
