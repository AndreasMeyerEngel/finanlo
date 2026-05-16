import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  CategorySeriesItem,
  DebtEvolutionItem,
  FutureInstallmentItem,
  InvoiceSeriesItem,
  MonthSeriesItem,
} from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { Panel } from '../UI';

function ChartTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h3>
      {subtitle ? <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p> : null}
    </div>
  );
}

const currencyTooltipFormatter = (value: number | string) => formatCurrency(Number(value));

export function MonthlyComparisonChart({ data }: { data: MonthSeriesItem[] }) {
  return (
    <Panel className="min-h-[360px]">
      <ChartTitle title="Receitas x despesas" subtitle="Últimos 12 meses com saldo final por mês" />
      <div className="h-60 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${Number(value) / 1000}k`} />
            <Tooltip formatter={currencyTooltipFormatter} />
            <Legend />
            <Bar dataKey="receitas" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="despesas" fill="#ef4444" radius={[6, 6, 0, 0]} />
            <Line type="monotone" dataKey="saldo" stroke="#2563eb" strokeWidth={3} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function CategoryDonutChart({ data, title = 'Despesas por categoria' }: { data: CategorySeriesItem[]; title?: string }) {
  return (
    <Panel className="min-h-[360px]">
      <ChartTitle title={title} subtitle="Distribuição dos gastos no mês atual" />
      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
        <div className="h-60 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={104} paddingAngle={3}>
                {data.map((item) => (
                  <Cell key={item.name} fill={item.color} />
                ))}
              </Pie>
              <Tooltip formatter={currencyTooltipFormatter} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid content-center gap-2">
          {data.slice(0, 7).map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.name}</span>
              </span>
              <strong className="text-slate-900 dark:text-white">{formatCurrency(item.value)}</strong>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

export function DebtEvolutionChart({ data }: { data: DebtEvolutionItem[] }) {
  return (
    <Panel className="min-h-[360px]">
      <ChartTitle title="Evolução das dívidas" subtitle="Valor restante, pago e progresso de quitação" />
      <div className="h-60 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${Number(value) / 1000}k`} />
            <Tooltip formatter={currencyTooltipFormatter} />
            <Legend />
            <Area type="monotone" dataKey="restante" stroke="#f97316" fill="#fed7aa" strokeWidth={3} />
            <Area type="monotone" dataKey="pago" stroke="#22c55e" fill="#bbf7d0" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function FutureInstallmentsChart({ data }: { data: FutureInstallmentItem[] }) {
  return (
    <Panel className="min-h-[320px]">
      <ChartTitle title="Parcelas futuras" subtitle="Próximos 12 meses de compromissos previstos" />
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${Number(value) / 1000}k`} />
            <Tooltip formatter={currencyTooltipFormatter} />
            <Bar dataKey="parcelas" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function InvoiceChart({ data }: { data: InvoiceSeriesItem[] }) {
  return (
    <Panel className="min-h-[320px]">
      <ChartTitle title="Faturas em 12 meses" subtitle="Total, pago e aberto por mês" />
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${Number(value) / 1000}k`} />
            <Tooltip formatter={currencyTooltipFormatter} />
            <Legend />
            <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
            <Bar dataKey="pago" fill="#22c55e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="aberto" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

export function SimpleLineChart({
  title,
  subtitle,
  data,
  lines,
}: {
  title: string;
  subtitle?: string;
  data: Array<Record<string, string | number>>;
  lines: Array<{ key: string; color: string; name?: string }>;
}) {
  return (
    <Panel className="min-h-[320px]">
      <ChartTitle title={title} subtitle={subtitle} />
      <div className="h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
            <YAxis tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${Number(value) / 1000}k`} />
            <Tooltip formatter={currencyTooltipFormatter} />
            <Legend />
            {lines.map((line) => (
              <Line key={line.key} type="monotone" dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={3} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}
