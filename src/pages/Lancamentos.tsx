import { CheckCircle2, Edit2, Plus } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { Button, ConfirmDeleteButton, Field, Panel, SectionHeader, TableShell, inputClass } from '../components/UI';
import type { Transaction } from '../types/finance';
import { formatCurrency, formatDate, parseCurrencyInput, toIsoDate } from '../utils/formatters';
import { getAccountName, getCategoryName, paymentMethods, statusBadge } from './helpers';
import type { PageProps } from './PageProps';

const initialFilters = {
  type: 'todos',
  categoryId: 'todos',
  status: 'todos',
  paymentMethod: 'todos',
  date: '',
};

export function Lancamentos({ controller }: PageProps) {
  const { data, actions } = controller;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [form, setForm] = useState({
    type: 'despesa',
    description: '',
    amount: '',
    date: toIsoDate(new Date()),
    categoryId: data.categories.find((category) => category.type !== 'receita')?.id ?? '',
    accountId: data.accounts[0]?.id ?? '',
    paymentMethod: 'Pix',
    notes: '',
    recurring: false,
    installment: false,
    status: 'pendente',
  });

  const categories = useMemo(
    () => data.categories.filter((category) => category.active && (category.type === form.type || category.type === 'ambos')),
    [data.categories, form.type],
  );

  const filteredTransactions = useMemo(
    () =>
      data.transactions.filter((transaction) => {
        if (filters.type !== 'todos' && transaction.type !== filters.type) return false;
        if (filters.categoryId !== 'todos' && transaction.categoryId !== filters.categoryId) return false;
        if (filters.status !== 'todos' && transaction.status !== filters.status) return false;
        if (filters.paymentMethod !== 'todos' && transaction.paymentMethod !== filters.paymentMethod) return false;
        if (filters.date && transaction.date !== filters.date) return false;
        return true;
      }),
    [data.transactions, filters],
  );

  function resetForm() {
    setEditingId(null);
    setForm({
      type: 'despesa',
      description: '',
      amount: '',
      date: toIsoDate(new Date()),
      categoryId: data.categories.find((category) => category.type !== 'receita')?.id ?? '',
      accountId: data.accounts[0]?.id ?? '',
      paymentMethod: 'Pix',
      notes: '',
      recurring: false,
      installment: false,
      status: 'pendente',
    });
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const payload: Omit<Transaction, 'id'> = {
      type: form.type as Transaction['type'],
      description: form.description.trim(),
      amount: parseCurrencyInput(form.amount),
      date: form.date,
      categoryId: form.categoryId,
      accountId: form.accountId,
      paymentMethod: form.paymentMethod,
      notes: form.notes,
      recurring: form.recurring,
      installment: form.installment,
      status: form.status as Transaction['status'],
      source: 'manual',
    };

    if (!payload.description || !payload.amount || !payload.categoryId) {
      window.alert('Preencha descrição, valor e categoria.');
      return;
    }

    if (editingId) {
      actions.updateTransaction(editingId, payload);
    } else {
      actions.addTransaction(payload);
    }

    resetForm();
  }

  return (
    <div className="grid gap-6">
      <SectionHeader title="Lançamentos" description="Registre qualquer movimentação financeira e acompanhe o status de pagamento." />

      <Panel>
        <form className="grid gap-4 lg:grid-cols-12" onSubmit={handleSubmit}>
          <Field label="Tipo" className="lg:col-span-2">
            <select
              className={inputClass}
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value,
                  categoryId: data.categories.find((category) => category.type === event.target.value || category.type === 'ambos')?.id ?? '',
                }))
              }
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </Field>
          <Field label="Descrição" className="lg:col-span-4">
            <input className={inputClass} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
          </Field>
          <Field label="Valor" className="lg:col-span-2">
            <input className={inputClass} value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="R$ 0,00" />
          </Field>
          <Field label="Data" className="lg:col-span-2">
            <input className={inputClass} type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </Field>
          <Field label="Status" className="lg:col-span-2">
            <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="pago">pago</option>
              <option value="pendente">pendente</option>
              <option value="vencido">vencido</option>
            </select>
          </Field>
          <Field label="Categoria" className="lg:col-span-3">
            <select className={inputClass} value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}>
              {categories.map((category) => (
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
          <Field label="Observações" className="lg:col-span-3">
            <input className={inputClass} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Field>
          <div className="flex flex-wrap items-end gap-4 lg:col-span-8">
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.checked })} />
              Recorrente
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={form.installment} onChange={(event) => setForm({ ...form, installment: event.target.checked })} />
              Parcelado
            </label>
          </div>
          <div className="flex items-end gap-2 lg:col-span-4">
            <Button type="submit" className="w-full">
              <Plus size={18} />
              {editingId ? 'Salvar edição' : 'Adicionar lançamento'}
            </Button>
            {editingId ? (
              <Button variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
            ) : null}
          </div>
        </form>
      </Panel>

      <Panel>
        <div className="mb-4 grid gap-3 md:grid-cols-5">
          <select className={inputClass} value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
            <option value="todos">Todos os tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
          <select className={inputClass} value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}>
            <option value="todos">Todas as categorias</option>
            {data.categories.map((category) => (
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
          <select
            className={inputClass}
            value={filters.paymentMethod}
            onChange={(event) => setFilters({ ...filters, paymentMethod: event.target.value })}
          >
            <option value="todos">Todas as formas</option>
            {paymentMethods().map((method) => (
              <option key={method}>{method}</option>
            ))}
          </select>
          <input className={inputClass} type="date" value={filters.date} onChange={(event) => setFilters({ ...filters, date: event.target.value })} />
        </div>

        <TableShell>
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Forma</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3">{formatDate(transaction.date)}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{transaction.description}</td>
                <td className="px-4 py-3">{transaction.type}</td>
                <td className="px-4 py-3">{getCategoryName(data.categories, transaction.categoryId)}</td>
                <td className={transaction.type === 'receita' ? 'px-4 py-3 font-semibold text-emerald-600' : 'px-4 py-3 font-semibold text-red-600'}>
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-4 py-3">{transaction.paymentMethod}</td>
                <td className="px-4 py-3">{statusBadge(transaction.status)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    <Button
                      variant="ghost"
                      className="min-h-8 px-2 py-1"
                      onClick={() => {
                        setEditingId(transaction.id);
                        setForm({
                          type: transaction.type,
                          description: transaction.description,
                          amount: String(transaction.amount).replace('.', ','),
                          date: transaction.date,
                          categoryId: transaction.categoryId,
                          accountId: transaction.accountId,
                          paymentMethod: transaction.paymentMethod,
                          notes: transaction.notes ?? '',
                          recurring: transaction.recurring,
                          installment: transaction.installment,
                          status: transaction.status,
                        });
                      }}
                    >
                      <Edit2 size={14} />
                    </Button>
                    {transaction.status !== 'pago' ? (
                      <Button variant="ghost" className="min-h-8 px-2 py-1" onClick={() => actions.markTransactionPaid(transaction.id)}>
                        <CheckCircle2 size={14} />
                      </Button>
                    ) : null}
                    <ConfirmDeleteButton onConfirm={() => actions.removeRecord('transactions', transaction.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {filteredTransactions.length} lançamentos encontrados. Conta padrão: {getAccountName(data.accounts, form.accountId)}.
        </p>
      </Panel>
    </div>
  );
}
