import { CheckCircle2, Plus } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Button, ConfirmDeleteButton, Field, Panel, SectionHeader, StatCard, TableShell, inputClass } from '../components/UI';
import type { Expense } from '../types/finance';
import { formatCurrency, formatDate, getMonthKey, parseCurrencyInput, toIsoDate } from '../utils/formatters';
import { getAccountName, getCategoryName, paymentMethods, statusBadge } from './helpers';
import type { PageProps } from './PageProps';

export function Despesas({ controller }: PageProps) {
  const { data, actions } = controller;
  const expenseCategories = data.categories.filter((category) => category.active && category.type !== 'receita');
  const [filters, setFilters] = useState({ categoryId: 'todos', status: 'todos', fixed: 'todos' });
  const [form, setForm] = useState({
    description: '',
    amount: '',
    dueDate: toIsoDate(new Date()),
    paidDate: '',
    categoryId: expenseCategories[0]?.id ?? '',
    accountId: data.accounts[0]?.id ?? '',
    paymentMethod: 'Pix',
    status: 'pendente',
    recurring: false,
    fixed: false,
    notes: '',
  });

  const currentMonth = getMonthKey(new Date());
  const filteredExpenses = useMemo(
    () =>
      data.expenses.filter((expense) => {
        if (filters.categoryId !== 'todos' && expense.categoryId !== filters.categoryId) return false;
        if (filters.status !== 'todos' && expense.status !== filters.status) return false;
        if (filters.fixed !== 'todos' && String(expense.fixed) !== filters.fixed) return false;
        return true;
      }),
    [data.expenses, filters],
  );

  const monthExpenses = data.expenses.filter((expense) => getMonthKey(expense.dueDate) === currentMonth);
  const overdue = data.expenses.filter((expense) => expense.status === 'vencido').length;
  const future = data.expenses.filter((expense) => expense.status === 'pendente' && expense.dueDate > toIsoDate(new Date())).length;
  const fixedTotal = monthExpenses.filter((expense) => expense.fixed).reduce((total, expense) => total + expense.amount, 0);
  const variableTotal = monthExpenses.filter((expense) => !expense.fixed).reduce((total, expense) => total + expense.amount, 0);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = parseCurrencyInput(form.amount);

    if (!form.description.trim() || !amount || !form.categoryId) {
      window.alert('Preencha descrição, valor e categoria.');
      return;
    }

    actions.addExpense({
      description: form.description.trim(),
      amount,
      dueDate: form.dueDate,
      paidDate: form.paidDate || undefined,
      categoryId: form.categoryId,
      accountId: form.accountId,
      paymentMethod: form.paymentMethod,
      status: form.status as Expense['status'],
      recurring: form.recurring,
      fixed: form.fixed,
      notes: form.notes,
    });
    setForm({ ...form, description: '', amount: '', paidDate: '', notes: '' });
  }

  return (
    <div className="grid gap-6">
      <SectionHeader title="Despesas" description="Controle despesas gerais, fixas, variáveis, vencidas e futuras." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Despesas do mês" value={formatCurrency(monthExpenses.reduce((total, expense) => total + expense.amount, 0))} tone="red" />
        <StatCard title="Despesas vencidas" value={String(overdue)} tone="red" />
        <StatCard title="Despesas futuras" value={String(future)} tone="yellow" />
        <StatCard title="Fixas / variáveis" value={`${formatCurrency(fixedTotal)} / ${formatCurrency(variableTotal)}`} tone="blue" />
      </div>

      <Panel>
        <form className="grid gap-4 lg:grid-cols-12" onSubmit={handleSubmit}>
          <Field label="Descrição" className="lg:col-span-3">
            <input className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
          <Field label="Valor" className="lg:col-span-2">
            <input className={inputClass} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="R$ 0,00" />
          </Field>
          <Field label="Vencimento" className="lg:col-span-2">
            <input className={inputClass} type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} />
          </Field>
          <Field label="Pagamento" className="lg:col-span-2">
            <input className={inputClass} type="date" value={form.paidDate} onChange={(event) => setForm({ ...form, paidDate: event.target.value })} />
          </Field>
          <Field label="Status" className="lg:col-span-2">
            <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="pago">pago</option>
              <option value="pendente">pendente</option>
              <option value="vencido">vencido</option>
            </select>
          </Field>
          <div className="flex items-end lg:col-span-1">
            <Button type="submit" className="w-full">
              <Plus size={18} />
            </Button>
          </div>
          <Field label="Categoria" className="lg:col-span-3">
            <select className={inputClass} value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Conta" className="lg:col-span-3">
            <select className={inputClass} value={form.accountId} onChange={(event) => setForm({ ...form, accountId: event.target.value })}>
              {data.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Forma de pagamento" className="lg:col-span-3">
            <select className={inputClass} value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })}>
              {paymentMethods().map((method) => (
                <option key={method}>{method}</option>
              ))}
            </select>
          </Field>
          <div className="flex flex-wrap items-end gap-4 lg:col-span-3">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.checked })} />
              Recorrente
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={form.fixed} onChange={(event) => setForm({ ...form, fixed: event.target.checked })} />
              Fixa
            </label>
          </div>
          <Field label="Observações" className="lg:col-span-12">
            <input className={inputClass} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Field>
        </form>
      </Panel>

      <Panel>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <select className={inputClass} value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}>
            <option value="todos">Todas as categorias</option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select className={inputClass} value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="todos">Todos os status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="vencido">Vencido</option>
          </select>
          <select className={inputClass} value={filters.fixed} onChange={(event) => setFilters({ ...filters, fixed: event.target.value })}>
            <option value="todos">Fixas e variáveis</option>
            <option value="true">Fixas</option>
            <option value="false">Variáveis</option>
          </select>
        </div>

        <TableShell>
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Conta</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredExpenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-4 py-3">{formatDate(expense.dueDate)}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{expense.description}</td>
                <td className="px-4 py-3">{getCategoryName(data.categories, expense.categoryId)}</td>
                <td className="px-4 py-3">{getAccountName(data.accounts, expense.accountId)}</td>
                <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(expense.amount)}</td>
                <td className="px-4 py-3">{statusBadge(expense.status)}</td>
                <td className="px-4 py-3">{expense.fixed ? 'fixa' : 'variável'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {expense.status !== 'pago' ? (
                      <Button variant="ghost" className="min-h-8 px-2 py-1" onClick={() => actions.markExpensePaid(expense.id)}>
                        <CheckCircle2 size={14} />
                      </Button>
                    ) : null}
                    <ConfirmDeleteButton onConfirm={() => actions.removeRecord('expenses', expense.id)} />
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
