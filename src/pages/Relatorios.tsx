import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  CategoryDonutChart,
  DebtEvolutionChart,
  FutureInstallmentsChart,
  InvoiceChart,
  MonthlyComparisonChart,
} from '../components/Charts/FinanceCharts';
import { Button, Panel, SectionHeader, TableShell, inputClass } from '../components/UI';
import { formatCurrency, formatDate, sanitizeFileName } from '../utils/formatters';
import { getAccountName, getCategoryName, statusBadge } from './helpers';
import type { PageProps } from './PageProps';

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function Relatorios({ controller }: PageProps) {
  const { data, monthlySeries, categorySeries, debtEvolution, invoiceSeries, futureInstallments } = controller;
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    categoryId: 'todos',
    type: 'todos',
    status: 'todos',
    accountId: 'todos',
    cardId: 'todos',
    creditor: 'todos',
  });

  const filteredTransactions = useMemo(
    () =>
      data.transactions.filter((transaction) => {
        if (filters.startDate && transaction.date < filters.startDate) return false;
        if (filters.endDate && transaction.date > filters.endDate) return false;
        if (filters.categoryId !== 'todos' && transaction.categoryId !== filters.categoryId) return false;
        if (filters.type !== 'todos' && transaction.type !== filters.type) return false;
        if (filters.status !== 'todos' && transaction.status !== filters.status) return false;
        if (filters.accountId !== 'todos' && transaction.accountId !== filters.accountId) return false;
        return true;
      }),
    [data.transactions, filters],
  );

  const creditors = Array.from(new Set(data.debts.map((debt) => debt.creditor))).sort();
  const totals = {
    receitas: filteredTransactions.filter((item) => item.type === 'receita').reduce((total, item) => total + item.amount, 0),
    despesas: filteredTransactions.filter((item) => item.type === 'despesa').reduce((total, item) => total + item.amount, 0),
    pagoDividas: data.debts.reduce((total, debt) => total + debt.paidAmount, 0),
    restanteDividas: data.debts.reduce((total, debt) => total + Math.max(0, (debt.totalInstallments - debt.paidInstallments) * debt.installmentAmount), 0),
  };

  function buildCsv() {
    const rows = [
      ['Data', 'Descrição', 'Tipo', 'Categoria', 'Conta', 'Forma', 'Status', 'Valor'],
      ...filteredTransactions.map((transaction) => [
        formatDate(transaction.date),
        transaction.description,
        transaction.type,
        getCategoryName(data.categories, transaction.categoryId),
        getAccountName(data.accounts, transaction.accountId),
        transaction.paymentMethod,
        transaction.status,
        String(transaction.amount).replace('.', ','),
      ]),
    ];

    return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')).join('\n');
  }

  function exportCsv() {
    downloadFile(`relatorio-${sanitizeFileName(new Date().toISOString())}.csv`, buildCsv(), 'text/csv;charset=utf-8');
  }

  function exportExcel() {
    const rows = buildCsv()
      .split('\n')
      .map((row) => `<tr>${row.split(';').map((cell) => `<td>${cell.replace(/^"|"$/g, '')}</td>`).join('')}</tr>`)
      .join('');
    downloadFile('relatorio-finanlo.xls', `<table>${rows}</table>`, 'application/vnd.ms-excel;charset=utf-8');
  }

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Relatórios"
        description="Filtros, gráficos e exportação para analisar sua evolução financeira."
        action={
          <>
            <Button variant="secondary" onClick={exportCsv}>
              <Download size={18} />
              CSV
            </Button>
            <Button variant="secondary" onClick={exportExcel}>
              <FileSpreadsheet size={18} />
              Excel
            </Button>
            <Button variant="secondary" onClick={() => window.print()}>
              <Printer size={18} />
              PDF
            </Button>
          </>
        }
      />

      <Panel>
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
          <input className={inputClass} type="date" value={filters.startDate} onChange={(event) => setFilters({ ...filters, startDate: event.target.value })} />
          <input className={inputClass} type="date" value={filters.endDate} onChange={(event) => setFilters({ ...filters, endDate: event.target.value })} />
          <select className={inputClass} value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}>
            <option value="todos">Categoria</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select className={inputClass} value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })}>
            <option value="todos">Tipo</option>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
          <select className={inputClass} value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
            <option value="todos">Status</option>
            <option value="pago">Pago</option>
            <option value="pendente">Pendente</option>
            <option value="vencido">Vencido</option>
          </select>
          <select className={inputClass} value={filters.accountId} onChange={(event) => setFilters({ ...filters, accountId: event.target.value })}>
            <option value="todos">Conta</option>
            {data.accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          <select className={inputClass} value={filters.creditor} onChange={(event) => setFilters({ ...filters, creditor: event.target.value })}>
            <option value="todos">Credor</option>
            {creditors.map((creditor) => (
              <option key={creditor}>{creditor}</option>
            ))}
          </select>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <p className="text-sm text-slate-500 dark:text-slate-400">Receitas filtradas</p>
          <strong className="mt-2 block text-2xl text-emerald-600">{formatCurrency(totals.receitas)}</strong>
        </Panel>
        <Panel>
          <p className="text-sm text-slate-500 dark:text-slate-400">Despesas filtradas</p>
          <strong className="mt-2 block text-2xl text-red-600">{formatCurrency(totals.despesas)}</strong>
        </Panel>
        <Panel>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total pago em dívidas</p>
          <strong className="mt-2 block text-2xl text-emerald-600">{formatCurrency(totals.pagoDividas)}</strong>
        </Panel>
        <Panel>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total restante em dívidas</p>
          <strong className="mt-2 block text-2xl text-orange-600">{formatCurrency(totals.restanteDividas)}</strong>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MonthlyComparisonChart data={monthlySeries} />
        <CategoryDonutChart data={categorySeries} title="Gastos por categoria" />
        <DebtEvolutionChart data={debtEvolution} />
        <InvoiceChart data={invoiceSeries} />
        <FutureInstallmentsChart data={futureInstallments} />
      </div>

      <Panel>
        <h3 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">Lançamentos filtrados</h3>
        <TableShell>
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Conta</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Valor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-3">{formatDate(transaction.date)}</td>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{transaction.description}</td>
                <td className="px-4 py-3">{transaction.type}</td>
                <td className="px-4 py-3">{getCategoryName(data.categories, transaction.categoryId)}</td>
                <td className="px-4 py-3">{getAccountName(data.accounts, transaction.accountId)}</td>
                <td className="px-4 py-3">{statusBadge(transaction.status)}</td>
                <td className="px-4 py-3 font-semibold">{formatCurrency(transaction.amount)}</td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
