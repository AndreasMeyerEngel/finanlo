import { CheckCircle2, Edit2, Plus, ShieldAlert } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { CategoryDonutChart, DebtEvolutionChart, FutureInstallmentsChart } from '../components/Charts/FinanceCharts';
import { Button, ConfirmDeleteButton, Field, Panel, SectionHeader, StatCard, TableShell, inputClass } from '../components/UI';
import type { Debt } from '../types/finance';
import {
  buildDebtCreditorSeries,
  buildDebtPrioritySeries,
  getDebtNextDueDate,
  getDebtProgress,
  getDebtRemaining,
} from '../utils/calculations';
import { formatCurrency, formatDate, parseCurrencyInput, toIsoDate } from '../utils/formatters';
import { debtTypes, priorityBadge, statusBadge } from './helpers';
import type { PageProps } from './PageProps';

const initialForm = {
  name: '',
  creditor: '',
  type: 'Empréstimo',
  totalAmount: '',
  paidAmount: '0',
  totalInstallments: 1,
  paidInstallments: 0,
  installmentAmount: '',
  startDate: toIsoDate(new Date()),
  monthlyDueDay: 10,
  interestRate: '',
  status: 'ativa',
  priority: 'media',
  notes: '',
};

export function Dividas({ controller }: PageProps) {
  const { data, metrics, debtEvolution, debtFutureInstallments, actions } = controller;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);

  const creditorSeries = useMemo(() => buildDebtCreditorSeries(data), [data]);
  const prioritySeries = useMemo(() => buildDebtPrioritySeries(data), [data]);
  const remainingPreview = Math.max(
    0,
    form.totalInstallments > 0
      ? (Number(form.totalInstallments) - Number(form.paidInstallments)) * parseCurrencyInput(form.installmentAmount)
      : parseCurrencyInput(form.totalAmount) - parseCurrencyInput(form.paidAmount),
  );

  function resetForm() {
    setEditingId(null);
    setForm(initialForm);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const totalAmount = parseCurrencyInput(form.totalAmount);
    const paidAmount = parseCurrencyInput(form.paidAmount);
    const installmentAmount = parseCurrencyInput(form.installmentAmount);

    if (!form.name.trim() || !form.creditor.trim() || !totalAmount || !installmentAmount) {
      window.alert('Preencha nome, credor, valor total e valor da parcela.');
      return;
    }

    const payload: Omit<Debt, 'id'> = {
      name: form.name.trim(),
      creditor: form.creditor.trim(),
      type: form.type,
      totalAmount,
      paidAmount,
      totalInstallments: Number(form.totalInstallments),
      paidInstallments: Number(form.paidInstallments),
      installmentAmount,
      startDate: form.startDate,
      monthlyDueDay: Number(form.monthlyDueDay),
      interestRate: form.interestRate ? Number(String(form.interestRate).replace(',', '.')) : undefined,
      status: form.status as Debt['status'],
      priority: form.priority as Debt['priority'],
      notes: form.notes,
    };

    if (editingId) {
      actions.updateDebt(editingId, payload);
    } else {
      actions.addDebt(payload);
    }

    resetForm();
  }

  return (
    <div className="grid gap-6">
      <SectionHeader title="Gestão de Dívidas" description="Controle dívidas parceladas, pagamentos, prioridades e projeções futuras." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Valor total original" value={formatCurrency(metrics.debtOriginalTotal)} tone="orange" />
        <StatCard title="Valor já pago" value={formatCurrency(metrics.debtPaidTotal)} tone="green" />
        <StatCard title="Valor restante" value={formatCurrency(metrics.debtRemainingTotal)} tone="red" />
        <StatCard title="Dívidas ativas" value={String(metrics.activeDebts)} tone="purple" />
        <StatCard title="Dívidas quitadas" value={String(metrics.paidDebts)} tone="green" />
        <StatCard title="Parcelas do mês atual" value={formatCurrency(metrics.monthlyDebtInstallments)} tone="blue" />
        <StatCard
          title="Próxima a vencer"
          value={metrics.nextDueDebt ? metrics.nextDueDebt.name : '-'}
          helper={metrics.nextDueDebt ? formatDate(getDebtNextDueDate(metrics.nextDueDebt)) : undefined}
          tone="yellow"
        />
        <StatCard title="Mais crítica" value={metrics.criticalDebt ? metrics.criticalDebt.name : '-'} tone="red" />
      </div>

      <Panel>
        <h3 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">{editingId ? 'Editar dívida' : 'Cadastrar dívida'}</h3>
        <form className="grid gap-4 lg:grid-cols-12" onSubmit={handleSubmit}>
          <Field label="Nome da dívida" className="lg:col-span-3">
            <input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Credor ou instituição" className="lg:col-span-3">
            <input className={inputClass} value={form.creditor} onChange={(event) => setForm({ ...form, creditor: event.target.value })} />
          </Field>
          <Field label="Tipo" className="lg:col-span-2">
            <select className={inputClass} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              {debtTypes().map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Field>
          <Field label="Status" className="lg:col-span-2">
            <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="ativa">ativa</option>
              <option value="quitada">quitada</option>
              <option value="renegociada">renegociada</option>
              <option value="atrasada">atrasada</option>
            </select>
          </Field>
          <Field label="Prioridade" className="lg:col-span-2">
            <select className={inputClass} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
              <option value="baixa">baixa</option>
              <option value="media">média</option>
              <option value="alta">alta</option>
              <option value="critica">crítica</option>
            </select>
          </Field>

          <Field label="Valor total" className="lg:col-span-2">
            <input className={inputClass} value={form.totalAmount} onChange={(event) => setForm({ ...form, totalAmount: event.target.value })} />
          </Field>
          <Field label="Valor já pago" className="lg:col-span-2">
            <input className={inputClass} value={form.paidAmount} onChange={(event) => setForm({ ...form, paidAmount: event.target.value })} />
          </Field>
          <Field label="Valor restante" className="lg:col-span-2">
            <input className={inputClass} value={formatCurrency(remainingPreview)} disabled readOnly />
          </Field>
          <Field label="Total de parcelas" className="lg:col-span-2">
            <input
              className={inputClass}
              type="number"
              min={1}
              value={form.totalInstallments}
              onChange={(event) => setForm({ ...form, totalInstallments: Number(event.target.value) })}
            />
          </Field>
          <Field label="Parcelas pagas" className="lg:col-span-2">
            <input
              className={inputClass}
              type="number"
              min={0}
              value={form.paidInstallments}
              onChange={(event) => setForm({ ...form, paidInstallments: Number(event.target.value) })}
            />
          </Field>
          <Field label="Parcelas restantes" className="lg:col-span-2">
            <input className={inputClass} value={Math.max(0, Number(form.totalInstallments) - Number(form.paidInstallments))} disabled readOnly />
          </Field>
          <Field label="Valor da parcela" className="lg:col-span-2">
            <input className={inputClass} value={form.installmentAmount} onChange={(event) => setForm({ ...form, installmentAmount: event.target.value })} />
          </Field>
          <Field label="Data de início" className="lg:col-span-2">
            <input className={inputClass} type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
          </Field>
          <Field label="Vencimento mensal" className="lg:col-span-2">
            <input
              className={inputClass}
              type="number"
              min={1}
              max={31}
              value={form.monthlyDueDay}
              onChange={(event) => setForm({ ...form, monthlyDueDay: Number(event.target.value) })}
            />
          </Field>
          <Field label="Taxa de juros opcional" className="lg:col-span-2">
            <input className={inputClass} value={form.interestRate} onChange={(event) => setForm({ ...form, interestRate: event.target.value })} placeholder="% ao mês" />
          </Field>
          <Field label="Observações" className="lg:col-span-8">
            <input className={inputClass} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
          </Field>
          <div className="flex items-end gap-2 lg:col-span-4">
            <Button type="submit" className="w-full">
              <Plus size={18} />
              {editingId ? 'Salvar dívida' : 'Adicionar dívida'}
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
        <div className="mb-4 flex items-center gap-2">
          <ShieldAlert className="text-amber-500" size={20} />
          <h3 className="text-base font-semibold text-slate-950 dark:text-white">Alertas de dívidas</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {controller.notifications.slice(0, 6).map((notification) => (
            <div key={notification} className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-100">
              {notification}
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">Lista de dívidas</h3>
        <TableShell minWidth="min-w-[1040px]">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Dívida</th>
              <th className="px-4 py-3">Credor</th>
              <th className="px-4 py-3">Valor total</th>
              <th className="px-4 py-3">Restante</th>
              <th className="px-4 py-3">Parcelas</th>
              <th className="px-4 py-3">Parcela</th>
              <th className="px-4 py-3">Próximo vencimento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Prioridade</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.debts.map((debt) => {
              const progress = getDebtProgress(debt);
              return (
                <tr key={debt.id}>
                  <td className="px-4 py-3">
                    <strong className="block text-slate-900 dark:text-white">{debt.name}</strong>
                    <span className="mt-1 block h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                      <span className="block h-2 rounded-full bg-emerald-500" style={{ width: `${progress}%` }} />
                    </span>
                  </td>
                  <td className="px-4 py-3">{debt.creditor}</td>
                  <td className="px-4 py-3">{formatCurrency(debt.totalAmount)}</td>
                  <td className="px-4 py-3 font-semibold text-red-600">{formatCurrency(getDebtRemaining(debt))}</td>
                  <td className="px-4 py-3">
                    {debt.paidInstallments}/{debt.totalInstallments}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(debt.installmentAmount)}</td>
                  <td className="px-4 py-3">{formatDate(getDebtNextDueDate(debt))}</td>
                  <td className="px-4 py-3">{statusBadge(debt.status)}</td>
                  <td className="px-4 py-3">{priorityBadge(debt.priority)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        className="min-h-8 px-2 py-1"
                        onClick={() => {
                          setEditingId(debt.id);
                          setForm({
                            name: debt.name,
                            creditor: debt.creditor,
                            type: debt.type,
                            totalAmount: String(debt.totalAmount).replace('.', ','),
                            paidAmount: String(debt.paidAmount).replace('.', ','),
                            totalInstallments: debt.totalInstallments,
                            paidInstallments: debt.paidInstallments,
                            installmentAmount: String(debt.installmentAmount).replace('.', ','),
                            startDate: debt.startDate,
                            monthlyDueDay: debt.monthlyDueDay,
                            interestRate: debt.interestRate ? String(debt.interestRate).replace('.', ',') : '',
                            status: debt.status,
                            priority: debt.priority,
                            notes: debt.notes ?? '',
                          });
                        }}
                      >
                        <Edit2 size={14} />
                      </Button>
                      {debt.status !== 'quitada' ? (
                        <>
                          <Button variant="ghost" className="min-h-8 px-2 py-1" onClick={() => actions.markDebtInstallmentPaid(debt.id)}>
                            <CheckCircle2 size={14} />
                            Parcela
                          </Button>
                          <Button variant="ghost" className="min-h-8 px-2 py-1" onClick={() => actions.settleDebt(debt.id)}>
                            Quitar
                          </Button>
                        </>
                      ) : null}
                      <ConfirmDeleteButton onConfirm={() => actions.removeRecord('debts', debt.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <DebtEvolutionChart data={debtEvolution} />
        <FutureInstallmentsChart data={debtFutureInstallments} />
        <CategoryDonutChart data={creditorSeries} title="Dívidas por credor" />
        <CategoryDonutChart data={prioritySeries} title="Dívidas por prioridade" />
      </div>
    </div>
  );
}
