import type { LucideIcon } from 'lucide-react';

export type TransactionType = 'receita' | 'despesa';
export type RecordStatus = 'pago' | 'pendente' | 'vencido';
export type IncomeStatus = 'recebida' | 'pendente';
export type CategoryType = 'receita' | 'despesa' | 'ambos';
export type DebtStatus = 'ativa' | 'quitada' | 'renegociada' | 'atrasada';
export type DebtPriority = 'baixa' | 'media' | 'alta' | 'critica';
export type InvoiceStatus = 'aberta' | 'fechada' | 'paga' | 'vencida';
export type ThemeMode = 'light' | 'dark';

export type PageId =
  | 'dashboard'
  | 'transacoes'
  | 'receitas'
  | 'faturas'
  | 'dividas'
  | 'categorias'
  | 'relatorios'
  | 'configuracoes';

export interface NavigationItem {
  id: PageId;
  label: string;
  icon: LucideIcon;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  color: string;
  icon: string;
  active: boolean;
}

export interface Account {
  id: string;
  name: string;
  type: 'corrente' | 'poupanca' | 'dinheiro' | 'investimento' | 'credito';
  balance: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  accountId: string;
  paymentMethod: string;
  notes?: string;
  recurring: boolean;
  installment: boolean;
  status: RecordStatus;
  source?: 'manual' | 'daily' | 'income' | 'expense' | 'debt' | 'invoice';
  sourceId?: string;
}

export interface DailyExpense {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: string;
  paymentMethod: string;
  notes?: string;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  receiptDate: string;
  categoryId: string;
  accountId: string;
  recurring: boolean;
  notes?: string;
  status: IncomeStatus;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  categoryId: string;
  accountId: string;
  paymentMethod: string;
  status: RecordStatus;
  recurring: boolean;
  fixed: boolean;
  notes?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
  totalLimit: number;
  availableLimit: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface CardPurchase {
  id: string;
  description: string;
  totalAmount: number;
  purchaseDate: string;
  categoryId: string;
  cardId: string;
  billingMode?: 'parcelado' | 'recorrente';
  installments: number;
  currentInstallment: number;
  installmentAmount: number;
  notes?: string;
}

export interface Invoice {
  id: string;
  cardId: string;
  month: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string;
  status: InvoiceStatus;
}

export interface Debt {
  id: string;
  name: string;
  creditor: string;
  type: string;
  totalAmount: number;
  paidAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  installmentAmount: number;
  startDate: string;
  monthlyDueDay: number;
  interestRate?: number;
  status: DebtStatus;
  priority: DebtPriority;
  notes?: string;
}

export interface Settings {
  userName: string;
  currency: 'BRL';
  initialBalance: number;
  monthlyIncome: number;
  monthlySpendingLimit: number;
  recommendedDailyLimit: number;
  financialMonthStartDay: number;
  theme: ThemeMode;
}

export interface FinanceData {
  settings: Settings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  dailyExpenses: DailyExpense[];
  incomes: Income[];
  expenses: Expense[];
  creditCards: CreditCard[];
  cardPurchases: CardPurchase[];
  invoices: Invoice[];
  debts: Debt[];
}

export interface DashboardMetrics {
  currentBalance: number;
  monthlyIncomeTotal: number;
  monthlyExpenseTotal: number;
  totalDebt: number;
  monthlyDebtInstallments: number;
  availableThisMonth: number;
  dailyAverageAvailable: number;
  spentToday: number;
  spentThisWeek: number;
  spentThisMonth: number;
  debtOriginalTotal: number;
  debtPaidTotal: number;
  debtRemainingTotal: number;
  activeDebts: number;
  paidDebts: number;
  nextDueDebt?: Debt;
  criticalDebt?: Debt;
}

export interface MonthSeriesItem {
  month: string;
  label: string;
  receitas: number;
  despesas: number;
  saldo: number;
}

export interface CategorySeriesItem {
  name: string;
  value: number;
  color: string;
}

export interface DebtEvolutionItem {
  month: string;
  label: string;
  restante: number;
  pago: number;
  progresso: number;
}

export interface FutureInstallmentItem {
  month: string;
  label: string;
  parcelas: number;
}

export interface InvoiceSeriesItem {
  month: string;
  label: string;
  total: number;
  pago: number;
  aberto: number;
}
