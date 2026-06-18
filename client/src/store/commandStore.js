import { create } from 'zustand';

export const useCommandStore = create((set) => ({
  isOpen: false,
  isCreateTicketOpen: false,
  openCommandPalette: () => set({ isOpen: true }),
  closeCommandPalette: () => set({ isOpen: false }),
  toggleCommandPalette: () => set((state) => ({ isOpen: !state.isOpen })),
  openCreateTicket: () => set({ isCreateTicketOpen: true, isOpen: false }),
  closeCreateTicket: () => set({ isCreateTicketOpen: false }),
}));

export default useCommandStore;
