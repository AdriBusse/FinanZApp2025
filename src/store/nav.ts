import create from 'zustand';

export type ScreenName = 'Dashboard' | 'SavingsList' | 'SavingTransactions';

export type ScreenParams =
  | { screen: 'Dashboard'; params?: undefined }
  | { screen: 'SavingsList'; params?: undefined }
  | { screen: 'SavingTransactions'; params: { depotId: string } };

interface NavState {
  current: ScreenParams;
  stack: ScreenParams[];
  navigate: (screen: ScreenParams) => void;
  goBack: () => void;
  resetTo: (screen: ScreenParams) => void;
}

export const useNavStore = create<NavState>((set, _get) => ({
  current: { screen: 'Dashboard' },
  stack: [],
  navigate: screen =>
    set(s => ({ stack: [...s.stack, s.current], current: screen })),
  goBack: () =>
    set(s => {
      const prev = s.stack[s.stack.length - 1];
      if (!prev) return s;
      const nextStack = s.stack.slice(0, -1);
      return { current: prev, stack: nextStack };
    }),
  resetTo: screen => set({ current: screen, stack: [] }),
}));
