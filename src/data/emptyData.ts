import { defaultCategories } from './mockData';
import type { FinanceData, Settings } from '../types/finance';

export const defaultSettings: Settings = {
  userName: 'Usuário',
  currency: 'BRL',
  initialBalance: 0,
  monthlyIncome: 0,
  monthlySpendingLimit: 0,
  recommendedDailyLimit: 0,
  financialMonthStartDay: 1,
  theme: 'light',
};

export function createEmptyFinanceData(userName = 'Usuário'): FinanceData {
  return {
    settings: {
      ...defaultSettings,
      userName,
    },
    accounts: [],
    categories: defaultCategories,
    transactions: [],
    dailyExpenses: [],
    incomes: [],
    expenses: [],
    creditCards: [],
    cardPurchases: [],
    invoices: [],
    debts: [],
  };
}

export function normalizeFinanceData(data: Partial<FinanceData> | null | undefined, userName = 'Usuário'): FinanceData {
  const emptyData = createEmptyFinanceData(userName);

  if (!data) {
    return emptyData;
  }

  return {
    ...emptyData,
    ...data,
    settings: {
      ...emptyData.settings,
      ...data.settings,
      userName: data.settings?.userName || userName,
    },
    categories: data.categories?.length ? data.categories : defaultCategories,
    accounts: data.accounts ?? [],
    transactions: data.transactions ?? [],
    dailyExpenses: data.dailyExpenses ?? [],
    incomes: data.incomes ?? [],
    expenses: data.expenses ?? [],
    creditCards: data.creditCards ?? [],
    cardPurchases: data.cardPurchases ?? [],
    invoices: data.invoices ?? [],
    debts: data.debts ?? [],
  };
}
