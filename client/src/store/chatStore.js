import { create } from 'zustand';

const useChatStore = create((set) => ({
  // Active conversation is either { type: 'TEAM', id: 'team', name: 'Team Group' } or { type: 'DM', id: otherUserId, name: string, user: Object }
  activeConversation: { type: 'TEAM', id: 'team', name: 'Team Group' },
  showMobileList: false,
  unreadCounts: {},
  typingUsers: {},
  onlineUserIds: new Set(),
  lastSeenMap: {},

  setShowMobileList: (showMobileList) => set({ showMobileList }),

  setActiveConversation: (conversation) =>
    set({
      activeConversation: conversation,
    }),

  setOnlineUsers: (ids = []) =>
    set({
      onlineUserIds: new Set(ids.map(String)),
    }),

  setUserPresence: (userId, status, lastSeen) =>
    set((state) => {
      const next = new Set(state.onlineUserIds);
      const uStr = String(userId);
      if (status === 'online') {
        next.add(uStr);
      } else {
        next.delete(uStr);
      }
      const nextLastSeen = { ...state.lastSeenMap };
      if (lastSeen) {
        nextLastSeen[uStr] = lastSeen;
      }
      return { onlineUserIds: next, lastSeenMap: nextLastSeen };
    }),

  setUnreadCounts: (counts) => set({ unreadCounts: counts || {} }),

  incrementUnread: (convKey) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [convKey]: (state.unreadCounts[convKey] || 0) + 1,
      },
    })),

  clearUnread: (convKey) =>
    set((state) => {
      const next = { ...state.unreadCounts };
      delete next[convKey];
      return { unreadCounts: next };
    }),

  addTypingUser: (convKey, user) =>
    set((state) => {
      const current = state.typingUsers[convKey] || [];
      if (current.some((u) => u.userId === user.userId)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [convKey]: [...current, user],
        },
      };
    }),

  removeTypingUser: (convKey, userId) =>
    set((state) => {
      const current = state.typingUsers[convKey] || [];
      return {
        typingUsers: {
          ...state.typingUsers,
          [convKey]: current.filter((u) => u.userId !== userId),
        },
      };
    }),
}));

export default useChatStore;
