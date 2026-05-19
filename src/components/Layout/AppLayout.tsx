import {
  ArrowLeftRight,
  Bell,
  CreditCard,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  PieChart,
  Search,
  Settings,
  Sun,
  Tags,
  WalletCards,
  X,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import type { FinanceController } from '../../hooks/useFinanceData';
import type { NavigationItem, PageId } from '../../types/finance';
import { Button } from '../UI';

const navigation: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transacoes', label: 'Transações', icon: ArrowLeftRight },
  { id: 'receitas', label: 'Receitas', icon: WalletCards },
  { id: 'faturas', label: 'Faturas', icon: CreditCard },
  { id: 'dividas', label: 'Gestão de Dívidas', icon: Landmark },
  { id: 'categorias', label: 'Categorias', icon: Tags },
  { id: 'relatorios', label: 'Relatórios', icon: PieChart },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

const mobileNavigation: Array<NavigationItem & { shortLabel: string }> = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Início', icon: LayoutDashboard },
  { id: 'transacoes', label: 'Transações', shortLabel: 'Transações', icon: ArrowLeftRight },
  { id: 'receitas', label: 'Receitas', shortLabel: 'Receitas', icon: WalletCards },
  { id: 'faturas', label: 'Faturas', shortLabel: 'Faturas', icon: CreditCard },
  { id: 'dividas', label: 'Gestão de Dívidas', shortLabel: 'Dívidas', icon: Landmark },
];

interface AppLayoutProps {
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  controller: FinanceController;
  currentUserEmail?: string;
  onSignOut?: () => void;
  children: ReactNode;
}

export function AppLayout({ activePage, setActivePage, controller, currentUserEmail, onSignOut, children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { data, notifications, actions } = controller;

  const currentPage = navigation.find((item) => item.id === activePage) ?? navigation[0];
  const searchResults = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return [];
    }

    return [
      ...data.transactions.map((item) => ({ page: 'transacoes' as PageId, label: item.description, detail: item.type })),
      ...data.dailyExpenses.map((item) => ({ page: 'transacoes' as PageId, label: item.description, detail: 'gasto diário' })),
      ...data.debts.map((item) => ({ page: 'dividas' as PageId, label: item.name, detail: item.creditor })),
      ...data.incomes.map((item) => ({ page: 'receitas' as PageId, label: item.description, detail: 'receita' })),
      ...data.expenses.map((item) => ({ page: 'transacoes' as PageId, label: item.description, detail: item.status })),
      ...data.creditCards.map((item) => ({ page: 'faturas' as PageId, label: item.name, detail: item.bank })),
      ...data.invoices.map((item) => ({ page: 'faturas' as PageId, label: `Fatura ${item.month}`, detail: item.status })),
      ...data.categories.map((item) => ({ page: 'categorias' as PageId, label: item.name, detail: item.type })),
    ]
      .filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(value))
      .slice(0, 8);
  }, [data, query]);

  const sidebar = (
    <aside className="flex h-full w-[min(18rem,calc(100vw-2rem))] flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-[4.5rem] items-center px-4 sm:h-20 sm:px-5">
        <div className="flex h-14 w-full items-center px-3">
          <img src="/finanlo-logo.png" alt="FINANLO" className="h-11 w-full object-contain" />
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.id === activePage;

          return (
            <button
              key={item.id}
              className={clsx(
                'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition',
                active
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900',
              )}
              onClick={() => {
                setActivePage(item.id);
                setSidebarOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] dark:border-slate-800">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Usuário</p>
            <strong className="mt-1 block truncate text-sm text-slate-900 dark:text-white">{data.settings.userName}</strong>
            {currentUserEmail ? <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{currentUserEmail}</p> : null}
          </div>
          {onSignOut ? (
            <Button variant="ghost" className="h-9 w-9 shrink-0 p-0" onClick={onSignOut} aria-label="Sair">
              <LogOut size={17} />
            </Button>
          ) : null}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {controller.isSyncing ? 'Sincronizando...' : controller.persistenceError ? 'Erro ao salvar dados' : 'Dados sincronizados'}
        </p>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-slate-950/50" onClick={() => setSidebarOpen(false)} aria-label="Fechar menu" />
          <div className="relative h-full">
            {sidebar}
            <button
              className="absolute right-4 top-4 rounded-md bg-white p-2 text-slate-700 shadow dark:bg-slate-900 dark:text-slate-100"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu lateral"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex min-h-16 items-center gap-2 px-3 sm:min-h-20 sm:gap-3 sm:px-6 lg:px-8">
            <button
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-slate-950 dark:text-white sm:text-lg">{currentPage.label}</h2>
            </div>

            <div className="relative hidden w-full max-w-sm md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                className="w-full rounded-md border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-brand-500/20"
                placeholder="Buscar lançamentos, dívidas, faturas..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {searchResults.length > 0 ? (
                <div className="absolute right-0 top-12 z-40 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                  {searchResults.map((item) => (
                    <button
                      key={`${item.page}-${item.label}-${item.detail}`}
                      className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      onClick={() => {
                        setActivePage(item.page);
                        setQuery('');
                      }}
                    >
                      <span className="block font-medium text-slate-900 dark:text-white">{item.label}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative">
              <Button
                variant="secondary"
                className="h-10 w-10 shrink-0 p-0"
                onClick={() => setShowNotifications((current) => !current)}
                aria-label="Notificações"
              >
                <Bell size={18} />
                {notifications.length > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
                    {notifications.length}
                  </span>
                ) : null}
              </Button>
              {showNotifications ? (
                <div className="fixed left-3 right-3 top-16 z-40 rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-80">
                  <strong className="text-sm text-slate-900 dark:text-white">Alertas financeiros</strong>
                  <div className="mt-2 grid gap-2">
                    {notifications.length ? (
                      notifications.slice(0, 8).map((item) => (
                        <p key={item} className="rounded-md bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-500/10 dark:text-amber-100">
                          {item}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Sem alertas no momento.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
            <Button
              variant="secondary"
              className="h-10 w-10 shrink-0 p-0"
              onClick={() => actions.updateSettings({ theme: data.settings.theme === 'dark' ? 'light' : 'dark' })}
              aria-label="Alternar tema"
            >
              {data.settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          </div>
          <div className="relative px-3 pb-3 md:hidden">
            <Search className="pointer-events-none absolute left-6 top-5 -translate-y-1/2 text-slate-400" size={17} />
            <input
              className="min-h-10 w-full rounded-md border border-slate-200 bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-3 focus:ring-brand-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-brand-500/20"
              placeholder="Buscar..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {searchResults.length > 0 ? (
              <div className="absolute left-3 right-3 top-12 z-40 rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                {searchResults.map((item) => (
                  <button
                    key={`mobile-${item.page}-${item.label}-${item.detail}`}
                    className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => {
                      setActivePage(item.page);
                      setQuery('');
                    }}
                  >
                    <span className="block truncate font-medium text-slate-900 dark:text-white">{item.label}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </header>
        <main className="px-3 py-4 pb-28 sm:px-6 sm:py-6 lg:px-8 lg:pb-6">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 lg:hidden">
        <div className="grid grid-cols-5 gap-1">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;
            const active = item.id === activePage;

            return (
              <button
                key={item.id}
                className={clsx(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 text-[11px] font-semibold transition',
                  active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-100'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900',
                )}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={19} />
                <span className="max-w-full truncate">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
