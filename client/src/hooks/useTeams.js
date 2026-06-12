import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { teamKeys, userKeys } from '../api/queryKeys';
import useTeamStore from '../store/teamStore';
import { toast } from 'sonner';

/**
 * ============================================================================
 * Pure Fetchers (with AbortSignal support)
 * ============================================================================
 */

export const fetchMyTeams = async (signal) => {
  const response = await axiosInstance.get('/users/me/teams', { signal });
  return response.data.data.teams || [];
};

export const fetchTeamDetails = async (teamId, signal) => {
  const response = await axiosInstance.get(`/teams/${teamId}`, { signal });
  return response.data.data.team || null;
};

export const fetchMyInvites = async (signal) => {
  const response = await axiosInstance.get('/teams/invites/me', { signal });
  return response.data.data.invites || [];
};

export const fetchAllUsers = async (signal) => {
  const response = await axiosInstance.get('/users', { signal });
  return response.data.data.users || [];
};

export const fetchTeamActivities = async (teamId, signal) => {
  const response = await axiosInstance.get(`/activities/${teamId}`, { signal });
  return response.data.data.activities || [];
};

/**
 * ============================================================================
 * Query Hooks
 * ============================================================================
 */

/**
 * TanStack Query hook managing server state for user's teams.
 * Synchronizes active team selection with Zustand client store.
 */
export const useMyTeams = (options = {}) => {
  const { activeTeamId, setActiveTeamId, syncTeams } = useTeamStore();

  const query = useQuery({
    queryKey: teamKeys.lists(),
    queryFn: ({ signal }) => fetchMyTeams(signal),
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
    ...options,
  });

  const rawTeams = query.data;

  // Automatically synchronize active team selection into client store
  useEffect(() => {
    if (rawTeams && rawTeams.length > 0) {
      syncTeams(rawTeams);
      if (!activeTeamId || !rawTeams.some((t) => t._id === activeTeamId)) {
        setActiveTeamId(rawTeams[0]._id);
      }
    }
  }, [rawTeams, activeTeamId, setActiveTeamId, syncTeams]);

  const teams = rawTeams || [];
  const activeTeam = teams.find((t) => t._id === activeTeamId) || (teams.length > 0 ? teams[0] : null);

  return {
    ...query,
    teams,
    activeTeam,
    activeTeamId,
  };
};

/**
 * Fetches single team metadata populated with member details (avatars, emails, roles).
 */
export const useTeamDetails = (teamId) => {
  const isValidId = Boolean(teamId && /^[0-9a-fA-F]{24}$/.test(teamId));

  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: ({ signal }) => fetchTeamDetails(teamId, signal),
    enabled: isValidId,
    staleTime: 1000 * 60 * 2, // 2 minutes fresh
  });
};

/**
 * Fetches pending team invites sent to the currently authenticated user.
 */
export const useMyInvites = () => {
  return useQuery({
    queryKey: teamKeys.invites(),
    queryFn: ({ signal }) => fetchMyInvites(signal),
    staleTime: 1000 * 60 * 1, // 1 minute fresh
  });
};

/**
 * Fetches all registered users for autocomplete invitation searches.
 */
export const useAllUsers = () => {
  return useQuery({
    queryKey: userKeys.list(),
    queryFn: ({ signal }) => fetchAllUsers(signal),
    staleTime: 1000 * 60 * 10, // 10 minutes fresh
  });
};

/**
 * Fetches audit log activities for a specific team (Admin only).
 */
export const useTeamActivities = (teamId) => {
  return useQuery({
    queryKey: teamKeys.activities(teamId),
    queryFn: ({ signal }) => fetchTeamActivities(teamId, signal),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 2,
  });
};

/**
 * ============================================================================
 * Mutation Hooks
 * ============================================================================
 */

/**
 * Mutation to create a new team workspace.
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  const { setActiveTeamId } = useTeamStore();

  return useMutation({
    mutationFn: async ({ name }) => {
      const response = await axiosInstance.post('/teams', { name });
      return response.data.data.team;
    },
    onSuccess: (newTeam) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      if (newTeam?._id) {
        setActiveTeamId(newTeam._id);
      }
      toast.success(`Team "${newTeam.name}" created successfully`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create team');
    },
  });
};

/**
 * Mutation to invite an operative to the team via their exact email (or userId).
 */
export const useAddTeamMember = (teamId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, userId }) => {
      const payload = email ? { email } : { userId };
      const response = await axiosInstance.post(`/teams/${teamId}/members`, payload);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      toast.success(data?.message || 'Invitation email sent successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    },
  });
};

/**
 * Mutation to elevate a member to team Admin.
 */
export const usePromoteMember = (teamId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await axiosInstance.patch(`/teams/${teamId}/members/${userId}`);
      return response.data.data.updatedTeam;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.detail(teamId) });
      const previousTeam = queryClient.getQueryData(teamKeys.detail(teamId));

      if (previousTeam) {
        queryClient.setQueryData(teamKeys.detail(teamId), {
          ...previousTeam,
          members: previousTeam.members.map((m) =>
            (m.userId?._id || m.userId)?.toString() === userId?.toString()
              ? { ...m, role: 'admin' }
              : m
          ),
        });
      }
      return { previousTeam };
    },
    onError: (err, variables, context) => {
      if (context?.previousTeam) {
        queryClient.setQueryData(teamKeys.detail(teamId), context.previousTeam);
      }
      toast.error(err.response?.data?.message || 'Failed to promote member');
    },
    onSuccess: (updatedTeam) => {
      if (updatedTeam) {
        queryClient.setQueryData(teamKeys.detail(teamId), updatedTeam);
      }
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.activities(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      toast.success('Member promoted to Admin');
    },
  });
};

/**
 * Mutation to remove a member from the team.
 */
export const useRemoveMember = (teamId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      const response = await axiosInstance.delete(`/teams/${teamId}/members/${userId}`);
      return response.data.data.updatedTeam;
    },
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: teamKeys.detail(teamId) });
      const previousTeam = queryClient.getQueryData(teamKeys.detail(teamId));

      if (previousTeam) {
        queryClient.setQueryData(teamKeys.detail(teamId), {
          ...previousTeam,
          members: previousTeam.members.filter(
            (m) => (m.userId?._id || m.userId)?.toString() !== userId?.toString()
          ),
        });
      }
      return { previousTeam };
    },
    onError: (err, variables, context) => {
      if (context?.previousTeam) {
        queryClient.setQueryData(teamKeys.detail(teamId), context.previousTeam);
      }
      toast.error(err.response?.data?.message || 'Failed to remove member');
    },
    onSuccess: (updatedTeam) => {
      if (updatedTeam) {
        queryClient.setQueryData(teamKeys.detail(teamId), updatedTeam);
      }
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.activities(teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      toast.success('Member removed from team');
    },
  });
};

/**
 * Mutation to accept a team invitation using the JWT token.
 */
export const useAcceptInvite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token) => {
      const response = await axiosInstance.patch(`/teams/accept-invite/members/${token}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.invites() });
      toast.success('Team joined successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
    },
  });
};

/**
 * Mutation to delete an entire workspace team (Owner only).
 */
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();
  const { setActiveTeamId } = useTeamStore();

  return useMutation({
    mutationFn: async (teamId) => {
      await axiosInstance.delete(`/teams/${teamId}`);
      return teamId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      setActiveTeamId(null);
      toast.success('Team deleted successfully');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete team');
    },
  });
};
