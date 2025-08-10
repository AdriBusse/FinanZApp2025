import { storage } from './storage';

const KEYS = {
  expensesShowArchived: 'ui:expenses_show_archived',
} as const;

export const preferences = {
  async getShowArchivedExpenses(): Promise<boolean> {
    return storage.getBoolean(KEYS.expensesShowArchived, false);
  },
  async setShowArchivedExpenses(value: boolean): Promise<void> {
    await storage.setBoolean(KEYS.expensesShowArchived, value);
  },
};
