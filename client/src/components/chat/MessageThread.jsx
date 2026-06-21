import { useEffect, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Users, Lock } from 'lucide-react';
import MessageItem from './MessageItem';

function ConversationInception({ conversation }) {
  const isTeam = conversation?.type === 'TEAM';
  const name = conversation?.name || 'Conversation';
  const user = conversation?.user || {};

  return (
    <div className="mx-auto my-6 max-w-md text-center px-4 py-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70 shadow-2xs select-none">
      <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-800 dark:text-slate-200 shadow-2xs font-semibold text-base font-mono mb-2">
        {isTeam ? (
          <Users className="w-6 h-6 text-slate-700 dark:text-slate-300" />
        ) : user.image ? (
          <img
            src={user.image}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          name[0]?.toUpperCase() || 'U'
        )}
      </div>
      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
        {name}
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed flex items-center justify-center gap-1.5">
        {!isTeam && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
        {isTeam
          ? `Workspace channel. All members of the active workspace can participate.`
          : `Direct conversation with ${user.email || name}. Messages are private to participants.`}
      </p>
    </div>
  );
}

ConversationInception.propTypes = {
  conversation: PropTypes.shape({
    type: PropTypes.string,
    name: PropTypes.string,
    user: PropTypes.object,
  }),
};

export default function MessageThread({
  conversation,
  messages = [],
  isLoading,
  currentUserId,
  typingUsers = [],
  onEdit,
  onDelete,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const isAutoScrollRef = useRef(true);

  const isTeam = conversation?.type === 'TEAM';

  // Auto-scroll logic: scroll down if user was already at or near bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Within 80px from bottom counts as "at bottom"
    isAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 80;
  };

  useEffect(() => {
    if (isAutoScrollRef.current && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers]);

  // Group messages and insert date dividers
  const processedItems = useMemo(() => {
    const items = [];
    let lastDate = null;
    let lastSenderId = null;
    let lastTime = 0;

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt);
      const dateKey = msgDate.toDateString();

      // Date divider
      if (dateKey !== lastDate) {
        lastDate = dateKey;
        items.push({
          type: 'DATE_DIVIDER',
          id: `date-${dateKey}`,
          label: formatDateDivider(msgDate),
        });
        lastSenderId = null;
        lastTime = 0;
      }

      const senderId =
        typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
      const msgTime = msgDate.getTime();
      // Group if same sender and sent within 5 minutes (300,000ms)
      const isGrouped =
        lastSenderId === senderId && msgTime - lastTime < 300000;

      items.push({
        type: 'MESSAGE',
        id: msg._id,
        data: msg,
        isGrouped,
      });

      lastSenderId = senderId;
      lastTime = msgTime;
    });

    return items;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto min-h-0 bg-[#efeae2]/30 dark:bg-slate-950/50 select-text"
      style={{
        backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {isLoading ? (
        <div className="space-y-4 px-4 py-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-200/60 dark:bg-slate-800 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="w-28 h-3 rounded-sm bg-slate-200/60 dark:bg-slate-800" />
                <div className="w-3/4 h-3 rounded-sm bg-slate-200/60 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="min-h-full flex flex-col justify-end py-3">
          <ConversationInception conversation={conversation} />

          {messages.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              No messages yet. Send a message to start the conversation.
            </div>
          ) : (
            processedItems.map((item) => {
              if (item.type === 'DATE_DIVIDER') {
                return (
                  <div
                    key={item.id}
                    className="relative my-3 flex items-center justify-center select-none sticky top-2 z-10"
                  >
                    <span className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xs text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 px-3 py-1 rounded-lg shadow-2xs border border-slate-200/70 dark:border-slate-700/60 uppercase tracking-wider">
                      {item.label}
                    </span>
                  </div>
                );
              }

              return (
                <MessageItem
                  key={item.id}
                  message={item.data}
                  currentUserId={currentUserId}
                  isGrouped={item.isGrouped}
                  isTeam={isTeam}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              );
            })
          )}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="px-6 py-2 flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>
                {typingUsers.map((u) => u.userName).join(', ')}{' '}
                {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}

          <div ref={bottomRef} className="h-2" />
        </div>
      )}
    </div>
  );
}

function formatDateDivider(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

MessageThread.propTypes = {
  conversation: PropTypes.object,
  messages: PropTypes.array,
  isLoading: PropTypes.bool,
  currentUserId: PropTypes.string,
  typingUsers: PropTypes.array,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
