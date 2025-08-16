import { storage, userStorage } from './storage';

const KEYS = {
  expensesShowArchived: 'ui:expenses_show_archived',
  createExpenseSelectedTemplates: 'ui:create_expense_selected_templates',
  txAutoCategorizeDefault: 'ui:tx_auto_categorize_default',
  dashboardLayout: 'ui:dashboard_layout',
} as const;

export const preferences = {
  async getShowArchivedExpenses(): Promise<boolean> {
    return storage.getBoolean(KEYS.expensesShowArchived, false);
  },
  async setShowArchivedExpenses(value: boolean): Promise<void> {
    await storage.setBoolean(KEYS.expensesShowArchived, value);
  },
  async getSelectedExpenseTemplateIds(): Promise<string[] | null> {
    return storage.getJSON<string[]>(KEYS.createExpenseSelectedTemplates, null);
  },
  async setSelectedExpenseTemplateIds(ids: string[]): Promise<void> {
    await storage.setJSON(KEYS.createExpenseSelectedTemplates, ids);
  },

  async getTxAutoCategorizeDefault(): Promise<boolean> {
    return storage.getBoolean(KEYS.txAutoCategorizeDefault, false);
  },
  async setTxAutoCategorizeDefault(value: boolean): Promise<void> {
    await storage.setBoolean(KEYS.txAutoCategorizeDefault, value);
  },

  // Dashboard layout persistence
  async getDashboardLayout(): Promise<any[] | null> {
    // userScoped only; do not fallback to legacy global to avoid cross-account leakage
    return userStorage.getJSON<any[]>(KEYS.dashboardLayout, []);
  },
  async setDashboardLayout(layout: any[]): Promise<void> {
    await userStorage.setJSON(KEYS.dashboardLayout, layout);
  },
  async clearDashboardLayout(): Promise<void> {
    await userStorage.remove(KEYS.dashboardLayout);
  },
};
