import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { notificationKeys } from '../api/queryKeys';
import { socket } from '../api/socket';
import { toast } from 'sonner';

/**
 * ============================================================================
 * Pure Fetchers
 * ============================================================================
 */
export const fetchNotifications = async (signal) => {
  const response = await axiosInstance.get('/notifications', { signal });
  return response.data.data.notifications || [];
};

/**
 * ============================================================================
 * Query Hook
 * ============================================================================
 */
export const useNotifications = (options = {}) => {
  const query = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ signal }) => fetchNotifications(signal),
    staleTime: 1000 * 60 * 2, // 2 minutes fresh
    ...options,
  });

  const notifications = query.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    ...query,
    notifications,
    unreadCount,
  };
};

/**
 * ============================================================================
 * Mutation Hooks
 * ============================================================================
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await axiosInstance.patch(`/notifications/${id}/read`);
      return response.data.data.notification;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData(notificationKeys.list());

      if (previous) {
        queryClient.setQueryData(
          notificationKeys.list(),
          previous.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
      return { previous };
    },
    onError: (err, id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.patch('/notifications/read-all');
      return response.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.list() });
      const previous = queryClient.getQueryData(notificationKeys.list());

      if (previous) {
        queryClient.setQueryData(
          notificationKeys.list(),
          previous.map((n) => ({ ...n, isRead: true }))
        );
      }
      return { previous };
    },
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.list(), context.previous);
      }
      toast.error('Failed to mark all as read');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });
    },
  });
};

/**
 * ============================================================================
 * Real-Time Socket Listener Hook
 * ============================================================================
 */
export const useNotificationSocket = (onNavigate) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleNewNotification = (notification) => {
      if (!notification) return;

      // Optimistically prepend to notifications list in TanStack Query cache
      queryClient.setQueryData(notificationKeys.list(), (old = []) => {
        if (old.some((n) => n._id === notification._id)) return old;
        return [notification, ...old];
      });

      // Background refetch for guaranteed consistency
      queryClient.invalidateQueries({ queryKey: notificationKeys.list() });

      // Clean Sonner toast alert with direct deep-link action
      toast(notification.message || 'New notification', {
        description: notification.senderId?.name ? `From ${notification.senderId.name}` : 'NEXUS Workspace Event',
        action: {
          label: 'View',
          onClick: () => {
            if (onNavigate) {
              if (notification.type === 'TEAM_INVITE') {
                onNavigate('/team');
              } else if (notification.resourceId) {
                onNavigate(`/dashboard/ticket/${notification.resourceId}`);
              }
            } else {
              if (notification.type === 'TEAM_INVITE') {
                window.location.href = '/team';
              } else if (notification.resourceId) {
                window.location.href = `/dashboard/ticket/${notification.resourceId}`;
              }
            }
          },
        },
        duration: 5000,
      });
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [queryClient, onNavigate]);
};
