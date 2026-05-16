import { AlertTriangle, Plus } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { CategoryDonutChart, SimpleLineChart } from '../components/Charts/FinanceCharts';
import { Badge, Button, ConfirmDeleteButton, Field, Panel, SectionHeader, StatCard, TableShell, inputClass } from '../components/UI';
import { buildDailySpendingSeries } from '../utils/calculations';
import { formatCurrency, formatDate, parseCurrencyInput, toIsoDate } from '../utils/formatters';
import { getCategoryName, paymentMethods } from './helpers';
import type { PageProps } from './PageProps';

export function GastosDiarios({ controller }: PageProps) {
  const { data, metrics, categorySeries, actions } = controller;
  const expenseCategories = data.categories.filter((category) => category.active && category.type !== 'receita');
  const [form, setForm] = useState({
    description: '',
    amount: '',
    date: toIsoDate(new Date()),
    categoryId: expenseCategories[0]?.id ?? '',
    paymentMethod: 'Pix',
    notes: '',
  });

  const dailySeries = useMemo(
    () => buildDailySpendingSeries(data).map((item) => ({ ...item, label: item.day })),
    [data],
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = parseCurrencyInput(form.amount);

    if (!form.description.trim() || !amount || !form.categoryId) {
      window.alert('Preencha descrição, valor e categoria.');
      return;
    }

    actions.addDailyExpense({
      description: form.description.trim(),
      amount,
      date: form.date,
      categoryId: form.categoryId,
      paymentMethod: form.paymentMethod,
      notes: form.notes,
    });
    setForm({ ...form, description: '', amount: '', notes: '' });
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Gastos Diários"
        description="Controle gastos pequenos e recorrentes como mercado, almoço, café, gasolina, farmácia e delivery."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total gasto no dia" value={formatCurrency(metrics.spentToday)} tone="red" />
        <StatCard title="Total gasto na semana" value={formatCurrency(metrics.spentThisWeek)} tone="orange" />
        <StatCard title="Total gasto no mês" value={formatCurrency(metrics.spentThisMonth)} tone="purple" />
        <StatCard title="Limite diário recomendado" value={formatCurrency(data.settings.recommendedDailyLimit)} tone="blue" />
        <StatCard title="Média diária disponível" value={formatCurrency(metrics.dailyAverageAvailable)} tone="green" />
      </div>

      {metrics.spentToday > data.settings.recommendedDailyLimit ? (
        <Panel className="border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10">
          <div className="flex items-center gap-3 text-amber-800 dark:text-amber-100">
            <AlertTriangle size={20} />
            <p className="text-sm font-medium">
              O gasto de hoje ultrapassou o limite diário recomendado em {formatCurrency(metrics.spentToday - data.settings.recommendedDailyLimit)}.
            </p>
          </div>
        </Panel>
      ) : null}

      <Panel>
        <form className="grid gap-4 lg:grid-cols-12" onSubmit={handleSubmit}>
          <Field label="Descrição" className="lg:col-span-3">
            <input className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
          <Field label="Valor" className="lg:col-span-2">
            <input className={inputClass} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="R$ 0,00" />
          </Field>
          <Field label="Data" className="lg:col-span-2">
            <input className={inputClass} type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </Field>
          <Field label="Categoria" className="lg:col-span-2">
            <select className={inputClass} value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Forma" className="lg:col-span-2">
            <select className={inputClass} value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}>
              {paymentMethods().map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </Field>
          <div className="flex items-end lg:col-span-1">
            <Button type="submit" className="w-full">
              <Plus size={18} />
            </Button>
          </div>
          <Field label="Observações" className="lg:col-span-12">
            <input className={inputClass} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Field>
        </form>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <SimpleLineChart
          title="Gastos por dia"
          subtitle="Comparativo entre gasto real e limite diário"
          data={dailySeries}
          lines={[
            { key: 'gasto', color: '#ef4444', name: 'Gasto real' },
            { key: 'limite', color: '#2563eb', name: 'Limite diário' },
          ]}
        />
        <CategoryDonutChart data={categorySeries} title="Gastos por categoria" />
      </div>

      <Panel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">Gastos recentes</h3>
          <Badge tone="slate">{data.dailyExpenses.length} registros</Badge>
        </div>
        <TableShell minWidth="min-w-[680px]">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Forma</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.dailyExpenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-3">{formatDate(expense.date)}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{expense.description}</td>
                <td className="px-4 py-3">{getCategoryName(data.categories, expense.categoryId)}</td>
                <td className="px-4 py-3">{expense.paymentMethod}</td>
                <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-3">
                  <ConfirmDeleteButton onConfirm={() => actions.removeRecord('dailyExpenses', expense.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
