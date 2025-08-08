import create from 'zustand';

interface SavingsUIState {
  isSpeedDialOpen: boolean;
  isCreateDepotModalOpen: boolean;
  openSpeedDial: () => void;
  closeSpeedDial: () => void;
  toggleSpeedDial: () => void;
  openCreateDepotModal: () => void;
  closeCreateDepotModal: () => void;
}

export const useSavingsUIStore = create<SavingsUIState>((set) => ({
  isSpeedDialOpen: false,
  isCreateDepotModalOpen: false,
  openSpeedDial: () => set({ isSpeedDialOpen: true }),
  closeSpeedDial: () => set({ isSpeedDialOpen: false }),
  toggleSpeedDial: () => set((s) => ({ isSpeedDialOpen: !s.isSpeedDialOpen })),
  openCreateDepotModal: () => set({ isCreateDepotModalOpen: true }),
  closeCreateDepotModal: () => set({ isCreateDepotModalOpen: false, isSpeedDialOpen: false }),
}));
