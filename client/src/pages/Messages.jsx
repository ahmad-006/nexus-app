import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  ChevronLeft,
  X,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useTeamStore from '../store/teamStore';
import useChatStore from '../store/chatStore';
import { useTeamDetails } from '../hooks/useTeams';
import {
  useTeamMessages,
  useDirectMessages,
  useSendMessage,
  useEditMessage,
  useDeleteMessage,
  useMarkMessagesRead,
  useConversationSummaries,
} from '../hooks/useChat';
import MessageThread from '../components/chat/MessageThread';
import MessageInput from '../components/chat/MessageInput';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { socket } from '../api/socket';

const formatSnippetTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  if (isYesterday) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function Messages() {
  const { user } = useAuthStore();
  const { activeTeamId } = useTeamStore();
  const {
    activeConversation,
    setActiveConversation,
    unreadCounts,
    typingUsers,
    onlineUserIds,
  } = useChatStore();

  const { data: teamDetails } = useTeamDetails(activeTeamId);
  const { data: conversationSummaries = {} } = useConversationSummaries(activeTeamId);
  const members = teamDetails?.members || [];
  const teamName = teamDetails?.name || 'Workspace';
  const currentUserId = user?._id || user?.id;

  const [memberSearch, setMemberSearch] = useState('');
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'DIRECT' | 'UNREAD'
  const [showMobileList, setShowMobileList] = useState(false);

  // Initialize active conversation to Team Group by default
  useEffect(() => {
    if (!activeConversation) {
      setActiveConversation({
        type: 'TEAM',
        id: 'team',
        name: `${teamName} Group`,
      });
    }
  }, [teamName]);

  // Set page document title
  const activeTitle =
    activeConversation?.type === 'TEAM'
      ? `${teamName} Group`
      : activeConversation?.name || 'Messages';
  useDocumentTitle(activeTitle);

  // Active chat queries
  const isTeam = activeConversation?.type === 'TEAM';
  const otherUserId = !isTeam ? activeConversation?.id : null;

  const { data: teamMessages = [], isLoading: isTeamLoading } = useTeamMessages(
    isTeam ? activeTeamId : null
  );
  const { data: directMessages = [], isLoading: isDirectLoading } = useDirectMessages(
    !isTeam ? activeTeamId : null,
    otherUserId
  );

  const messages = isTeam ? teamMessages : directMessages;
  const isLoading = isTeam ? isTeamLoading : isDirectLoading;

  const { sendMessage } = useSendMessage(activeTeamId, activeConversation);
  const editMessageMutation = useEditMessage(activeTeamId, activeConversation);
  const deleteMessageMutation = useDeleteMessage(activeTeamId, activeConversation);
  const markMessagesRead = useMarkMessagesRead(activeTeamId);

  // Synchronize active DM presence so messages sent by partner are only auto-read when actively viewing the DM
  useEffect(() => {
    const isDirectChatActive = !isTeam && !!otherUserId && !showMobileList;

    if (isDirectChatActive) {
      if (socket && socket.connected) {
        socket.emit('enter_chat', { partnerId: otherUserId });
      }
      const handleReconnect = () => {
        socket.emit('enter_chat', { partnerId: otherUserId });
      };
      socket.on('connect', handleReconnect);
      return () => {
        socket.off('connect', handleReconnect);
        if (socket && socket.connected) {
          socket.emit('leave_chat');
        }
      };
    } else {
      // In Team Group ("home messages") or conversation list - explicitly exit any DM presence
      if (socket && socket.connected) {
        socket.emit('leave_chat');
      }
    }
  }, [isTeam, otherUserId, showMobileList]);

  // Handle browser visibility change (e.g. background tab or minimized window)
  useEffect(() => {
    const handleVisibility = () => {
      const isDirectChatActive = !isTeam && !!otherUserId && !showMobileList;
      if (document.hidden) {
        if (socket && socket.connected) {
          socket.emit('leave_chat');
        }
      } else if (isDirectChatActive) {
        if (socket && socket.connected) {
          socket.emit('enter_chat', { partnerId: otherUserId });
        }
        markMessagesRead(otherUserId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isTeam, otherUserId, showMobileList, markMessagesRead]);

  // Mark direct messages as read upon opening DM or when new messages arrive
  useEffect(() => {
    if (!isTeam && otherUserId && !showMobileList) {
      markMessagesRead(otherUserId);
    }
  }, [isTeam, otherUserId, showMobileList, markMessagesRead, messages.length]);

  const totalUnreadCount = useMemo(() => {
    return Object.values(unreadCounts).reduce(
      (sum, count) => sum + (Number(count) || 0),
      0
    );
  }, [unreadCounts]);

  const onlineTeammatesCount = useMemo(() => {
    return members.filter((m) =>
      onlineUserIds.has(String(m.userId?._id || m.userId))
    ).length;
  }, [members, onlineUserIds]);

  // Filter teammates (exclude current user)
  const filteredMembers = useMemo(() => {
    const curIdStr = String(currentUserId || '');
    return members
      .filter((m) => {
        const mId = m.userId?._id || m.userId;
        return String(mId || '') !== curIdStr;
      })
      .filter((m) => {
        if (!memberSearch.trim()) return true;
        const q = memberSearch.toLowerCase().trim();
        const u = m.userId || {};
        const name = (u.name || '').toLowerCase();
        const email = (u.email || m.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      })
      .filter((m) => {
        const mId = String(m.userId?._id || m.userId || '');
        if (filterTab === 'UNREAD') {
          return (unreadCounts[mId] || 0) > 0;
        }
        return true;
      });
  }, [members, memberSearch, currentUserId, filterTab, unreadCounts]);

  // Typing list for active chat
  const activeTypingList = useMemo(() => {
    const convKey = isTeam ? 'team' : activeConversation?.id;
    const users = typingUsers[convKey] || [];
    return users.filter((u) => String(u.userId) !== String(currentUserId));
  }, [typingUsers, isTeam, activeConversation, currentUserId]);

  const teamUnread = unreadCounts['team'] || 0;
  const showTeamRoom =
    filterTab !== 'DIRECT' &&
    (filterTab !== 'UNREAD' || teamUnread > 0) &&
    (!memberSearch.trim() || `${teamName} Group`.toLowerCase().includes(memberSearch.toLowerCase().trim()));

  return (
    <div className="w-full h-full min-h-[520px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_24px_rgb(0,0,0,0.03)] flex overflow-hidden">
      {/* Left Pane: Conversations Navigation (Width: 320px) */}
      <aside
        className={`${
          showMobileList ? 'flex' : 'hidden md:flex'
        } w-full md:w-80 lg:w-88 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 flex flex-col h-full overflow-hidden select-none`}
      >
        {/* Workspace Brand Header */}
        <div className="p-3.5 border-b border-slate-200/70 dark:border-slate-800 shrink-0 bg-white/60 dark:bg-slate-900/60">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
              {teamName}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{onlineTeammatesCount} online</span>
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-slate-400 transition-colors shadow-2xs"
            />
            {memberSearch && (
              <button
                type="button"
                onClick={() => setMemberSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Segmented Filter Pills */}
          <div className="flex items-center gap-1 mt-2.5 bg-slate-200/60 dark:bg-slate-800/60 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setFilterTab('ALL')}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                filterTab === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('DIRECT')}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center cursor-pointer ${
                filterTab === 'DIRECT'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Direct
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('UNREAD')}
              className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                filterTab === 'UNREAD'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <span>Unread</span>
              {totalUnreadCount > 0 && (
                <span className="min-w-3.5 h-3.5 px-1 bg-emerald-600 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center">
                  {totalUnreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversation Streams */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
          {/* Pinned Section: Workspace Group Room */}
          {showTeamRoom && (
            <div className="mb-2">
              <div className="px-2 mb-1 text-[10px] font-mono font-medium tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                Workspace Room
              </div>
              {(() => {
                const teamSummary = conversationSummaries['team'];
                const teamLastMsg = teamSummary?.lastMessage;
                const teamLastTime = formatSnippetTime(teamSummary?.lastMessageTime);
                const isTeamSelected = activeConversation?.type === 'TEAM';
                const isTyping = (typingUsers['team'] || []).length > 0;

                return (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveConversation({
                        type: 'TEAM',
                        id: 'team',
                        name: `${teamName} Group`,
                      });
                      setShowMobileList(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isTeamSelected
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center shrink-0 font-semibold text-xs shadow-2xs">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="truncate min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold truncate leading-tight">
                            {teamName} Group
                          </span>
                          {teamLastTime && (
                            <span className="text-[10px] font-mono text-slate-400 tabular-nums shrink-0">
                              {teamLastTime}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-tight">
                          {isTyping ? (
                            <span className="text-emerald-600 dark:text-emerald-400 italic">
                              typing...
                            </span>
                          ) : teamLastMsg ? (
                            <span>{teamLastMsg}</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">All-hands team discussion</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {teamUnread > 0 && (
                      <span className="ml-2 min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-mono font-bold bg-emerald-600 text-white tabular-nums flex items-center justify-center shadow-xs shrink-0">
                        {teamUnread}
                      </span>
                    )}
                  </button>
                );
              })()}
            </div>
          )}

          {/* Direct Chats */}
          <div>
            <div className="px-2 mb-1 text-[10px] font-mono font-medium tracking-wider text-slate-400 dark:text-slate-500 uppercase flex items-center justify-between">
              <span>Direct Chats</span>
              <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                ({filteredMembers.length})
              </span>
            </div>

            {filteredMembers.length === 0 ? (
              <div className="px-3 py-6 text-center text-[11px] text-slate-400 dark:text-slate-500 italic">
                {filterTab === 'UNREAD'
                  ? 'No unread messages'
                  : memberSearch
                  ? 'No matching teammates'
                  : 'No teammates in workspace'}
              </div>
            ) : (
              filteredMembers.map((member) => {
                const u = member.userId || {};
                const memberId = String(u._id || member.userId);
                const memberName = u.name || member.email || 'Teammate';
                const isSelected =
                  activeConversation?.type === 'DM' &&
                  String(activeConversation?.id) === memberId;
                const unread = unreadCounts[memberId] || 0;
                const isOnline = onlineUserIds.has(memberId);
                const summary = conversationSummaries[memberId];
                const lastTime = formatSnippetTime(summary?.lastMessageTime);
                const isOwnLastMsg = summary?.lastMessageSenderId === String(currentUserId);
                const isTyping = (typingUsers[memberId] || []).length > 0;

                return (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => {
                      setActiveConversation({
                        type: 'DM',
                        id: memberId,
                        name: memberName,
                        user: u,
                      });
                      setShowMobileList(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-slate-900/5 dark:ring-white/10 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate min-w-0 flex-1">
                      <div className="relative shrink-0">
                        {u.image ? (
                          <img
                            src={u.image}
                            alt={memberName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                            {memberName[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 pointer-events-none" />
                        )}
                      </div>
                      <div className="truncate min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold truncate leading-tight">
                            {memberName}
                          </span>
                          {lastTime && (
                            <span className="text-[10px] font-mono text-slate-400 tabular-nums shrink-0">
                              {lastTime}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 leading-tight flex items-center justify-between">
                          {isTyping ? (
                            <span className="text-emerald-600 dark:text-emerald-400 italic">
                              typing...
                            </span>
                          ) : summary?.lastMessage ? (
                            <span className="truncate">
                              {isOwnLastMsg && <span className="text-slate-400 font-normal">You: </span>}
                              {summary.lastMessage}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 font-mono text-[10px]">
                              {member.role || 'member'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {unread > 0 && (
                      <span className="ml-2 min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-mono font-bold bg-emerald-600 text-white tabular-nums flex items-center justify-center shadow-xs shrink-0">
                        {unread}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </aside>

      {/* Right Pane: Active Chat Conversation (Flex-1) */}
      <main
        className={`${
          !showMobileList ? 'flex' : 'hidden md:flex'
        } flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 h-full overflow-hidden`}
      >
        {/* Active Conversation Header */}
        <header className="h-16 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center gap-3 truncate">
            {/* Mobile Back Button */}
            <button
              type="button"
              onClick={() => {
                setShowMobileList(true);
                setActiveConversation({
                  type: 'TEAM',
                  id: 'team',
                  name: `${teamName} Group`,
                });
                if (socket && socket.connected) {
                  socket.emit('leave_chat');
                }
              }}
              className="md:hidden p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to conversations"
              aria-label="Back to conversations"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {isTeam ? (
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center shrink-0 font-semibold text-xs shadow-2xs">
                <Users className="w-4 h-4" />
              </div>
            ) : (
              <div className="relative shrink-0">
                {activeConversation?.user?.image ? (
                  <img
                    src={activeConversation.user.image}
                    alt={activeConversation.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-mono font-medium">
                    {activeConversation?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                {onlineUserIds.has(String(otherUserId)) && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 pointer-events-none" />
                )}
              </div>
            )}
            <div className="truncate">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {isTeam ? `${teamName} Group` : activeConversation?.name}
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                {isTeam ? (
                  <span>
                    {members.length} {members.length === 1 ? 'teammate' : 'teammates'} • {onlineTeammatesCount} online
                  </span>
                ) : onlineUserIds.has(String(otherUserId)) ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 inline-block" />
                    <span>Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Message Stream */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <MessageThread
            conversation={activeConversation}
            messages={messages}
            isLoading={isLoading}
            currentUserId={currentUserId}
            typingUsers={activeTypingList}
            onEdit={(messageId, text) =>
              editMessageMutation.mutate({ messageId, message: text })
            }
            onDelete={(messageId) =>
              deleteMessageMutation.mutate(messageId)
            }
          />

          {/* Message Composer */}
          <MessageInput
            teamId={activeTeamId}
            activeConversation={activeConversation}
            onSendMessage={sendMessage}
            placeholder={
              isTeam
                ? `Message ${teamName} Group...`
                : `Message ${activeConversation?.name || 'teammate'}...`
            }
          />
        </div>
      </main>
    </div>
  );
}
