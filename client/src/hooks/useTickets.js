import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { toast } from 'sonner';
import useAuthStore from '../store/authStore';
import { ticketKeys } from '../api/queryKeys';
export { ticketKeys };

/**
 * ============================================================================
 * Pure API Fetcher Functions
 * Decoupled from React hooks to enable:
 * 1. Intent-driven prefetching on hover outside components.
 * 2. Independent unit testability without mocking React lifecycle.
 * 3. Consistent propagation of AbortSignal to cancel network calls.
 * ============================================================================
 */

export const fetchTeamTickets = async (teamId, signal) => {
  const response = await axiosInstance.get(`/tickets/team/${teamId}`, { signal });
  return response.data.data.tickets || [];
};

export const fetchTicketDetail = async (ticketId, signal) => {
  const response = await axiosInstance.get(`/tickets/${ticketId}`, { signal });
  return response.data.data.ticket;
};

export const fetchTicketComments = async (ticketId, signal) => {
  const response = await axiosInstance.get(`/tickets/${ticketId}/comments`, { signal });
  return response.data.data.comments || [];
};

export const fetchMyTickets = async (signal) => {
  const response = await axiosInstance.get('/users/me/tickets', { signal });
  return response.data.data.tickets || [];
};

/**
 * ============================================================================
 * Query Hooks
 * ============================================================================
 */

/**
 * Fetch all tickets for a specific team.
 * Cached under ticketKeys.list(teamId).
 */
export const useTeamTickets = (teamId) => {
  return useQuery({
    queryKey: ticketKeys.list(teamId),
    queryFn: ({ signal }) => fetchTeamTickets(teamId, signal),
    enabled: !!teamId,
  });
};

/**
 * Fetch a single ticket's full details.
 * Cached under ticketKeys.detail(ticketId).
 * Uses placeholderData to provide instant zero-skeleton UI while allowing
 * TanStack Query to fetch the full canonical record in the background.
 */
export const useTicketDetail = (ticketId, teamId) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ticketKeys.detail(ticketId),
    queryFn: ({ signal }) => fetchTicketDetail(ticketId, signal),
    enabled: !!ticketId,
    placeholderData: () => {
      if (!teamId) return undefined;
      const teamTickets = queryClient.getQueryData(ticketKeys.list(teamId));
      return teamTickets?.find((t) => t._id === ticketId);
    },
  });
};

/**
 * Fetch all comments for a specific ticket.
 * Cached under ticketKeys.comments(ticketId).
 */
export const useTicketComments = (ticketId) => {
  return useQuery({
    queryKey: ticketKeys.comments(ticketId),
    queryFn: ({ signal }) => fetchTicketComments(ticketId, signal),
    enabled: !!ticketId,
  });
};

/**
 * Fetch all tickets related to the currently authenticated user (assigned or reported) across all teams.
 * Memoizes client-side filtering and groups tickets cleanly by team using TanStack Query's `select`.
 */
export const useMyUserTickets = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ticketKeys.myTickets(),
    queryFn: ({ signal }) => fetchMyTickets(signal),
    enabled: !!user?._id,
    select: (tickets = []) => {
      const currentUserId = user?._id;

      // Grouping helper function
      const groupByTeam = (ticketList) => {
        const groupedMap = new Map();
        ticketList.forEach((ticket) => {
          const teamObj = ticket.teamId;
          const teamId = teamObj?._id || 'unknown';
          const teamName = teamObj?.name || 'General Workspace';

          if (!groupedMap.has(teamId)) {
            groupedMap.set(teamId, {
              teamId,
              teamName,
              tickets: [],
            });
          }
          groupedMap.get(teamId).tickets.push(ticket);
        });
        return Array.from(groupedMap.values());
      };

      // 1. Assigned to me
      const assignedTickets = tickets.filter((t) => {
        const assigneeId = typeof t.assigneeId === 'object' ? t.assigneeId?._id : t.assigneeId;
        return assigneeId === currentUserId;
      });

      // 2. Reported / created by me
      const reportedTickets = tickets.filter((t) => {
        const reporterId = typeof t.reporterId === 'object' ? t.reporterId?._id : t.reporterId;
        return reporterId === currentUserId;
      });

      return {
        allTickets: tickets,
        assignedTickets,
        reportedTickets,
        assignedTeamsGrouped: groupByTeam(assignedTickets),
        reportedTeamsGrouped: groupByTeam(reportedTickets),
        assignedCount: assignedTickets.length,
        reportedCount: reportedTickets.length,
        totalCount: tickets.length,
      };
    },
  });
};

// Backwards-compatible alias so existing callers don't break
export const useMyAssignedTickets = useMyUserTickets;

/**
 * ============================================================================
 * Mutation Hooks
 * ============================================================================
 */

/**
 * Optimistic mutation for Drag-and-Drop ticket reordering.
 * Cancels in-flight background refetches, snapshots pre-drag state for rollback,
 * and synchronizes both board cache and individual ticket cache.
 */
export const useReorderTicket = (teamId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ draggableId, newStatus, newPosition }) => {
      const response = await axiosInstance.patch(`/tickets/${draggableId}/reorder`, {
        status: newStatus,
        position: newPosition,
      });
      return response.data;
    },
    onMutate: async ({ draggableId, newStatus, newPosition }) => {
      // 1. Cancel in-flight queries so background refetches don't overwrite optimistic state
      await queryClient.cancelQueries({ queryKey: ticketKeys.list(teamId) });

      // 2. Snapshot current cache for rollback
      const previousTickets = queryClient.getQueryData(ticketKeys.list(teamId)) || [];

      // 3. Optimistically update cache with new position and status
      queryClient.setQueryData(ticketKeys.list(teamId), (oldTickets = []) => {
        return oldTickets.map((t) => {
          if (t._id === draggableId) {
            return { ...t, status: newStatus, position: newPosition };
          }
          return t;
        });
      });

      // Also update single ticket detail cache if present
      queryClient.setQueryData(ticketKeys.detail(draggableId), (oldTicket) => {
        if (!oldTicket) return oldTicket;
        return { ...oldTicket, status: newStatus, position: newPosition };
      });

      return { previousTickets };
    },
    onError: (err, variables, context) => {
      // Rollback to snapshot on error
      if (context?.previousTickets) {
        queryClient.setQueryData(ticketKeys.list(teamId), context.previousTickets);
      }
      toast.error(err.response?.data?.message || 'Failed to reorder ticket');
    },
    onSettled: () => {
      // Background refetch to ensure canonical position precision
      queryClient.invalidateQueries({ queryKey: ticketKeys.list(teamId) });
    },
  });
};

/**
 * Mutation to create a new ticket and optionally upload attachments.
 * Appends new ticket to the team's ticket list cache.
 */
export const useCreateTicket = (teamId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const { files, ...ticketData } = formData;
      const response = await axiosInstance.post(`/tickets/team/${teamId}`, ticketData);
      let newTicket = response.data.data.ticket;

      // Handle attachments if any were selected in the modal
      if (files && files.length > 0) {
        const fileFormData = new FormData();
        files.forEach((f) => fileFormData.append('files', f));
        const attachRes = await axiosInstance.post(
          `/tickets/${newTicket._id}/attachments`,
          fileFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (attachRes.data?.data?.attachments) {
          newTicket = { ...newTicket, attachments: attachRes.data.data.attachments };
        }
      }

      return newTicket;
    },
    onSuccess: (newTicket) => {
      queryClient.setQueryData(ticketKeys.list(teamId), (oldTickets = []) => [
        ...oldTickets,
        newTicket,
      ]);
      toast.success('Task created successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create task');
    },
  });
};

/**
 * Mutation to update ticket fields (title, description, priority, status).
 * Synchronously syncs both ticketKeys.detail(ticketId) AND ticketKeys.list(teamId).
 */
export const useUpdateTicket = (ticketId, teamId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updateData) => {
      if (updateData.status) {
        const res = await axiosInstance.patch(`/tickets/${ticketId}/status`, {
          status: updateData.status,
        });
        return res.data.data.ticket;
      }
      const res = await axiosInstance.patch(`/tickets/${ticketId}`, updateData);
      return res.data.data.ticket;
    },
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({ queryKey: ticketKeys.detail(ticketId) });
      if (teamId) {
        await queryClient.cancelQueries({ queryKey: ticketKeys.list(teamId) });
      }

      const prevTicket = queryClient.getQueryData(ticketKeys.detail(ticketId));
      const prevTickets = teamId ? queryClient.getQueryData(ticketKeys.list(teamId)) : undefined;

      // Optimistically update single ticket
      queryClient.setQueryData(ticketKeys.detail(ticketId), (old) => {
        if (!old) return old;
        return { ...old, ...updateData };
      });

      // Optimistically update board card
      if (teamId) {
        queryClient.setQueryData(ticketKeys.list(teamId), (oldTickets = []) => {
          return oldTickets.map((t) => {
            if (t._id === ticketId) {
              return { ...t, ...updateData };
            }
            return t;
          });
        });
      }

      return { prevTicket, prevTickets };
    },
    onError: (err, updateData, context) => {
      if (context?.prevTicket) {
        queryClient.setQueryData(ticketKeys.detail(ticketId), context.prevTicket);
      }
      if (context?.prevTickets && teamId) {
        queryClient.setQueryData(ticketKeys.list(teamId), context.prevTickets);
      }
      toast.error(err.response?.data?.message || 'Failed to update ticket');
    },
    onSuccess: () => {
      toast.success('Ticket updated');
    },
  });
};

/**
 * Mutation to delete a ticket.
 * Removes the ticket from ticketKeys.list(teamId) and clears ticketKeys.detail(ticketId).
 */
export const useDeleteTicket = (ticketId, teamId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/tickets/${ticketId}`);
    },
    onSuccess: () => {
      if (teamId) {
        queryClient.setQueryData(ticketKeys.list(teamId), (oldTickets = []) =>
          oldTickets.filter((t) => t._id !== ticketId)
        );
      }
      queryClient.removeQueries({ queryKey: ticketKeys.detail(ticketId) });
      toast.success('Ticket deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete ticket');
    },
  });
};

/**
 * Mutation to post a new comment or reply.
 * Synchronizes ticketKeys.comments(ticketId) and increments commentCount in detail and board cache.
 */
export const useAddComment = (ticketId, teamId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ text, parentId }) => {
      const payload = parentId ? { text, commentId: parentId } : { text };
      const response = await axiosInstance.post(`/tickets/${ticketId}/comments`, payload);
      return response.data.data.comment;
    },
    onSuccess: (newComment, variables) => {
      queryClient.setQueryData(ticketKeys.comments(ticketId), (oldComments = []) => {
        if (oldComments.some((c) => c._id === newComment._id)) return oldComments;
        if (!variables.parentId) {
          return [newComment, ...oldComments];
        }
        return oldComments.map((c) => {
          if (c._id === variables.parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), newComment],
              replyCount: (c.replyCount || 0) + 1,
            };
          }
          return c;
        });
      });

      // Synchronize comment count in single ticket and board cache
      queryClient.setQueryData(ticketKeys.detail(ticketId), (prev) => {
        if (!prev) return prev;
        return { ...prev, commentCount: (prev.commentCount || 0) + 1 };
      });
      if (teamId) {
        queryClient.setQueryData(ticketKeys.list(teamId), (oldTickets = []) =>
          oldTickets.map((t) =>
            t._id === ticketId ? { ...t, commentCount: (t.commentCount || 0) + 1 } : t
          )
        );
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    },
  });
};

/**
 * Mutation to delete a comment or reply.
 * Synchronizes ticketKeys.comments(ticketId) and decrements commentCount.
 */
export const useDeleteComment = (ticketId, teamId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      await axiosInstance.delete(`/comments/${commentId}`);
      return commentId;
    },
    onSuccess: (deletedId) => {
      let wasDeleted = false;
      queryClient.setQueryData(ticketKeys.comments(ticketId), (oldComments = []) => {
        const filtered = oldComments.filter((c) => {
          if (c._id === deletedId) {
            wasDeleted = true;
            return false;
          }
          return true;
        });
        if (wasDeleted) return filtered;

        return oldComments.map((c) => {
          if (c.replies?.some((r) => r._id === deletedId)) {
            wasDeleted = true;
            return {
              ...c,
              replies: c.replies.filter((r) => r._id !== deletedId),
              replyCount: Math.max(0, (c.replyCount || 1) - 1),
            };
          }
          return c;
        });
      });

      if (wasDeleted) {
        queryClient.setQueryData(ticketKeys.detail(ticketId), (prev) => {
          if (!prev) return prev;
          return { ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) };
        });
        if (teamId) {
          queryClient.setQueryData(ticketKeys.list(teamId), (oldTickets = []) =>
            oldTickets.map((t) =>
              t._id === ticketId ? { ...t, commentCount: Math.max(0, (t.commentCount || 1) - 1) } : t
            )
          );
        }
      }
    },
    onError: () => {
      toast.error('Failed to delete comment');
    },
  });
};
