import { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  ChevronLeft,
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
} from '../hooks/useChat';
import MessageThread from '../components/chat/MessageThread';
import MessageInput from '../components/chat/MessageInput';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { socket } from '../api/socket';

export default function Messages() {
  const { user } = useAuthStore();
  const { activeTeamId } = useTeamStore();
  const {
    activeConversation,
    setActiveConversation,
    unreadCounts,
    typingUsers,
  } = useChatStore();

  const { data: teamDetails } = useTeamDetails(activeTeamId);
  const members = teamDetails?.members || [];
  const teamName = teamDetails?.name || 'Workspace';
  const currentUserId = user?._id || user?.id;

  const [memberSearch, setMemberSearch] = useState('');
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

  // Mark direct messages as read and signal active chat presence via WebSocket
  useEffect(() => {
    if (!isTeam && otherUserId) {
      markMessagesRead(otherUserId);
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
    }
  }, [isTeam, otherUserId, markMessagesRead, messages.length]);

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
        const q = memberSearch.toLowerCase();
        const u = m.userId || {};
        const name = (u.name || '').toLowerCase();
        const email = (u.email || m.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      });
  }, [members, memberSearch, currentUserId]);

  // Typing list for active chat
  const activeTypingList = useMemo(() => {
    const convKey = isTeam ? 'team' : activeConversation?.id;
    const users = typingUsers[convKey] || [];
    return users.filter((u) => String(u.userId) !== String(currentUserId));
  }, [typingUsers, isTeam, activeConversation, currentUserId]);

  const teamUnread = unreadCounts['team'] || 0;

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
          <div className="flex items-center justify-between mb-2.5">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
              {teamName}
            </span>
            <span className="text-[11px] font-mono text-slate-400 tabular-nums">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search or start new chat..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-slate-400 transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Pinned Section: Workspace Group Room */}
        <div className="p-2.5 border-b border-slate-200/60 dark:border-slate-800 shrink-0 bg-slate-50/40 dark:bg-slate-900/40">
          <div className="px-2 mb-1 text-[10px] font-mono font-medium tracking-wider text-slate-400 uppercase">
            Workspace Room
          </div>
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
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
              activeConversation?.type === 'TEAM'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border-slate-200 dark:border-slate-700 border-l-4 border-l-slate-900 dark:border-l-emerald-500 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 border-transparent'
            }`}
          >
            <div className="flex items-center gap-3 truncate">
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs font-semibold text-xs">
                <Users className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold truncate">
                  {teamName} Group
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  All-hands team discussion
                </div>
              </div>
            </div>

            {teamUnread > 0 && (
              <span className="min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-mono font-bold bg-emerald-600 text-white tabular-nums flex items-center justify-center">
                {teamUnread}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Section: Direct Chats */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1 min-h-0">
          <div className="px-2 mb-1 text-[10px] font-mono font-medium tracking-wider text-slate-400 uppercase">
            Direct Chats ({filteredMembers.length})
          </div>
          {filteredMembers.length === 0 ? (
            <div className="px-3 py-4 text-center text-[11px] text-slate-400 italic">
              {memberSearch ? 'No matching teammates' : 'No other teammates'}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const u = member.userId || {};
              const memberId = u._id || member.userId;
              const memberName = u.name || member.email || 'Teammate';
              const isSelected =
                activeConversation?.type === 'DM' &&
                String(activeConversation?.id) === String(memberId);
              const unread = unreadCounts[memberId] || 0;

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
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border-slate-200 dark:border-slate-700 border-l-4 border-l-slate-900 dark:border-l-emerald-500 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
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
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 pointer-events-none" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold truncate leading-tight">
                        {memberName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {member.role || 'Member'}
                      </div>
                    </div>
                  </div>

                  {unread > 0 && (
                    <span className="min-w-[18px] h-[18px] px-1.5 rounded-full text-[10px] font-mono font-bold bg-emerald-600 text-white tabular-nums flex items-center justify-center shadow-xs">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
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
              onClick={() => setShowMobileList(true)}
              className="md:hidden p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Back to conversations"
              aria-label="Back to conversations"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {isTeam ? (
              <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-slate-700 dark:text-slate-300" />
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
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 pointer-events-none" />
              </div>
            )}
            <div className="truncate">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {isTeam ? `${teamName} Group` : activeConversation?.name}
              </div>
              <div className="text-[11px] font-mono text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                {isTeam ? (
                  <span>{members.length} teammates in room</span>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Online</span>
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
