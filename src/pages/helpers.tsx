import type { Category, DebtPriority, RecordStatus } from '../types/finance';
import { Badge } from '../components/UI';

export function getCategory(categories: Category[], id: string) {
  return categories.find((category) => category.id === id);
}

export function getCategoryName(categories: Category[], id: string): string {
  return getCategory(categories, id)?.name ?? 'Sem categoria';
}

export function getAccountName(accounts: Array<{ id: string; name: string }>, id: string): string {
  return accounts.find((account) => account.id === id)?.name ?? 'Conta padrão';
}

export function statusBadge(status: RecordStatus | 'recebida' | 'aberta' | 'fechada' | 'paga' | 'vencida' | string) {
  const normalized = status.toLowerCase();

  if (normalized === 'pago' || normalized === 'recebida' || normalized === 'paga' || normalized === 'quitada') {
    return <Badge tone="green">{status}</Badge>;
  }

  if (normalized === 'vencido' || normalized === 'vencida' || normalized === 'atrasada') {
    return <Badge tone="red">{status}</Badge>;
  }

  if (normalized === 'pendente' || normalized === 'aberta' || normalized === 'ativa') {
    return <Badge tone="yellow">{status}</Badge>;
  }

  if (normalized === 'renegociada' || normalized === 'fechada') {
    return <Badge tone="purple">{status}</Badge>;
  }

  return <Badge>{status}</Badge>;
}

export function priorityBadge(priority: DebtPriority) {
  const tones = {
    baixa: 'green',
    media: 'yellow',
    alta: 'orange',
    critica: 'red',
  } as const;

  return <Badge tone={tones[priority]}>{priority}</Badge>;
}

export function paymentMethods() {
  return ['Pix', 'Cartão de crédito', 'Débito', 'Dinheiro', 'Boleto', 'Transferência'];
}

export function debtTypes() {
  return ['Empréstimo', 'Cartão de crédito', 'Financiamento', 'Loja', 'Banco', 'Conta atrasada', 'Acordo', 'Outro'];
}
