import { CheckCircle2, Plus } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { SimpleLineChart } from '../components/Charts/FinanceCharts';
import { Button, ConfirmDeleteButton, Field, Panel, SectionHeader, StatCard, TableShell, inputClass } from '../components/UI';
import { getMonthKey, formatCurrency, formatDate, parseCurrencyInput, toIsoDate } from '../utils/formatters';
import { getAccountName, getCategoryName, statusBadge } from './helpers';
import type { PageProps } from './PageProps';

export function Receitas({ controller }: PageProps) {
  const { data, incomeHistory, actions } = controller;
  const incomeCategories = data.categories.filter((category) => category.active && category.type !== 'despesa');
  const [form, setForm] = useState({
    description: '',
    amount: '',
    receiptDate: toIsoDate(new Date()),
    categoryId: incomeCategories[0]?.id ?? '',
    accountId: data.accounts[0]?.id ?? '',
    recurring: false,
    notes: '',
    status: 'pendente',
  });

  const currentMonth = getMonthKey(new Date());
  const monthIncomes = useMemo(() => data.incomes.filter((income) => getMonthKey(income.receiptDate) === currentMonth), [data.incomes, currentMonth]);
  const expected = monthIncomes.reduce((total, income) => total + income.amount, 0);
  const received = monthIncomes.filter((income) => income.status === 'recebida').reduce((total, income) => total + income.amount, 0);
  const pending = expected - received;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = parseCurrencyInput(form.amount);

    if (!form.description.trim() || !amount || !form.categoryId) {
      window.alert('Preencha descrição, valor e categoria.');
      return;
    }

    actions.addIncome({
      description: form.description.trim(),
      amount,
      receiptDate: form.receiptDate,
      categoryId: form.categoryId,
      accountId: form.accountId,
      recurring: form.recurring,
      notes: form.notes,
      status: form.status as 'recebida' | 'pendente',
    });
    setForm({ ...form, description: '', amount: '', notes: '' });
  }

  return (
    <div className="grid gap-6">
      <SectionHeader title="Receitas" description="Cadastre entradas de dinheiro e acompanhe previsão, recebido e pendências." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total de receitas no mês" value={formatCurrency(expected)} tone="green" />
        <StatCard title="Receita prevista" value={formatCurrency(expected)} tone="blue" />
        <StatCard title="Receita recebida" value={formatCurrency(received)} tone="green" />
        <StatCard title="Receita pendente" value={formatCurrency(pending)} tone="yellow" />
      </div>

      <Panel>
        <form className="grid gap-4 lg:grid-cols-12" onSubmit={handleSubmit}>
          <Field label="Descrição" className="lg:col-span-3">
            <input className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
          <Field label="Valor" className="lg:col-span-2">
            <input className={inputClass} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="R$ 0,00" />
          </Field>
          <Field label="Recebimento" className="lg:col-span-2">
            <input className={inputClass} type="date" value={form.receiptDate} onChange={(event) => setForm({ ...form, receiptDate: event.target.value })} />
          </Field>
          <Field label="Categoria" className="lg:col-span-2">
            <select className={inputClass} value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              {incomeCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Conta destino" className="lg:col-span-2">
            <select className={inputClass} value={form.accountId} onChange={(event) => setForm({ ...form, accountId: event.target.value })}>
              {data.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end lg:col-span-1">
            <Button type="submit" className="w-full">
              <Plus size={18} />
            </Button>
          </div>
          <Field label="Status" className="lg:col-span-2">
            <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="recebida">recebida</option>
              <option value="pendente">pendente</option>
            </select>
          </Field>
          <label className="flex items-end gap-2 pb-2 text-sm text-slate-600 dark:text-slate-300 lg:col-span-2">
            <input type="checkbox" checked={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.checked })} />
            Recorrente
          </label>
          <Field label="Observações" className="lg:col-span-8">
            <input className={inputClass} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Field>
        </form>
      </Panel>

      <SimpleLineChart
        title="Histórico de receitas"
        subtitle="Receitas previstas e recebidas nos últimos 12 meses"
        data={incomeHistory}
        lines={[
          { key: 'prevista', color: '#2563eb', name: 'Prevista' },
          { key: 'recebida', color: '#22c55e', name: 'Recebida' },
        ]}
      />

      <Panel>
        <TableShell>
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Recebimento</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Conta</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.incomes.map((income) => (
              <tr key={income.id}>
                <td className="px-4 py-3">{formatDate(income.receiptDate)}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{income.description}</td>
                <td className="px-4 py-3">{getCategoryName(data.categories, income.categoryId)}</td>
                <td className="px-4 py-3">{getAccountName(data.accounts, income.accountId)}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">{formatCurrency(income.amount)}</td>
                <td className="px-4 py-3">{statusBadge(income.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {income.status !== 'recebida' ? (
                      <Button variant="ghost" className="min-h-8 px-2 py-1" onClick={() => actions.updateIncome(income.id, { status: 'recebida' })}>
                        <CheckCircle2 size={14} />
                      </Button>
                    ) : null}
                    <ConfirmDeleteButton onConfirm={() => actions.removeRecord('incomes', income.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
