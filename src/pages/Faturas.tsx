import { CheckCircle2, Plus } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { InvoiceChart } from '../components/Charts/FinanceCharts';
import { Badge, Button, Field, Panel, SectionHeader, StatCard, TableShell, inputClass } from '../components/UI';
import { formatCurrency, formatDate, getMonthKey, parseCurrencyInput, toIsoDate } from '../utils/formatters';
import { getCategoryName, statusBadge } from './helpers';
import type { PageProps } from './PageProps';

export function Faturas({ controller }: PageProps) {
  const { data, invoiceSeries, actions } = controller;
  const expenseCategories = data.categories.filter((category) => category.active && category.type !== 'receita');
  const [cardForm, setCardForm] = useState({
    name: '',
    bank: '',
    totalLimit: '',
    closingDay: 15,
    dueDay: 25,
    color: '#2563eb',
  });
  const [purchaseForm, setPurchaseForm] = useState({
    description: '',
    totalAmount: '',
    purchaseDate: toIsoDate(new Date()),
    categoryId: expenseCategories[0]?.id ?? '',
    cardId: data.creditCards[0]?.id ?? '',
    billingMode: 'parcelado',
    installments: 1,
    notes: '',
  });

  const currentMonth = getMonthKey(new Date());
  const currentInvoices = useMemo(() => data.invoices.filter((invoice) => invoice.month === currentMonth), [data.invoices, currentMonth]);
  const invoiceTotal = currentInvoices.reduce((total, invoice) => total + invoice.totalAmount, 0);
  const invoicePaid = currentInvoices.reduce((total, invoice) => total + invoice.paidAmount, 0);
  const invoiceOpen = invoiceTotal - invoicePaid;
  const purchaseAmount = parseCurrencyInput(purchaseForm.totalAmount);
  const installmentPreview =
    purchaseForm.billingMode === 'recorrente'
      ? purchaseAmount
      : purchaseAmount / Math.max(1, Number(purchaseForm.installments));

  function handleCardSubmit(event: FormEvent) {
    event.preventDefault();
    const totalLimit = parseCurrencyInput(cardForm.totalLimit);

    if (!cardForm.name.trim() || !cardForm.bank.trim() || !totalLimit) {
      window.alert('Preencha nome, banco e limite do cartão.');
      return;
    }

    actions.addCreditCard({
      name: cardForm.name.trim(),
      bank: cardForm.bank.trim(),
      totalLimit,
      availableLimit: totalLimit,
      closingDay: Number(cardForm.closingDay),
      dueDay: Number(cardForm.dueDay),
      color: cardForm.color,
    });
    setCardForm({ ...cardForm, name: '', bank: '', totalLimit: '' });
  }

  function handlePurchaseSubmit(event: FormEvent) {
    event.preventDefault();
    const totalAmount = parseCurrencyInput(purchaseForm.totalAmount);

    if (!purchaseForm.description.trim() || !totalAmount || !purchaseForm.cardId) {
      window.alert('Preencha descrição, valor e cartão.');
      return;
    }

    actions.addCardPurchase({
      description: purchaseForm.description.trim(),
      totalAmount,
      purchaseDate: purchaseForm.purchaseDate,
      categoryId: purchaseForm.categoryId,
      cardId: purchaseForm.cardId,
      billingMode: purchaseForm.billingMode as 'parcelado' | 'recorrente',
      installments: Number(purchaseForm.installments),
      notes: purchaseForm.notes,
    });
    setPurchaseForm({ ...purchaseForm, description: '', totalAmount: '', notes: '' });
  }

  return (
    <div className="grid gap-6">
      <SectionHeader title="Faturas" description="Cadastre cartões, compras parceladas e acompanhe faturas mensais." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Faturas do mês" value={formatCurrency(invoiceTotal)} tone="blue" />
        <StatCard title="Valor pago" value={formatCurrency(invoicePaid)} tone="green" />
        <StatCard title="Valor em aberto" value={formatCurrency(invoiceOpen)} tone="orange" />
        <StatCard title="Cartões cadastrados" value={String(data.creditCards.length)} tone="purple" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel>
          <h3 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">Cadastrar cartão</h3>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCardSubmit}>
            <Field label="Nome do cartão">
              <input className={inputClass} value={cardForm.name} onChange={(event) => setCardForm({ ...cardForm, name: event.target.value })} />
            </Field>
            <Field label="Banco">
              <input className={inputClass} value={cardForm.bank} onChange={(event) => setCardForm({ ...cardForm, bank: event.target.value })} />
            </Field>
            <Field label="Limite total">
              <input className={inputClass} value={cardForm.totalLimit} onChange={(event) => setCardForm({ ...cardForm, totalLimit: event.target.value })} />
            </Field>
            <Field label="Cor">
              <input className={inputClass} type="color" value={cardForm.color} onChange={(event) => setCardForm({ ...cardForm, color: event.target.value })} />
            </Field>
            <Field label="Fechamento">
              <input
                className={inputClass}
                type="number"
                min={1}
                max={31}
                value={cardForm.closingDay}
                onChange={(event) => setCardForm({ ...cardForm, closingDay: Number(event.target.value) })}
              />
            </Field>
            <Field label="Vencimento">
              <input
                className={inputClass}
                type="number"
                min={1}
                max={31}
                value={cardForm.dueDay}
                onChange={(event) => setCardForm({ ...cardForm, dueDay: Number(event.target.value) })}
              />
            </Field>
            <Button type="submit" className="md:col-span-2">
              <Plus size={18} />
              Adicionar cartão
            </Button>
          </form>
        </Panel>

        <Panel>
          <h3 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">Cadastrar compra no cartão</h3>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handlePurchaseSubmit}>
            <Field label="Descrição da compra">
              <input
                className={inputClass}
                value={purchaseForm.description}
                onChange={(event) => setPurchaseForm({ ...purchaseForm, description: event.target.value })}
              />
            </Field>
            <Field label="Valor total">
              <input
                className={inputClass}
                value={purchaseForm.totalAmount}
                onChange={(event) => setPurchaseForm({ ...purchaseForm, totalAmount: event.target.value })}
              />
            </Field>
            <Field label="Tipo de lançamento">
              <select
                className={inputClass}
                value={purchaseForm.billingMode}
                onChange={(event) => setPurchaseForm({ ...purchaseForm, billingMode: event.target.value })}
              >
                <option value="parcelado">Parcelar valor total</option>
                <option value="recorrente">Repetir mesmo valor</option>
              </select>
            </Field>
            <Field label="Data da compra">
              <input
                className={inputClass}
                type="date"
                value={purchaseForm.purchaseDate}
                onChange={(event) => setPurchaseForm({ ...purchaseForm, purchaseDate: event.target.value })}
              />
            </Field>
            <Field label="Categoria">
              <select
                className={inputClass}
                value={purchaseForm.categoryId}
                onChange={(event) => setPurchaseForm({ ...purchaseForm, categoryId: event.target.value })}
              >
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Cartão utilizado">
              <select className={inputClass} value={purchaseForm.cardId} onChange={(event) => setPurchaseForm({ ...purchaseForm, cardId: event.target.value })}>
                {data.creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={purchaseForm.billingMode === 'recorrente' ? 'Meses recorrentes' : 'Parcelas'}>
              <input
                className={inputClass}
                type="number"
                min={1}
                max={48}
                value={purchaseForm.installments}
                onChange={(event) => setPurchaseForm({ ...purchaseForm, installments: Number(event.target.value) })}
              />
            </Field>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950 md:col-span-2">
              <p className="text-slate-500 dark:text-slate-400">
                {purchaseForm.billingMode === 'recorrente' ? 'Valor mensal recorrente' : 'Valor da parcela'}
              </p>
              <strong className="mt-1 block text-xl text-slate-950 dark:text-white">{formatCurrency(installmentPreview)}</strong>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {purchaseForm.billingMode === 'recorrente'
                  ? `${purchaseForm.installments} mês(es) de ${formatCurrency(installmentPreview)}.`
                  : `${purchaseForm.installments} parcela(s) de ${formatCurrency(installmentPreview)}.`}
              </p>
            </div>
            <Field label="Observações" className="md:col-span-2">
              <input className={inputClass} value={purchaseForm.notes} onChange={(event) => setPurchaseForm({ ...purchaseForm, notes: event.target.value })} />
            </Field>
            <Button type="submit" className="md:col-span-2">
              <Plus size={18} />
              Adicionar compra
            </Button>
          </form>
        </Panel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.creditCards.map((card) => (
          <Panel key={card.id} className="relative overflow-hidden">
            <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: card.color }} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950 dark:text-white">{card.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{card.bank}</p>
              </div>
              <Badge tone="blue">vence dia {card.dueDay}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500 dark:text-slate-400">Limite total</p>
                <strong>{formatCurrency(card.totalLimit)}</strong>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Disponível</p>
                <strong>{formatCurrency(card.availableLimit)}</strong>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Fechamento</p>
                <strong>dia {card.closingDay}</strong>
              </div>
              <div>
                <p className="text-slate-500 dark:text-slate-400">Compras</p>
                <strong>{data.cardPurchases.filter((purchase) => purchase.cardId === card.id).length}</strong>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <InvoiceChart data={invoiceSeries} />

      <Panel>
        <h3 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">Faturas mensais</h3>
        <TableShell>
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Cartão</th>
              <th className="px-4 py-3">Mês</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Pago</th>
              <th className="px-4 py-3">Aberto</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.invoices.map((invoice) => {
              const card = data.creditCards.find((item) => item.id === invoice.cardId);
              return (
                <tr key={invoice.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{card?.name ?? 'Cartão'}</td>
                  <td className="px-4 py-3">{invoice.month}</td>
                  <td className="px-4 py-3">{formatCurrency(invoice.totalAmount)}</td>
                  <td className="px-4 py-3 text-emerald-600">{formatCurrency(invoice.paidAmount)}</td>
                  <td className="px-4 py-3 text-orange-600">{formatCurrency(Math.max(0, invoice.totalAmount - invoice.paidAmount))}</td>
                  <td className="px-4 py-3">{formatDate(invoice.dueDate)}</td>
                  <td className="px-4 py-3">{statusBadge(invoice.status)}</td>
                  <td className="px-4 py-3">
                    {invoice.status !== 'paga' ? (
                      <Button variant="ghost" className="min-h-8 px-2 py-1" onClick={() => actions.markInvoicePaid(invoice.id)}>
                        <CheckCircle2 size={14} />
                        Pagar
                      </Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      </Panel>

      <Panel>
        <h3 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">Compras das faturas</h3>
        <TableShell minWidth="min-w-[700px]">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Compra</th>
              <th className="px-4 py-3">Cartão</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Parcelas</th>
              <th className="px-4 py-3">Parcela</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.cardPurchases.map((purchase) => {
              const card = data.creditCards.find((item) => item.id === purchase.cardId);
              return (
                <tr key={purchase.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{purchase.description}</td>
                  <td className="px-4 py-3">{card?.name ?? 'Cartão'}</td>
                  <td className="px-4 py-3">{formatDate(purchase.purchaseDate)}</td>
                  <td className="px-4 py-3">{getCategoryName(data.categories, purchase.categoryId)}</td>
                  <td className="px-4 py-3">{purchase.billingMode === 'recorrente' ? 'recorrente' : 'parcelado'}</td>
                  <td className="px-4 py-3">
                    {purchase.currentInstallment}/{purchase.installments}
                  </td>
                  <td className="px-4 py-3">{formatCurrency(purchase.installmentAmount)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(purchase.totalAmount)}</td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
