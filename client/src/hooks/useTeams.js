import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { teamKeys } from '../api/queryKeys';
import useTeamStore from '../store/teamStore';

/**
 * Pure fetcher for user's teams with AbortSignal support.
 */
export const fetchMyTeams = async (signal) => {
  const response = await axiosInstance.get('/users/me/teams', { signal });
  return response.data.data.teams || [];
};

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
