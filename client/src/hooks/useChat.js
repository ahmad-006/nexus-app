import { useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { socket } from '../api/socket';
import { messageKeys } from '../api/queryKeys';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';

/**
 * Fetch team group messages
 */
export const useTeamMessages = (teamId) => {
  return useQuery({
    queryKey: messageKeys.team(teamId),
    queryFn: async () => {
      const res = await api.get(`/messages/${teamId}/group`);
      return res.data?.data?.messages || [];
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Fetch private messages between current user and another member
 */
export const useDirectMessages = (teamId, otherUserId) => {
  return useQuery({
    queryKey: messageKeys.direct(teamId, otherUserId),
    queryFn: async () => {
      const res = await api.get(`/messages/${teamId}/${otherUserId}`);
      return res.data?.data?.messages || [];
    },
    enabled: !!teamId && !!otherUserId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Fetch unread message counts per sender in active workspace
 */
export const useUnreadMessageCounts = (teamId) => {
  const setUnreadCounts = useChatStore((s) => s.setUnreadCounts);

  return useQuery({
    queryKey: messageKeys.unread(teamId),
    queryFn: async () => {
      const res = await api.get(`/messages/${teamId}/unread`);
      const counts = res.data?.data?.counts || {};
      setUnreadCounts(counts);
      return counts;
    },
    enabled: !!teamId,
    staleTime: 1000 * 60,
  });
};

/**
 * Send message hook with optimistic updates and socket dispatch
 */
export const useSendMessage = (teamId, activeConversation) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const sendMessage = useCallback(
    async (messageText) => {
      if (!messageText?.trim() || !teamId || !activeConversation) return;

      const trimmed = messageText.trim();
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const isTeam = activeConversation.type === 'TEAM';
      const cacheKey = isTeam
        ? messageKeys.team(teamId)
        : messageKeys.direct(teamId, activeConversation.id);

      const optimisticMessage = {
        _id: tempId,
        tempId,
        message: trimmed,
        senderId: {
          _id: user?._id || user?.id,
          name: user?.name,
          email: user?.email,
          image: user?.image,
        },
        teamId,
        receiverId: isTeam ? null : activeConversation.id,
        createdAt: new Date().toISOString(),
        isSending: true,
        isRead: false,
      };

      // Optimistically append to cache
      queryClient.setQueryData(cacheKey, (old = []) => [...old, optimisticMessage]);

      if (isTeam) {
        socket.emit('send_team_message', {
          teamId,
          message: trimmed,
          tempId,
        });
      } else {
        socket.emit('send_private_message', {
          teamId,
          receiverId: activeConversation.id,
          message: trimmed,
          tempId,
        });
      }
    },
    [teamId, activeConversation, queryClient, user]
  );

  return { sendMessage };
};

/**
 * Edit message mutation
 */
export const useEditMessage = (teamId, activeConversation) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, message }) => {
      const res = await api.patch(`/messages/${messageId}`, { message });
      return res.data?.data?.message;
    },
    onSuccess: (updated) => {
      const isTeam = activeConversation?.type === 'TEAM';
      const cacheKey = isTeam
        ? messageKeys.team(teamId)
        : messageKeys.direct(teamId, activeConversation?.id);

      queryClient.setQueryData(cacheKey, (old = []) =>
        old.map((m) => (m._id === updated._id ? { ...m, ...updated } : m))
      );
    },
  });
};

/**
 * Delete message mutation
 */
export const useDeleteMessage = (teamId, activeConversation) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId) => {
      await api.delete(`/messages/${messageId}`);
      return messageId;
    },
    onSuccess: (deletedId) => {
      const isTeam = activeConversation?.type === 'TEAM';
      const cacheKey = isTeam
        ? messageKeys.team(teamId)
        : messageKeys.direct(teamId, activeConversation?.id);

      queryClient.setQueryData(cacheKey, (old = []) =>
        old.filter((m) => m._id !== deletedId)
      );
    },
  });
};

/**
 * Mark messages as read
 */
export const useMarkMessagesRead = (teamId) => {
  const clearUnread = useChatStore((s) => s.clearUnread);
  const queryClient = useQueryClient();

  return useCallback(
    async (senderId) => {
      if (!senderId || !teamId) return;

      // 1. Immediately clear unread badge in Zustand store
      clearUnread(senderId);

      // 2. Synchronously mark all messages from this sender as read in React Query cache
      const cacheKey = messageKeys.direct(teamId, senderId);
      queryClient.setQueryData(cacheKey, (old = []) => {
        if (!Array.isArray(old)) return old;
        return old.map((m) => {
          const sId = typeof m.senderId === 'object' ? m.senderId?._id : m.senderId;
          if (String(sId) === String(senderId)) {
            return { ...m, isRead: true };
          }
          return m;
        });
      });

      // 3. Emit immediate WebSocket notification to sender (0ms latency)
      if (socket && socket.connected) {
        socket.emit('mark_messages_read', { senderId, teamId });
      }

      // 4. Background DB update fallback
      try {
        await api.patch(`/messages/read-all/${senderId}`);
      } catch {
        // Silently fail background mark-read
      }
    },
    [clearUnread, teamId, queryClient]
  );
};

/**
 * Real-time Socket Event Synchronizer
 */
export const useChatSocket = (teamId) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const {
    activeConversation,
    incrementUnread,
    addTypingUser,
    removeTypingUser,
  } = useChatStore();

  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    if (!socket || !teamId || !currentUserId) return;

    const handleReceiveTeam = (data) => {
      if (data.teamId !== teamId) return;

      const cacheKey = messageKeys.team(teamId);
      queryClient.setQueryData(cacheKey, (old = []) => {
        // Reconcile optimistic message if tempId matches
        if (data.tempId && old.some((m) => m.tempId === data.tempId)) {
          return old.map((m) => (m.tempId === data.tempId ? { ...data, isSending: false } : m));
        }
        // Avoid duplicate
        if (old.some((m) => m._id === data._id)) return old;
        return [...old, data];
      });

      const senderIdStr = typeof data.senderId === 'object' ? data.senderId?._id : data.senderId;
      if (senderIdStr !== currentUserId) {
        if (window.location.pathname !== '/messages' || activeConversation?.type !== 'TEAM') {
          incrementUnread('team');
        }
      }
    };

    const handleReceivePrivate = (data) => {
      if (data.teamId !== teamId) return;

      const senderIdStr = typeof data.senderId === 'object' ? data.senderId?._id : data.senderId;
      const partnerId = senderIdStr === currentUserId ? data.receiverId : senderIdStr;
      const cacheKey = messageKeys.direct(teamId, partnerId);

      queryClient.setQueryData(cacheKey, (old = []) => {
        if (data.tempId && old.some((m) => m.tempId === data.tempId)) {
          return old.map((m) => (m.tempId === data.tempId ? { ...data, isSending: false } : m));
        }
        if (old.some((m) => m._id === data._id)) return old;
        return [...old, data];
      });

      if (senderIdStr !== currentUserId) {
        const isLookingAtChat =
          window.location.pathname === '/messages' &&
          activeConversation?.type === 'DM' &&
          String(activeConversation?.id) === String(partnerId);

        if (isLookingAtChat) {
          if (socket && socket.connected) {
            socket.emit('mark_messages_read', { senderId: partnerId, teamId });
          }
          api.patch(`/messages/read-all/${partnerId}`).catch(() => {});
        } else {
          incrementUnread(partnerId);
        }
      }
    };

    const handleMessagesRead = (data) => {
      // Reader has read messages sent by sender
      if (String(data.senderId) === String(currentUserId)) {
        const partnerId = data.readerId;
        const cacheKey = messageKeys.direct(teamId, partnerId);
        queryClient.setQueryData(cacheKey, (old = []) => {
          if (!Array.isArray(old)) return old;
          return old.map((m) => {
            const sId = typeof m.senderId === 'object' ? m.senderId?._id : m.senderId;
            if (String(sId) === String(currentUserId)) {
              return { ...m, isRead: true };
            }
            return m;
          });
        });
      }
    };

    const handleMessageUpdated = (data) => {
      const isTeam = !data.receiverId;
      const partnerId =
        data.senderId === currentUserId ? data.receiverId : data.senderId;
      const cacheKey = isTeam
        ? messageKeys.team(data.teamId || teamId)
        : messageKeys.direct(data.teamId || teamId, partnerId);

      queryClient.setQueryData(cacheKey, (old = []) =>
        old.map((m) => (m._id === data._id ? { ...m, ...data } : m))
      );
    };

    const handleMessageDeleted = (data) => {
      const isTeam = !data.receiverId;
      const partnerId =
        data.senderId === currentUserId ? data.receiverId : data.senderId;
      const cacheKey = isTeam
        ? messageKeys.team(data.teamId || teamId)
        : messageKeys.direct(data.teamId || teamId, partnerId);

      queryClient.setQueryData(cacheKey, (old = []) =>
        old.filter((m) => m._id !== data._id)
      );
    };

    const handleUserTyping = (data) => {
      addTypingUser(data.conversationId, {
        userId: data.userId,
        userName: data.userName,
      });
    };

    const handleUserStopTyping = (data) => {
      removeTypingUser(data.conversationId, data.userId);
    };

    socket.on('receive_team_message', handleReceiveTeam);
    socket.on('receive_private_message', handleReceivePrivate);
    socket.on('messages_read', handleMessagesRead);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('receive_team_message', handleReceiveTeam);
      socket.off('receive_private_message', handleReceivePrivate);
      socket.off('messages_read', handleMessagesRead);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [
    teamId,
    currentUserId,
    activeConversation,
    queryClient,
    incrementUnread,
    addTypingUser,
    removeTypingUser,
  ]);
};
