export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export const numberFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

export function parseCurrencyInput(value: string): number {
  const normalized = value
    .replace(/\s/g, '')
    .replace('R$', '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDate(date: string): string {
  if (!date) {
    return '-';
  }

  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    year: '2-digit',
  }).format(new Date(year, month - 1, 1));
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthKey(date: string | Date): string {
  if (typeof date === 'string') {
    return date.slice(0, 7);
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

export function clampDay(year: number, monthIndex: number, day: number): Date {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return new Date(year, monthIndex, Math.min(day, lastDay));
}

export function getLastMonths(count: number, referenceDate = new Date()): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - (count - 1 - index), 1);
    return getMonthKey(date);
  });
}

export function getNextMonths(count: number, referenceDate = new Date()): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + index, 1);
    return getMonthKey(date);
  });
}

export function percent(value: number, total: number): number {
  if (!total) {
    return 0;
  }

  return Math.max(0, Math.min(100, (value / total) * 100));
}

export function isSameDay(date: string, reference = new Date()): boolean {
  return date === toIsoDate(reference);
}

export function isWithinCurrentWeek(date: string, reference = new Date()): boolean {
  const parsed = new Date(`${date}T12:00:00`);
  const current = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const day = current.getDay();
  const weekStart = new Date(current);
  weekStart.setDate(current.getDate() - day);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return parsed >= weekStart && parsed <= weekEnd;
}

export function sanitizeFileName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
