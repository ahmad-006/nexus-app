import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../api/axios';
import { socket } from '../api/socket';
import { messageKeys } from '../api/queryKeys';
import useChatStore from '../store/chatStore';
import useAuthStore from '../store/authStore';
import { playNotificationBeep } from '../utils/sound';

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
 * Fetch latest message summaries for all conversations in active workspace
 */
export const useConversationSummaries = (teamId) => {
  return useQuery({
    queryKey: messageKeys.conversations(teamId),
    queryFn: async () => {
      const res = await api.get(`/messages/${teamId}/conversations`);
      return res.data?.data?.conversations || {};
    },
    enabled: !!teamId,
    staleTime: 1000 * 30,
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
      const targetId = isTeam ? null : String(activeConversation.id);
      const cacheKey = isTeam
        ? messageKeys.team(teamId)
        : messageKeys.direct(teamId, targetId);

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
        receiverId: targetId,
        createdAt: new Date().toISOString(),
        isSending: true,
        isRead: false,
      };

      // Optimistically append to message thread cache
      queryClient.setQueryData(cacheKey, (old = []) => [...old, optimisticMessage]);

      // Optimistically update conversation summaries snippet
      queryClient.setQueryData(messageKeys.conversations(teamId), (old = {}) => ({
        ...old,
        [isTeam ? 'team' : targetId]: {
          lastMessage: trimmed,
          lastMessageSenderId: user?._id || user?.id,
          lastMessageTime: new Date().toISOString(),
          isRead: false,
        },
      }));

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
      toast.success('Message deleted');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete message');
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
export const useChatSocket = (teamId, navigate) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const {
    activeConversation,
    setActiveConversation,
    incrementUnread,
    addTypingUser,
    removeTypingUser,
    setOnlineUsers,
    setUserPresence,
  } = useChatStore();

  const currentUserId = user?._id || user?.id;

  const activeConvRef = useRef(activeConversation);
  useEffect(() => {
    activeConvRef.current = activeConversation;
  }, [activeConversation]);

  const navigateRef = useRef(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    if (!socket || !teamId || !currentUserId) return;

    const handleReceiveTeam = (data) => {
      if (data.teamId !== teamId) return;

      const senderIdStr = String(typeof data.senderId === 'object' ? data.senderId?._id : data.senderId);
      const cacheKey = messageKeys.team(teamId);

      queryClient.setQueryData(cacheKey, (old = []) => {
        if (!Array.isArray(old)) return [data];

        // 1. Reconcile optimistic message by tempId
        if (data.tempId && old.some((m) => m.tempId === data.tempId || m._id === data.tempId)) {
          return old.map((m) =>
            m.tempId === data.tempId || m._id === data.tempId
              ? { ...data, isSending: false }
              : m
          );
        }

        // 2. Prevent duplicate by real database _id
        if (old.some((m) => String(m._id) === String(data._id))) return old;

        // 3. Fallback optimistic match by message text & sender
        const optIdx = old.findIndex(
          (m) =>
            m.isSending &&
            m.message === data.message &&
            String(typeof m.senderId === 'object' ? m.senderId?._id : m.senderId) === senderIdStr
        );
        if (optIdx !== -1) {
          const next = [...old];
          next[optIdx] = { ...data, isSending: false };
          return next;
        }

        return [...old, data];
      });

      // Real-time update to conversation summaries cache
      queryClient.setQueryData(messageKeys.conversations(teamId), (old = {}) => ({
        ...old,
        team: {
          lastMessage: data.message,
          lastMessageSenderId: senderIdStr,
          lastMessageTime: data.createdAt || data.timestamp,
        },
      }));

      if (senderIdStr !== String(currentUserId)) {
        const isLookingAtTeamChat =
          window.location.pathname === '/messages' &&
          activeConvRef.current?.type === 'TEAM' &&
          !document.hidden;

        if (!isLookingAtTeamChat) {
          incrementUnread('team');
          playNotificationBeep();
          const senderName = data.senderName || data.senderId?.name || 'Teammate';
          toast(`💬 ${senderName} in #team`, {
            description: data.message,
            action: {
              label: 'Reply',
              onClick: () => {
                setActiveConversation({
                  type: 'TEAM',
                  id: 'team',
                  name: 'Team Group',
                });
                if (navigateRef.current) {
                  navigateRef.current('/messages');
                } else {
                  window.location.href = '/messages';
                }
              },
            },
            duration: 5000,
          });
        }
      }
    };

    const handleReceivePrivate = (data) => {
      if (data.teamId !== teamId) return;

      const senderIdStr = String(typeof data.senderId === 'object' ? data.senderId?._id : data.senderId);
      const currentIdStr = String(currentUserId);
      const isOwnMessage = senderIdStr === currentIdStr;
      const partnerId = isOwnMessage ? String(data.receiverId) : senderIdStr;
      const cacheKey = messageKeys.direct(teamId, partnerId);

      queryClient.setQueryData(cacheKey, (old = []) => {
        if (!Array.isArray(old)) return [data];

        // 1. Reconcile optimistic message by tempId
        if (data.tempId && old.some((m) => m.tempId === data.tempId || m._id === data.tempId)) {
          return old.map((m) =>
            m.tempId === data.tempId || m._id === data.tempId
              ? { ...data, isSending: false }
              : m
          );
        }

        // 2. Prevent duplicate by real database _id
        if (old.some((m) => String(m._id) === String(data._id))) return old;

        // 3. Fallback optimistic match by message text & sender
        const optIdx = old.findIndex(
          (m) =>
            m.isSending &&
            m.message === data.message &&
            String(typeof m.senderId === 'object' ? m.senderId?._id : m.senderId) === senderIdStr
        );
        if (optIdx !== -1) {
          const next = [...old];
          next[optIdx] = { ...data, isSending: false };
          return next;
        }

        return [...old, data];
      });

      // Real-time update to conversation summaries cache
      queryClient.setQueryData(messageKeys.conversations(teamId), (old = {}) => ({
        ...old,
        [partnerId]: {
          lastMessage: data.message,
          lastMessageSenderId: senderIdStr,
          lastMessageTime: data.createdAt || data.timestamp,
          isRead: data.isRead,
        },
      }));

      if (senderIdStr !== currentIdStr) {
        const isLookingAtChat =
          window.location.pathname === '/messages' &&
          activeConvRef.current?.type === 'DM' &&
          String(activeConvRef.current?.id) === String(partnerId) &&
          !document.hidden;

        if (isLookingAtChat) {
          if (socket && socket.connected) {
            socket.emit('mark_messages_read', { senderId: partnerId, teamId });
          }
          api.patch(`/messages/read-all/${partnerId}`).catch(() => {});
        } else {
          incrementUnread(partnerId);
          playNotificationBeep();
          const senderName = data.senderName || data.senderId?.name || 'Direct Message';
          toast(`💬 Message from ${senderName}`, {
            description: data.message,
            action: {
              label: 'Reply',
              onClick: () => {
                setActiveConversation({
                  type: 'DM',
                  id: partnerId,
                  name: senderName,
                });
                if (navigateRef.current) {
                  navigateRef.current('/messages');
                } else {
                  window.location.href = '/messages';
                }
              },
            },
            duration: 5000,
          });
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

    const handleOnlineUsersList = (data) => {
      if (data?.onlineUserIds) {
        setOnlineUsers(data.onlineUserIds);
      }
    };

    const handleUserPresenceChanged = (data) => {
      if (data?.userId && data?.status) {
        setUserPresence(data.userId, data.status, data.lastSeen);
      }
    };

    // Query active presence immediately and on reconnect
    if (socket.connected) {
      socket.emit('get_online_users');
    }
    const handleReconnect = () => {
      socket.emit('get_online_users');
    };
    socket.on('connect', handleReconnect);

    socket.on('receive_team_message', handleReceiveTeam);
    socket.on('receive_private_message', handleReceivePrivate);
    socket.on('messages_read', handleMessagesRead);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);
    socket.on('online_users_list', handleOnlineUsersList);
    socket.on('user_presence_changed', handleUserPresenceChanged);

    return () => {
      socket.off('connect', handleReconnect);
      socket.off('receive_team_message', handleReceiveTeam);
      socket.off('receive_private_message', handleReceivePrivate);
      socket.off('messages_read', handleMessagesRead);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('online_users_list', handleOnlineUsersList);
      socket.off('user_presence_changed', handleUserPresenceChanged);
    };
  }, [
    teamId,
    currentUserId,
    queryClient,
    incrementUnread,
    addTypingUser,
    removeTypingUser,
    setOnlineUsers,
    setUserPresence,
    setActiveConversation,
  ]);
};
