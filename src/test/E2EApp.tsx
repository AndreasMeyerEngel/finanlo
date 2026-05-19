import { useMemo, useState } from 'react';
import { AppLayout } from '../components/Layout/AppLayout';
import { createEmptyFinanceData } from '../data/emptyData';
import type {
  Account,
  CardPurchase,
  CreditCard,
  Debt,
  FinanceData,
  Invoice,
  PageId,
  Settings,
} from '../types/finance';
import {
  buildDebtFutureInstallmentsSeries,
  buildDebtEvolutionSeries,
  buildExpenseCategorySeries,
  buildFutureInstallmentsSeries,
  buildIncomeHistorySeries,
  buildInvoiceSeries,
  buildMonthlySeries,
  buildNotifications,
  calculateDashboardMetrics,
} from '../utils/calculations';
import { getMonthKey, toIsoDate } from '../utils/formatters';
import { Categorias } from '../pages/Categorias';
import { Configuracoes } from '../pages/Configuracoes';
import { Dashboard } from '../pages/Dashboard';
import { Dividas } from '../pages/Dividas';
import { Faturas } from '../pages/Faturas';
import { Receitas } from '../pages/Receitas';
import { Relatorios } from '../pages/Relatorios';
import { Transacoes } from '../pages/Transacoes';
import type { FinanceController } from '../hooks/useFinanceData';

const pages = {
  dashboard: Dashboard,
  transacoes: Transacoes,
  receitas: Receitas,
  faturas: Faturas,
  dividas: Dividas,
  categorias: Categorias,
  relatorios: Relatorios,
  configuracoes: Configuracoes,
};

function createE2EData(): FinanceData {
  const currentMonth = getMonthKey(new Date());
  const data = createEmptyFinanceData('Andreas');
  const settings: Settings = {
    ...data.settings,
    monthlyIncome: 5000,
    recommendedDailyLimit: 80,
  };
  const account: Account = {
    id: 'acc-e2e',
    name: 'Conta E2E',
    type: 'corrente',
    balance: 0,
  };
  const card: CreditCard = {
    id: 'card-e2e',
    name: 'Cartão Teste',
    bank: 'Banco Teste',
    totalLimit: 3000,
    availableLimit: 2600,
    closingDay: 15,
    dueDay: 25,
    color: '#2563eb',
  };
  const purchase: CardPurchase = {
    id: 'purchase-e2e',
    description: 'Compra Teste Cartão',
    totalAmount: 400,
    purchaseDate: toIsoDate(new Date()),
    categoryId: 'cat-card',
    cardId: card.id,
    billingMode: 'parcelado',
    installments: 2,
    currentInstallment: 1,
    installmentAmount: 200,
  };
  const invoice: Invoice = {
    id: `invoice-${card.id}-${currentMonth}`,
    cardId: card.id,
    month: currentMonth,
    totalAmount: 200,
    paidAmount: 0,
    dueDate: `${currentMonth}-25`,
    status: 'aberta',
  };
  const debt: Debt = {
    id: 'debt-e2e',
    name: 'Dívida Teste',
    creditor: 'Credor Teste',
    type: 'Empréstimo',
    totalAmount: 1200,
    paidAmount: 0,
    totalInstallments: 12,
    paidInstallments: 0,
    installmentAmount: 100,
    startDate: `${currentMonth}-01`,
    monthlyDueDay: 10,
    status: 'ativa',
    priority: 'media',
  };

  return {
    ...data,
    settings,
    accounts: [account],
    creditCards: [card],
    cardPurchases: [purchase],
    invoices: [invoice],
    debts: [debt],
  };
}

export function E2EApp() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [data, setData] = useState(createE2EData);
  const Page = pages[activePage];

  const controller = useMemo(
    () =>
      ({
        data,
        dataLoading: false,
        isSyncing: false,
        persistenceError: null,
        metrics: calculateDashboardMetrics(data),
        monthlySeries: buildMonthlySeries(data),
        categorySeries: buildExpenseCategorySeries(data),
        debtEvolution: buildDebtEvolutionSeries(data),
        futureInstallments: buildFutureInstallmentsSeries(data),
        debtFutureInstallments: buildDebtFutureInstallmentsSeries(data),
        invoiceSeries: buildInvoiceSeries(data),
        incomeHistory: buildIncomeHistorySeries(data),
        notifications: buildNotifications(data),
        actions: {
          resetData: () => setData(createE2EData()),
          updateSettings: (settings: Partial<Settings>) =>
            setData((current) => ({ ...current, settings: { ...current.settings, ...settings } })),
          removeRecord: () => undefined,
          addTransaction: () => undefined,
          updateTransaction: () => undefined,
          markTransactionPaid: () => undefined,
          addDailyExpense: () => undefined,
          addIncome: () => undefined,
          updateIncome: () => undefined,
          addExpense: () => undefined,
          updateExpense: () => undefined,
          markExpensePaid: () => undefined,
          addCreditCard: () => undefined,
          addCardPurchase: () => undefined,
          updateCardPurchase: () => undefined,
          deleteCardPurchase: () => undefined,
          markInvoicePaid: () => undefined,
          addDebt: () => undefined,
          updateDebt: () => undefined,
          markDebtInstallmentPaid: () => undefined,
          settleDebt: () => undefined,
          addCategory: () => undefined,
          updateCategory: () => undefined,
          addAccount: () => undefined,
          updateAccount: () => undefined,
        },
      }) as unknown as FinanceController,
    [data],
  );

  return (
    <AppLayout activePage={activePage} setActivePage={setActivePage} controller={controller} currentUserEmail="e2e@finanlo.test">
      <Page controller={controller} />
    </AppLayout>
  );
}
