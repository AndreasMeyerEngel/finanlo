import {
  AlertTriangle,
  CalendarClock,
  CircleDollarSign,
  CreditCard,
  Landmark,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { CategoryDonutChart, DebtEvolutionChart, MonthlyComparisonChart } from '../components/Charts/FinanceCharts';
import { Badge, Panel, SectionHeader, StatCard, inputClass } from '../components/UI';
import type { PageProps } from './PageProps';
import { formatCurrency, formatDate, formatMonthLabel, getLastMonths, getMonthKey } from '../utils/formatters';
import {
  buildDebtEvolutionSeries,
  buildExpenseCategorySeries,
  buildMonthlySeries,
  buildNotifications,
  calculateDashboardMetrics,
  getDebtNextDueDate,
} from '../utils/calculations';
import { statusBadge } from './helpers';

export function Dashboard({ controller }: PageProps) {
  const { data } = controller;
  const currentMonth = getMonthKey(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const selectedDate = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const now = new Date();

    if (selectedMonth === currentMonth) {
      return now;
    }

    const lastDay = new Date(year, month, 0).getDate();
    return new Date(year, month - 1, lastDay);
  }, [currentMonth, selectedMonth]);

  const monthOptions = useMemo(() => {
    const dataMonths = new Set<string>(getLastMonths(12));

    data.incomes.forEach((income) => dataMonths.add(getMonthKey(income.receiptDate)));
    data.expenses.forEach((expense) => dataMonths.add(getMonthKey(expense.dueDate)));
    data.dailyExpenses.forEach((expense) => dataMonths.add(getMonthKey(expense.date)));
    data.invoices.forEach((invoice) => dataMonths.add(invoice.month));

    return Array.from(dataMonths).sort((a, b) => b.localeCompare(a));
  }, [data]);

  const metrics = useMemo(() => calculateDashboardMetrics(data, selectedDate), [data, selectedDate]);
  const monthlySeries = useMemo(() => buildMonthlySeries(data, selectedDate), [data, selectedDate]);
  const categorySeries = useMemo(() => buildExpenseCategorySeries(data, selectedDate), [data, selectedDate]);
  const debtEvolution = useMemo(() => buildDebtEvolutionSeries(data, selectedDate), [data, selectedDate]);
  const notifications = useMemo(() => buildNotifications(data, selectedDate), [data, selectedDate]);
  const selectedMonthLabel = formatMonthLabel(selectedMonth);
  const isCurrentMonth = selectedMonth === currentMonth;

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Dashboard"
        description="Visão mensal e anual para acompanhar saldo, gastos, faturas e dívidas."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Badge tone={isCurrentMonth ? 'blue' : 'purple'}>Período: {selectedMonthLabel}</Badge>
            <select
              className={`${inputClass} min-w-44`}
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              aria-label="Selecionar mês do dashboard"
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Saldo atual" value={formatCurrency(metrics.currentBalance)} icon={<Wallet size={20} />} tone="blue" />
        <StatCard title="Receitas no mês" value={formatCurrency(metrics.monthlyIncomeTotal)} icon={<TrendingUp size={20} />} tone="green" />
        <StatCard title="Despesas no mês" value={formatCurrency(metrics.monthlyExpenseTotal)} icon={<TrendingDown size={20} />} tone="red" />
        <StatCard title="Total em dívidas" value={formatCurrency(metrics.totalDebt)} icon={<Landmark size={20} />} tone="orange" />
        <StatCard title="Parcelas do mês" value={formatCurrency(metrics.monthlyDebtInstallments)} icon={<CalendarClock size={20} />} tone="purple" />
        <StatCard title="Disponível no mês" value={formatCurrency(metrics.availableThisMonth)} icon={<PiggyBank size={20} />} tone="blue" />
        <StatCard title="Média diária disponível" value={formatCurrency(metrics.dailyAverageAvailable)} icon={<CircleDollarSign size={20} />} tone="green" />
        <StatCard title={isCurrentMonth ? 'Gasto hoje' : 'Gasto no último dia'} value={formatCurrency(metrics.spentToday)} icon={<CreditCard size={20} />} tone="red" />
        <StatCard title={isCurrentMonth ? 'Gasto na semana' : 'Gasto na semana final'} value={formatCurrency(metrics.spentThisWeek)} icon={<CreditCard size={20} />} tone="orange" />
        <StatCard title="Gasto no mês" value={formatCurrency(metrics.spentThisMonth)} icon={<CreditCard size={20} />} tone="purple" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.85fr)]">
        <MonthlyComparisonChart data={monthlySeries} />
        <CategoryDonutChart data={categorySeries} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <DebtEvolutionChart data={debtEvolution} />
        <Panel>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="text-amber-500" size={20} />
            <h3 className="text-base font-semibold text-slate-950 dark:text-white">Alertas e prioridades</h3>
          </div>
          <div className="grid gap-3">
            {metrics.nextDueDebt ? (
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Próxima dívida a vencer</p>
                <strong className="mt-1 block text-slate-950 dark:text-white">{metrics.nextDueDebt.name}</strong>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <span>{formatDate(getDebtNextDueDate(metrics.nextDueDebt))}</span>
                  {statusBadge(metrics.nextDueDebt.status)}
                </div>
              </div>
            ) : null}
            {metrics.criticalDebt ? (
              <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">Dívida mais crítica</p>
                <strong className="mt-1 block text-slate-950 dark:text-white">{metrics.criticalDebt.name}</strong>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {metrics.criticalDebt.creditor} • parcela {formatCurrency(metrics.criticalDebt.installmentAmount)}
                </p>
              </div>
            ) : null}
            {notifications.slice(0, 6).map((notification) => (
              <div key={notification} className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-100">
                {notification}
              </div>
            ))}
            {!notifications.length ? (
              <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100">
                Sem alertas críticos no momento.
              </p>
            ) : null}
          </div>
        </Panel>
      </div>
    </div>
  );
}
