import { describe, expect, it } from 'vitest';
import { createEmptyFinanceData } from '../data/emptyData';
import type { Debt, FinanceData, Invoice } from '../types/finance';
import {
  buildDebtFutureInstallmentsSeries,
  buildFutureInstallmentsSeries,
  buildInvoiceSeries,
  calculateDashboardMetrics,
} from './calculations';

function buildFinanceData(): FinanceData {
  const data = createEmptyFinanceData('Teste');
  const invoice: Invoice = {
    id: 'invoice-card-2026-05',
    cardId: 'card-1',
    month: '2026-05',
    totalAmount: 450,
    paidAmount: 50,
    dueDate: '2026-05-25',
    status: 'aberta',
  };
  const debt: Debt = {
    id: 'debt-1',
    name: 'Dívida Teste',
    creditor: 'Credor Teste',
    type: 'Empréstimo',
    totalAmount: 1200,
    paidAmount: 0,
    totalInstallments: 12,
    paidInstallments: 0,
    installmentAmount: 100,
    startDate: '2026-05-01',
    monthlyDueDay: 10,
    status: 'ativa',
    priority: 'media',
  };

  return {
    ...data,
    settings: {
      ...data.settings,
      monthlyIncome: 5000,
    },
    invoices: [invoice],
    debts: [debt],
  };
}

describe('financial calculations', () => {
  it('keeps card invoices out of the debt-only future installments series', () => {
    const data = buildFinanceData();
    const referenceDate = new Date('2026-05-18T12:00:00');

    const allCommitments = buildFutureInstallmentsSeries(data, referenceDate);
    const debtOnly = buildDebtFutureInstallmentsSeries(data, referenceDate);

    expect(allCommitments[0]).toMatchObject({ month: '2026-05', parcelas: 500 });
    expect(debtOnly[0]).toMatchObject({ month: '2026-05', parcelas: 100 });
  });

  it('does not count open card invoices as registered debts', () => {
    const data = buildFinanceData();
    const metrics = calculateDashboardMetrics(data, new Date('2026-05-18T12:00:00'));

    expect(metrics.totalDebt).toBe(1200);
    expect(metrics.activeDebts).toBe(1);
    expect(metrics.availableThisMonth).toBe(-500);
  });

  it('shows future card invoices in the invoice chart window', () => {
    const data = buildFinanceData();
    data.invoices = [
      {
        id: 'invoice-card-2026-06',
        cardId: 'card-1',
        month: '2026-06',
        totalAmount: 16.9,
        paidAmount: 0,
        dueDate: '2026-06-11',
        status: 'aberta',
      },
    ];

    const invoiceSeries = buildInvoiceSeries(data, new Date('2026-05-18T12:00:00'));

    expect(invoiceSeries[0].month).toBe('2026-05');
    expect(invoiceSeries[1]).toMatchObject({
      month: '2026-06',
      total: 16.9,
      aberto: 16.9,
    });
  });
});
