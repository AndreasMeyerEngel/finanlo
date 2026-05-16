import clsx from 'clsx';
import type { ReactNode } from 'react';

type Tone = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'slate' | 'yellow';

const toneClasses: Record<Tone, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:ring-blue-400/20',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:ring-emerald-400/20',
  red: 'bg-red-50 text-red-700 ring-red-100 dark:bg-red-500/10 dark:text-red-200 dark:ring-red-400/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-500/10 dark:text-orange-200 dark:ring-orange-400/20',
  purple: 'bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-500/10 dark:text-violet-200 dark:ring-violet-400/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:ring-amber-400/20',
};

export const inputClass =
  'min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-3 focus:ring-brand-100 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-500/20';

export const labelClass = 'text-xs font-semibold uppercase tracking-normal text-slate-500 dark:text-slate-400';

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={clsx(
        'rounded-lg border border-slate-200 bg-white p-3 shadow-soft dark:border-slate-800 dark:bg-slate-900 sm:p-4',
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white sm:text-xl">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{action}</div> : null}
    </div>
  );
}

export function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: Tone }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1', toneClasses[tone])}>
      {children}
    </span>
  );
}

export function Button({
  children,
  variant = 'primary',
  className,
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) {
  const variants = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-200',
    secondary:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-200 dark:text-slate-300 dark:hover:bg-slate-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-200',
  };

  return (
    <button
      type={type}
      className={clsx(
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold outline-none transition focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx('grid gap-1.5', className)}>
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function StatCard({
  title,
  value,
  helper,
  icon,
  tone = 'blue',
}: {
  title: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
  tone?: Tone;
}) {
  return (
    <Panel className="min-h-[108px] p-3 sm:min-h-[124px] sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
          <strong className="mt-2 block break-words text-xl font-semibold text-slate-950 dark:text-white sm:text-2xl">{value}</strong>
        </div>
        {icon ? (
          <span className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1', toneClasses[tone])}>
            {icon}
          </span>
        ) : null}
      </div>
      {helper ? <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{helper}</p> : null}
    </Panel>
  );
}

export function ConfirmDeleteButton({
  onConfirm,
  label = 'Excluir',
}: {
  onConfirm: () => void;
  label?: string;
}) {
  return (
    <Button
      variant="ghost"
      className="min-h-8 px-2 py-1 text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
      onClick={() => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
          onConfirm();
        }
      }}
    >
      {label}
    </Button>
  );
}

export function TableShell({
  children,
  minWidth = 'min-w-[680px] sm:min-w-[760px]',
}: {
  children: ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="table-scroll max-w-full touch-pan-x overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className={clsx('finance-table w-full border-collapse text-left text-xs sm:text-sm', minWidth)}>{children}</table>
    </div>
  );
}
