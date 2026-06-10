import { create } from 'zustand';

/**
 * Client-Only UI/Session Store for Team Selection.
 * 
 * Server state (the actual list of teams) is owned and cached by TanStack Query in `useTeams.js`.
 * This store strictly retains the user's client selection (activeTeamId) and fast references.
 */
const useTeamStore = create((set, get) => ({
  myTeams: [],
  activeTeamId: null,
  activeTeam: null,
  isLoading: false,
  error: null,

  setActiveTeamId: (teamId) => {
    const teams = get().myTeams;
    const team = teams.find((t) => t._id === teamId) || null;
    set({ activeTeamId: teamId, activeTeam: team });
  },

  setActiveTeam: (teamId) => {
    get().setActiveTeamId(teamId);
  },

  syncTeams: (teams) => {
    const currentActiveId = get().activeTeamId;
    const activeIdToSet =
      currentActiveId && teams.some((t) => t._id === currentActiveId)
        ? currentActiveId
        : teams.length > 0
        ? teams[0]._id
        : null;

    set({
      myTeams: teams,
      activeTeamId: activeIdToSet,
      activeTeam: teams.find((t) => t._id === activeIdToSet) || null,
      isLoading: false,
    });
  },

  // Backwards compatibility shim for legacy callers
  fetchMyTeams: async () => {},
}));

export default useTeamStore;
