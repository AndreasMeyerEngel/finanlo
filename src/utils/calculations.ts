import type {
  CategorySeriesItem,
  DashboardMetrics,
  Debt,
  DebtEvolutionItem,
  FinanceData,
  FutureInstallmentItem,
  InvoiceSeriesItem,
  MonthSeriesItem,
} from '../types/finance';
import {
  addMonths,
  clampDay,
  formatMonthLabel,
  getLastMonths,
  getMonthKey,
  getNextMonths,
  isSameDay,
  isWithinCurrentWeek,
  percent,
  toIsoDate,
} from './formatters';

const dueStatuses = new Set(['ativa', 'atrasada', 'renegociada']);

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function getDebtRemaining(debt: Debt): number {
  if (debt.totalInstallments > 0) {
    return Math.max(0, (debt.totalInstallments - debt.paidInstallments) * debt.installmentAmount);
  }

  return Math.max(0, debt.totalAmount - debt.paidAmount);
}

export function getDebtProgress(debt: Debt): number {
  return percent(debt.paidAmount, debt.totalAmount);
}

export function getDebtNextDueDate(debt: Debt, referenceDate = new Date()): string {
  const currentMonthDate = clampDay(referenceDate.getFullYear(), referenceDate.getMonth(), debt.monthlyDueDay);
  const referenceDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const dueDate = currentMonthDate < referenceDay
    ? clampDay(referenceDate.getFullYear(), referenceDate.getMonth() + 1, debt.monthlyDueDay)
    : currentMonthDate;

  return toIsoDate(dueDate);
}

export function isDebtDueInNextDays(debt: Debt, days = 7, referenceDate = new Date()): boolean {
  if (!dueStatuses.has(debt.status)) {
    return false;
  }

  const dueDate = new Date(`${getDebtNextDueDate(debt, referenceDate)}T12:00:00`);
  const startDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const endDate = new Date(startDate);
  endDate.setDate(referenceDate.getDate() + days);
  return dueDate >= startDate && dueDate <= endDate;
}

export function getCurrentMonthKey(referenceDate = new Date()): string {
  return getMonthKey(referenceDate);
}

export function getMonthlyDebtInstallments(data: FinanceData, referenceDate = new Date()): number {
  const year = referenceDate.getFullYear();
  const monthIndex = referenceDate.getMonth();

  return sum(
    data.debts
      .filter((debt) => {
        if (!dueStatuses.has(debt.status) || getDebtRemaining(debt) <= 0) {
          return false;
        }

        const dueDate = clampDay(year, monthIndex, debt.monthlyDueDay);
        const [startYear, startMonth, startDay] = debt.startDate.split('-').map(Number);
        const startDate = new Date(startYear, startMonth - 1, startDay);

        return dueDate >= startDate;
      })
      .map((debt) => debt.installmentAmount),
  );
}

export function calculateDashboardMetrics(data: FinanceData, referenceDate = new Date()): DashboardMetrics {
  const monthKey = getCurrentMonthKey(referenceDate);
  const today = toIsoDate(referenceDate);

  const receivedIncomes = sum(data.incomes.filter((income) => income.status === 'recebida').map((income) => income.amount));
  const paidExpenses = sum(data.expenses.filter((expense) => expense.status === 'pago').map((expense) => expense.amount));
  const dailyPaid = sum(data.dailyExpenses.map((expense) => expense.amount));
  const currentBalance = data.settings.initialBalance + receivedIncomes - paidExpenses - dailyPaid;
  const monthlyIncomeTotal = sum(
    data.incomes.filter((income) => getMonthKey(income.receiptDate) === monthKey).map((income) => income.amount),
  );
  const monthlyExpenseTotal = sum([
    ...data.expenses.filter((expense) => getMonthKey(expense.dueDate) === monthKey).map((expense) => expense.amount),
    ...data.dailyExpenses.filter((expense) => getMonthKey(expense.date) === monthKey).map((expense) => expense.amount),
  ]);

  const totalDebt = sum(data.debts.map(getDebtRemaining));
  const monthlyDebtInstallments = getMonthlyDebtInstallments(data, referenceDate);
  const currentMonthInvoices = sum(
    data.invoices
      .filter((invoice) => invoice.month === monthKey && invoice.status !== 'paga')
      .map((invoice) => Math.max(0, invoice.totalAmount - invoice.paidAmount)),
  );
  const availableThisMonth = monthlyIncomeTotal - monthlyExpenseTotal - monthlyDebtInstallments - currentMonthInvoices;
  const daysRemaining = Math.max(
    1,
    new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate() - referenceDate.getDate() + 1,
  );
  const dailyAverageAvailable = availableThisMonth / daysRemaining;

  const spentToday = sum([
    ...data.dailyExpenses.filter((expense) => isSameDay(expense.date, referenceDate)).map((expense) => expense.amount),
    ...data.expenses.filter((expense) => expense.paidDate === today).map((expense) => expense.amount),
  ]);
  const spentThisWeek = sum([
    ...data.dailyExpenses.filter((expense) => isWithinCurrentWeek(expense.date, referenceDate)).map((expense) => expense.amount),
    ...data.expenses
      .filter((expense) => expense.paidDate && isWithinCurrentWeek(expense.paidDate, referenceDate))
      .map((expense) => expense.amount),
  ]);
  const spentThisMonth = sum([
    ...data.dailyExpenses.filter((expense) => getMonthKey(expense.date) === monthKey).map((expense) => expense.amount),
    ...data.expenses.filter((expense) => getMonthKey(expense.dueDate) === monthKey).map((expense) => expense.amount),
  ]);

  const activeDebtsList = data.debts.filter((debt) => dueStatuses.has(debt.status));
  const nextDueDebt = [...activeDebtsList].sort((a, b) =>
    getDebtNextDueDate(a, referenceDate).localeCompare(getDebtNextDueDate(b, referenceDate)),
  )[0];
  const priorityOrder = { critica: 4, alta: 3, media: 2, baixa: 1 };
  const criticalDebt = [...activeDebtsList].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])[0];

  return {
    currentBalance,
    monthlyIncomeTotal,
    monthlyExpenseTotal,
    totalDebt,
    monthlyDebtInstallments,
    availableThisMonth,
    dailyAverageAvailable,
    spentToday,
    spentThisWeek,
    spentThisMonth,
    debtOriginalTotal: sum(data.debts.map((debt) => debt.totalAmount)),
    debtPaidTotal: sum(data.debts.map((debt) => debt.paidAmount)),
    debtRemainingTotal: totalDebt,
    activeDebts: activeDebtsList.length,
    paidDebts: data.debts.filter((debt) => debt.status === 'quitada').length,
    nextDueDebt,
    criticalDebt,
  };
}

export function buildMonthlySeries(data: FinanceData, referenceDate = new Date()): MonthSeriesItem[] {
  return getLastMonths(12, referenceDate).map((month) => {
    const receitas = sum(data.incomes.filter((income) => getMonthKey(income.receiptDate) === month).map((income) => income.amount));
    const despesas = sum([
      ...data.expenses.filter((expense) => getMonthKey(expense.dueDate) === month).map((expense) => expense.amount),
      ...data.dailyExpenses.filter((expense) => getMonthKey(expense.date) === month).map((expense) => expense.amount),
      ...data.invoices.filter((invoice) => invoice.month === month).map((invoice) => invoice.totalAmount),
    ]);

    return {
      month,
      label: formatMonthLabel(month),
      receitas,
      despesas,
      saldo: receitas - despesas,
    };
  });
}

export function buildExpenseCategorySeries(data: FinanceData, referenceDate = new Date()): CategorySeriesItem[] {
  const monthKey = getCurrentMonthKey(referenceDate);
  const totals = new Map<string, number>();

  data.expenses
    .filter((expense) => getMonthKey(expense.dueDate) === monthKey)
    .forEach((expense) => totals.set(expense.categoryId, (totals.get(expense.categoryId) ?? 0) + expense.amount));

  data.dailyExpenses
    .filter((expense) => getMonthKey(expense.date) === monthKey)
    .forEach((expense) => totals.set(expense.categoryId, (totals.get(expense.categoryId) ?? 0) + expense.amount));

  return Array.from(totals.entries())
    .map(([categoryId, value]) => {
      const category = data.categories.find((item) => item.id === categoryId);
      return {
        name: category?.name ?? 'Sem categoria',
        value,
        color: category?.color ?? '#94a3b8',
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function buildDebtEvolutionSeries(data: FinanceData, referenceDate = new Date()): DebtEvolutionItem[] {
  const currentRemaining = sum(data.debts.map(getDebtRemaining));
  const monthlyPayment = getMonthlyDebtInstallments(data, referenceDate);
  const original = Math.max(sum(data.debts.map((debt) => debt.totalAmount)), 1);

  return getLastMonths(12, referenceDate).map((month, index, months) => {
    const monthsBack = months.length - 1 - index;
    const restante = Math.min(original, currentRemaining + monthlyPayment * monthsBack);
    const pago = Math.max(0, original - restante);

    return {
      month,
      label: formatMonthLabel(month),
      restante,
      pago,
      progresso: percent(pago, original),
    };
  });
}

export function buildDebtCreditorSeries(data: FinanceData): CategorySeriesItem[] {
  const palette = ['#f97316', '#8b5cf6', '#ef4444', '#14b8a6', '#3b82f6', '#eab308', '#64748b'];
  const totals = new Map<string, number>();

  data.debts.forEach((debt) => {
    totals.set(debt.creditor, (totals.get(debt.creditor) ?? 0) + getDebtRemaining(debt));
  });

  return Array.from(totals.entries())
    .map(([name, value], index) => ({
      name,
      value,
      color: palette[index % palette.length],
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function buildDebtPrioritySeries(data: FinanceData): CategorySeriesItem[] {
  const colors = {
    baixa: '#22c55e',
    media: '#eab308',
    alta: '#f97316',
    critica: '#b91c1c',
  };

  return (['critica', 'alta', 'media', 'baixa'] as const)
    .map((priority) => ({
      name: priority,
      value: sum(data.debts.filter((debt) => debt.priority === priority).map(getDebtRemaining)),
      color: colors[priority],
    }))
    .filter((item) => item.value > 0);
}

export function buildFutureInstallmentsSeries(data: FinanceData, referenceDate = new Date()): FutureInstallmentItem[] {
  return getNextMonths(12, referenceDate).map((month) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const parcelas = sum([
      ...data.debts
        .filter((debt) => dueStatuses.has(debt.status) && getDebtRemaining(debt) > 0)
        .map((debt) => {
          const dueDate = clampDay(year, monthNumber - 1, debt.monthlyDueDay);
          const [startYear, startMonth, startDay] = debt.startDate.split('-').map(Number);
          const startDate = new Date(startYear, startMonth - 1, startDay);
          return dueDate >= startDate ? debt.installmentAmount : 0;
        }),
      ...data.invoices.filter((invoice) => invoice.month === month).map((invoice) => Math.max(0, invoice.totalAmount - invoice.paidAmount)),
    ]);

    return {
      month,
      label: formatMonthLabel(month),
      parcelas,
    };
  });
}

export function buildDebtFutureInstallmentsSeries(data: FinanceData, referenceDate = new Date()): FutureInstallmentItem[] {
  return getNextMonths(12, referenceDate).map((month) => {
    const [year, monthNumber] = month.split('-').map(Number);
    const parcelas = sum(
      data.debts
        .filter((debt) => dueStatuses.has(debt.status) && getDebtRemaining(debt) > 0)
        .map((debt) => {
          const dueDate = clampDay(year, monthNumber - 1, debt.monthlyDueDay);
          const [startYear, startMonth, startDay] = debt.startDate.split('-').map(Number);
          const startDate = new Date(startYear, startMonth - 1, startDay);
          return dueDate >= startDate ? debt.installmentAmount : 0;
        }),
    );

    return {
      month,
      label: formatMonthLabel(month),
      parcelas,
    };
  });
}

export function buildInvoiceSeries(data: FinanceData, referenceDate = new Date()): InvoiceSeriesItem[] {
  return getLastMonths(12, referenceDate).map((month) => {
    const invoices = data.invoices.filter((invoice) => invoice.month === month);
    const total = sum(invoices.map((invoice) => invoice.totalAmount));
    const pago = sum(invoices.map((invoice) => invoice.paidAmount));

    return {
      month,
      label: formatMonthLabel(month),
      total,
      pago,
      aberto: Math.max(0, total - pago),
    };
  });
}

export function buildDailySpendingSeries(data: FinanceData, referenceDate = new Date()) {
  const daysInMonth = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0).getDate();
  const monthKey = getCurrentMonthKey(referenceDate);

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = `${monthKey}-${String(day).padStart(2, '0')}`;
    return {
      day: String(day),
      gasto: sum(data.dailyExpenses.filter((expense) => expense.date === date).map((expense) => expense.amount)),
      limite: data.settings.recommendedDailyLimit,
    };
  });
}

export function buildIncomeHistorySeries(data: FinanceData, referenceDate = new Date()) {
  return getLastMonths(12, referenceDate).map((month) => ({
    month,
    label: formatMonthLabel(month),
    prevista: sum(data.incomes.filter((income) => getMonthKey(income.receiptDate) === month).map((income) => income.amount)),
    recebida: sum(
      data.incomes
        .filter((income) => getMonthKey(income.receiptDate) === month && income.status === 'recebida')
        .map((income) => income.amount),
    ),
  }));
}

export function buildNotifications(data: FinanceData, referenceDate = new Date()): string[] {
  const metrics = calculateDashboardMetrics(data, referenceDate);
  const notifications: string[] = [];

  data.debts
    .filter((debt) => isDebtDueInNextDays(debt, 7, referenceDate))
    .forEach((debt) => notifications.push(`${debt.name} vence nos próximos 7 dias.`));

  data.debts
    .filter((debt) => debt.status === 'atrasada')
    .forEach((debt) => notifications.push(`${debt.name} está atrasada.`));

  data.debts
    .filter((debt) => debt.priority === 'critica' && debt.status !== 'quitada')
    .forEach((debt) => notifications.push(`${debt.name} está com prioridade crítica.`));

  data.debts
    .filter((debt) => debt.installmentAmount > data.settings.monthlyIncome * 0.25 && debt.status !== 'quitada')
    .forEach((debt) => notifications.push(`Parcela de ${debt.name} está alta em relação à renda.`));

  buildFutureInstallmentsSeries(data, referenceDate)
    .filter((item) => item.parcelas > data.settings.monthlyIncome * 0.45)
    .slice(0, 2)
    .forEach((item) => notifications.push(`${item.label} concentra muitas parcelas futuras.`));

  if (metrics.spentToday > data.settings.recommendedDailyLimit) {
    notifications.push('O limite diário recomendado foi ultrapassado hoje.');
  }

  return notifications;
}

export function advanceMonth(date: string, months: number): string {
  return toIsoDate(addMonths(new Date(`${date}T12:00:00`), months));
}
