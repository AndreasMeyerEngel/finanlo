import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createEmptyFinanceData, normalizeFinanceData } from '../data/emptyData';
import { supabase } from '../lib/supabase';
import type {
  CardPurchase,
  Account,
  Category,
  CreditCard,
  DailyExpense,
  Debt,
  Expense,
  FinanceData,
  Income,
  Invoice,
  Settings,
  Transaction,
} from '../types/finance';
import {
  buildDebtEvolutionSeries,
  buildExpenseCategorySeries,
  buildFutureInstallmentsSeries,
  buildIncomeHistorySeries,
  buildInvoiceSeries,
  buildMonthlySeries,
  buildNotifications,
  calculateDashboardMetrics,
  getDebtRemaining,
} from '../utils/calculations';
import { addMonths, getMonthKey, toIsoDate } from '../utils/formatters';

type CollectionName =
  | 'transactions'
  | 'dailyExpenses'
  | 'incomes'
  | 'expenses'
  | 'creditCards'
  | 'cardPurchases'
  | 'invoices'
  | 'debts'
  | 'categories'
  | 'accounts';

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function getUserDisplayName(user: User): string {
  const metadataName = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name : '';
  return metadataName || user.email?.split('@')[0] || 'Usuário';
}

function createTransactionFromIncome(income: Income): Transaction {
  return {
    id: uid('tr-inc'),
    type: 'receita',
    description: income.description,
    amount: income.amount,
    date: income.receiptDate,
    categoryId: income.categoryId,
    accountId: income.accountId,
    paymentMethod: 'Transferência',
    notes: income.notes,
    recurring: income.recurring,
    installment: false,
    status: income.status === 'recebida' ? 'pago' : 'pendente',
    source: 'income',
    sourceId: income.id,
  };
}

function createTransactionFromExpense(expense: Expense): Transaction {
  return {
    id: uid('tr-exp'),
    type: 'despesa',
    description: expense.description,
    amount: expense.amount,
    date: expense.paidDate ?? expense.dueDate,
    categoryId: expense.categoryId,
    accountId: expense.accountId,
    paymentMethod: expense.paymentMethod,
    notes: expense.notes,
    recurring: expense.recurring,
    installment: false,
    status: expense.status,
    source: 'expense',
    sourceId: expense.id,
  };
}

function upsertInvoiceForPurchase(invoices: Invoice[], purchase: CardPurchase, card: CreditCard): Invoice[] {
  let nextInvoices = [...invoices];
  const purchaseDate = new Date(`${purchase.purchaseDate}T12:00:00`);

  Array.from({ length: purchase.installments }, (_, installmentIndex) => {
    const installmentDate = addMonths(purchaseDate, installmentIndex);
    const month = getMonthKey(installmentDate);
    const dueDate = toIsoDate(new Date(installmentDate.getFullYear(), installmentDate.getMonth(), card.dueDay));
    const id = `invoice-${purchase.cardId}-${month}`;
    const existing = nextInvoices.find((invoice) => invoice.id === id);

    if (existing) {
      nextInvoices = nextInvoices.map((invoice) =>
        invoice.id === id
          ? {
              ...invoice,
              totalAmount: invoice.totalAmount + purchase.installmentAmount,
              status: invoice.status === 'paga' ? 'fechada' : invoice.status,
            }
          : invoice,
      );
      return;
    }

    nextInvoices.push({
      id,
      cardId: purchase.cardId,
      month,
      totalAmount: purchase.installmentAmount,
      paidAmount: 0,
      dueDate,
      status: 'aberta',
    });
  });

  return nextInvoices;
}

export function useFinanceData(user: User) {
  const [data, setData] = useState<FinanceData>(() => createEmptyFinanceData(getUserDisplayName(user)));
  const [dataLoading, setDataLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', data.settings.theme === 'dark');
  }, [data]);

  useEffect(() => {
    if (!supabase) {
      setDataLoading(false);
      setPersistenceError('Supabase não configurado.');
      return;
    }

    const client = supabase;
    let cancelled = false;
    const userName = getUserDisplayName(user);
    const emptyData = createEmptyFinanceData(userName);

    setDataLoading(true);
    setPersistenceError(null);

    async function loadProfile() {
      const { data: profile, error } = await client
        .from('finance_profiles')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cancelled) {
        return;
      }

      if (error) {
        setPersistenceError(error.message);
        setData(emptyData);
        setDataLoading(false);
        return;
      }

      if (!profile) {
        const { error: insertError } = await client.from('finance_profiles').insert({
          user_id: user.id,
          data: emptyData,
        });

        if (cancelled) {
          return;
        }

        if (insertError) {
          setPersistenceError(insertError.message);
        }

        setData(emptyData);
        setDataLoading(false);
        return;
      }

      setData(normalizeFinanceData(profile.data, userName));
      setDataLoading(false);
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!supabase || dataLoading) {
      return;
    }

    const client = supabase;
    const timeout = window.setTimeout(async () => {
      setIsSyncing(true);
      const { error } = await client.from('finance_profiles').upsert({
        user_id: user.id,
        data,
      });

      if (error) {
        setPersistenceError(error.message);
      } else {
        setPersistenceError(null);
      }

      setIsSyncing(false);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [data, dataLoading, user.id]);

  const metrics = useMemo(() => calculateDashboardMetrics(data), [data]);
  const monthlySeries = useMemo(() => buildMonthlySeries(data), [data]);
  const categorySeries = useMemo(() => buildExpenseCategorySeries(data), [data]);
  const debtEvolution = useMemo(() => buildDebtEvolutionSeries(data), [data]);
  const futureInstallments = useMemo(() => buildFutureInstallmentsSeries(data), [data]);
  const invoiceSeries = useMemo(() => buildInvoiceSeries(data), [data]);
  const incomeHistory = useMemo(() => buildIncomeHistorySeries(data), [data]);
  const notifications = useMemo(() => buildNotifications(data), [data]);

  const resetData = useCallback(() => {
    setData(createEmptyFinanceData(getUserDisplayName(user)));
  }, [user]);

  const updateSettings = useCallback((settings: Partial<Settings>) => {
    setData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        ...settings,
      },
    }));
  }, []);

  const removeRecord = useCallback((collection: CollectionName, id: string) => {
    setData((current) => ({
      ...current,
      [collection]: (current[collection] as Array<{ id: string }>).filter((item) => item.id !== id),
    }));
  }, []);

  const addTransaction = useCallback((input: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = { ...input, id: uid('tr') };

    setData((current) => {
      if (transaction.type === 'receita') {
        const income: Income = {
          id: uid('inc'),
          description: transaction.description,
          amount: transaction.amount,
          receiptDate: transaction.date,
          categoryId: transaction.categoryId,
          accountId: transaction.accountId,
          recurring: transaction.recurring,
          notes: transaction.notes,
          status: transaction.status === 'pago' ? 'recebida' : 'pendente',
        };

        return {
          ...current,
          incomes: [income, ...current.incomes],
          transactions: [{ ...transaction, source: 'manual', sourceId: income.id }, ...current.transactions],
        };
      }

      const expense: Expense = {
        id: uid('exp'),
        description: transaction.description,
        amount: transaction.amount,
        dueDate: transaction.date,
        paidDate: transaction.status === 'pago' ? transaction.date : undefined,
        categoryId: transaction.categoryId,
        accountId: transaction.accountId,
        paymentMethod: transaction.paymentMethod,
        status: transaction.status,
        recurring: transaction.recurring,
        fixed: transaction.recurring,
        notes: transaction.notes,
      };

      return {
        ...current,
        expenses: [expense, ...current.expenses],
        transactions: [{ ...transaction, source: 'manual', sourceId: expense.id }, ...current.transactions],
      };
    });
  }, []);

  const updateTransaction = useCallback((id: string, input: Partial<Transaction>) => {
    setData((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === id ? { ...transaction, ...input } : transaction,
      ),
    }));
  }, []);

  const markTransactionPaid = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      transactions: current.transactions.map((transaction) =>
        transaction.id === id ? { ...transaction, status: 'pago' } : transaction,
      ),
    }));
  }, []);

  const addDailyExpense = useCallback((input: Omit<DailyExpense, 'id'>) => {
    const dailyExpense: DailyExpense = { ...input, id: uid('daily') };
    setData((current) => ({
      ...current,
      dailyExpenses: [dailyExpense, ...current.dailyExpenses],
      transactions: [
        {
          id: uid('tr-daily'),
          type: 'despesa',
          description: dailyExpense.description,
          amount: dailyExpense.amount,
          date: dailyExpense.date,
          categoryId: dailyExpense.categoryId,
          accountId: current.accounts[0]?.id ?? '',
          paymentMethod: dailyExpense.paymentMethod,
          notes: dailyExpense.notes,
          recurring: false,
          installment: false,
          status: 'pago',
          source: 'daily',
          sourceId: dailyExpense.id,
        },
        ...current.transactions,
      ],
    }));
  }, []);

  const addIncome = useCallback((input: Omit<Income, 'id'>) => {
    const income: Income = { ...input, id: uid('inc') };
    const transaction = createTransactionFromIncome(income);

    setData((current) => ({
      ...current,
      incomes: [income, ...current.incomes],
      transactions: [transaction, ...current.transactions],
    }));
  }, []);

  const updateIncome = useCallback((id: string, input: Partial<Income>) => {
    setData((current) => ({
      ...current,
      incomes: current.incomes.map((income) => (income.id === id ? { ...income, ...input } : income)),
    }));
  }, []);

  const addExpense = useCallback((input: Omit<Expense, 'id'>) => {
    const expense: Expense = { ...input, id: uid('exp') };
    const transaction = createTransactionFromExpense(expense);

    setData((current) => ({
      ...current,
      expenses: [expense, ...current.expenses],
      transactions: [transaction, ...current.transactions],
    }));
  }, []);

  const updateExpense = useCallback((id: string, input: Partial<Expense>) => {
    setData((current) => ({
      ...current,
      expenses: current.expenses.map((expense) => (expense.id === id ? { ...expense, ...input } : expense)),
    }));
  }, []);

  const markExpensePaid = useCallback((id: string) => {
    const todayDate = toIsoDate(new Date());

    setData((current) => ({
      ...current,
      expenses: current.expenses.map((expense) =>
        expense.id === id ? { ...expense, status: 'pago', paidDate: todayDate } : expense,
      ),
      transactions: current.transactions.map((transaction) =>
        transaction.sourceId === id ? { ...transaction, status: 'pago', date: todayDate } : transaction,
      ),
    }));
  }, []);

  const addCreditCard = useCallback((input: Omit<CreditCard, 'id'>) => {
    const card: CreditCard = { ...input, id: uid('card') };

    setData((current) => ({
      ...current,
      creditCards: [card, ...current.creditCards],
    }));
  }, []);

  const addCardPurchase = useCallback((input: Omit<CardPurchase, 'id' | 'currentInstallment' | 'installmentAmount'>) => {
    setData((current) => {
      const card = current.creditCards.find((item) => item.id === input.cardId);

      if (!card) {
        return current;
      }

      const purchase: CardPurchase = {
        ...input,
        id: uid('purchase'),
        currentInstallment: 1,
        installmentAmount: input.totalAmount / Math.max(1, input.installments),
      };

      return {
        ...current,
        cardPurchases: [purchase, ...current.cardPurchases],
        creditCards: current.creditCards.map((item) =>
          item.id === card.id
            ? { ...item, availableLimit: Math.max(0, item.availableLimit - purchase.totalAmount) }
            : item,
        ),
        invoices: upsertInvoiceForPurchase(current.invoices, purchase, card),
      };
    });
  }, []);

  const markInvoicePaid = useCallback((id: string) => {
    const todayDate = toIsoDate(new Date());

    setData((current) => {
      const invoice = current.invoices.find((item) => item.id === id);

      if (!invoice || invoice.status === 'paga') {
        return current;
      }

      const card = current.creditCards.find((item) => item.id === invoice.cardId);
      const expense: Expense = {
        id: uid('exp-invoice'),
        description: `Pagamento fatura ${card?.name ?? 'cartão'} ${invoice.month}`,
        amount: invoice.totalAmount,
        dueDate: invoice.dueDate,
        paidDate: todayDate,
        categoryId: 'cat-card',
        accountId: current.accounts[0]?.id ?? '',
        paymentMethod: 'Pix',
        status: 'pago',
        recurring: false,
        fixed: false,
        notes: 'Gerado automaticamente ao pagar fatura.',
      };

      return {
        ...current,
        invoices: current.invoices.map((item) =>
          item.id === id ? { ...item, paidAmount: item.totalAmount, status: 'paga' } : item,
        ),
        expenses: [expense, ...current.expenses],
        transactions: [createTransactionFromExpense(expense), ...current.transactions],
      };
    });
  }, []);

  const addDebt = useCallback((input: Omit<Debt, 'id'>) => {
    const debt: Debt = { ...input, id: uid('debt') };

    setData((current) => ({
      ...current,
      debts: [debt, ...current.debts],
    }));
  }, []);

  const updateDebt = useCallback((id: string, input: Partial<Debt>) => {
    setData((current) => ({
      ...current,
      debts: current.debts.map((debt) => (debt.id === id ? { ...debt, ...input } : debt)),
    }));
  }, []);

  const markDebtInstallmentPaid = useCallback((id: string) => {
    const todayDate = toIsoDate(new Date());

    setData((current) => {
      const debt = current.debts.find((item) => item.id === id);

      if (!debt || debt.status === 'quitada' || getDebtRemaining(debt) <= 0) {
        return current;
      }

      const paidInstallments = Math.min(debt.totalInstallments, debt.paidInstallments + 1);
      const paidAmount = Math.min(debt.totalAmount, debt.paidAmount + debt.installmentAmount);
      const remainingInstallments = Math.max(0, debt.totalInstallments - paidInstallments);
      const newStatus = remainingInstallments === 0 ? 'quitada' : debt.status === 'atrasada' ? 'ativa' : debt.status;

      const expense: Expense = {
        id: uid('exp-debt'),
        description: `Parcela ${paidInstallments}/${debt.totalInstallments} - ${debt.name}`,
        amount: debt.installmentAmount,
        dueDate: todayDate,
        paidDate: todayDate,
        categoryId: 'cat-debts',
        accountId: current.accounts[0]?.id ?? '',
        paymentMethod: 'Pix',
        status: 'pago',
        recurring: false,
        fixed: false,
        notes: `Pagamento automático da dívida ${debt.name}.`,
      };

      return {
        ...current,
        debts: current.debts.map((item) =>
          item.id === id
            ? {
                ...item,
                paidInstallments,
                paidAmount,
                status: newStatus,
              }
            : item,
        ),
        expenses: [expense, ...current.expenses],
        transactions: [createTransactionFromExpense(expense), ...current.transactions],
      };
    });
  }, []);

  const settleDebt = useCallback((id: string) => {
    setData((current) => ({
      ...current,
      debts: current.debts.map((debt) =>
        debt.id === id
          ? {
              ...debt,
              paidAmount: debt.totalAmount,
              paidInstallments: debt.totalInstallments,
              status: 'quitada',
            }
          : debt,
      ),
    }));
  }, []);

  const addCategory = useCallback((input: Omit<Category, 'id'>) => {
    const category: Category = { ...input, id: uid('cat') };

    setData((current) => ({
      ...current,
      categories: [category, ...current.categories],
    }));
  }, []);

  const updateCategory = useCallback((id: string, input: Partial<Category>) => {
    setData((current) => ({
      ...current,
      categories: current.categories.map((category) => (category.id === id ? { ...category, ...input } : category)),
    }));
  }, []);

  const addAccount = useCallback((input: Omit<Account, 'id'>) => {
    const account: Account = { ...input, id: uid('acc') };

    setData((current) => ({
      ...current,
      accounts: [account, ...current.accounts],
    }));
  }, []);

  const updateAccount = useCallback((id: string, input: Partial<Account>) => {
    setData((current) => ({
      ...current,
      accounts: current.accounts.map((account) => (account.id === id ? { ...account, ...input } : account)),
    }));
  }, []);

  return {
    data,
    dataLoading,
    isSyncing,
    persistenceError,
    metrics,
    monthlySeries,
    categorySeries,
    debtEvolution,
    futureInstallments,
    invoiceSeries,
    incomeHistory,
    notifications,
    actions: {
      resetData,
      updateSettings,
      removeRecord,
      addTransaction,
      updateTransaction,
      markTransactionPaid,
      addDailyExpense,
      addIncome,
      updateIncome,
      addExpense,
      updateExpense,
      markExpensePaid,
      addCreditCard,
      addCardPurchase,
      markInvoicePaid,
      addDebt,
      updateDebt,
      markDebtInstallmentPaid,
      settleDebt,
      addCategory,
      updateCategory,
      addAccount,
      updateAccount,
    },
  };
}

export type FinanceController = ReturnType<typeof useFinanceData>;
