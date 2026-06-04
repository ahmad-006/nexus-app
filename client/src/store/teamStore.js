import { create } from 'zustand';
import axiosInstance from '../api/axios';

const useTeamStore = create((set, get) => ({
  myTeams: [],
  activeTeamId: null,
  activeTeam: null,
  isLoading: false,
  error: null,

  fetchMyTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.get('/users/me/teams'); 
      const teams = response.data.data.teams || []; 

      // If user has teams, set the first one as active by default if none is active
      const currentActiveId = get().activeTeamId;
      const activeIdToSet = currentActiveId || (teams.length > 0 ? teams[0]._id : null);

      set({ 
        myTeams: teams, 
        activeTeamId: activeIdToSet,
        activeTeam: teams.find(t => t._id === activeIdToSet) || null,
        isLoading: false 
      });
    } catch (error) {
      console.error("Failed to fetch teams", error);
      set({ error: error.response?.data?.message || 'Failed to fetch teams', isLoading: false });
    }
  },

  setActiveTeam: (teamId) => {
    const teams = get().myTeams;
    const team = teams.find(t => t._id === teamId);
    if (team) {
      set({ activeTeamId: teamId, activeTeam: team });
    }
  },
}));

export default useTeamStore;
