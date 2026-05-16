import {
  BadgeDollarSign,
  BriefcaseBusiness,
  Car,
  CircleDollarSign,
  CreditCard,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  Laptop,
  MoreHorizontal,
  PartyPopper,
  Plane,
  Plus,
  RefreshCw,
  RotateCcw,
  Shirt,
  ShoppingCart,
  TrendingUp,
  Utensils,
  type LucideIcon,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Badge, Button, ConfirmDeleteButton, Field, Panel, SectionHeader, TableShell, inputClass } from '../components/UI';
import type { Category } from '../types/finance';
import type { PageProps } from './PageProps';

const iconOptions: Array<{ value: string; label: string; Icon: LucideIcon }> = [
  { value: 'Utensils', label: 'Alimentação', Icon: Utensils },
  { value: 'ShoppingCart', label: 'Mercado', Icon: ShoppingCart },
  { value: 'Home', label: 'Moradia', Icon: Home },
  { value: 'Car', label: 'Transporte', Icon: Car },
  { value: 'HeartPulse', label: 'Saúde', Icon: HeartPulse },
  { value: 'PartyPopper', label: 'Lazer', Icon: PartyPopper },
  { value: 'GraduationCap', label: 'Educação', Icon: GraduationCap },
  { value: 'RefreshCw', label: 'Assinaturas', Icon: RefreshCw },
  { value: 'CreditCard', label: 'Cartão', Icon: CreditCard },
  { value: 'Landmark', label: 'Dívidas', Icon: Landmark },
  { value: 'Shirt', label: 'Roupas', Icon: Shirt },
  { value: 'Gift', label: 'Presentes', Icon: Gift },
  { value: 'Plane', label: 'Viagens', Icon: Plane },
  { value: 'BriefcaseBusiness', label: 'Salário', Icon: BriefcaseBusiness },
  { value: 'Laptop', label: 'Freelance', Icon: Laptop },
  { value: 'RotateCcw', label: 'Reembolso', Icon: RotateCcw },
  { value: 'TrendingUp', label: 'Investimentos', Icon: TrendingUp },
  { value: 'BadgeDollarSign', label: 'Venda', Icon: BadgeDollarSign },
  { value: 'CircleDollarSign', label: 'Financeiro', Icon: CircleDollarSign },
  { value: 'MoreHorizontal', label: 'Outros', Icon: MoreHorizontal },
];

function getCategoryIcon(iconName: string): LucideIcon {
  return iconOptions.find((option) => option.value === iconName)?.Icon ?? CircleDollarSign;
}

export function Categorias({ controller }: PageProps) {
  const { data, actions } = controller;
  const [form, setForm] = useState({
    name: '',
    type: 'despesa',
    color: '#14b884',
    icon: 'CircleDollarSign',
    active: true,
  });
  const PreviewIcon = getCategoryIcon(form.icon);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!form.name.trim()) {
      window.alert('Preencha o nome da categoria.');
      return;
    }

    actions.addCategory({
      name: form.name.trim(),
      type: form.type as Category['type'],
      color: form.color,
      icon: form.icon,
      active: form.active,
    });
    setForm({ ...form, name: '' });
  }

  return (
    <div className="grid gap-6">
      <SectionHeader title="Categorias" description="Gerencie categorias de receitas e despesas com cor, ícone e status ativo." />

      <Panel>
        <form className="grid gap-4 md:grid-cols-6" onSubmit={handleSubmit}>
          <Field label="Nome" className="md:col-span-2">
            <input className={inputClass} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </Field>
          <Field label="Tipo">
            <select className={inputClass} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="receita">receita</option>
              <option value="despesa">despesa</option>
              <option value="ambos">ambos</option>
            </select>
          </Field>
          <Field label="Cor">
            <input className={inputClass} type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} />
          </Field>
          <Field label="Ícone">
            <select className={inputClass} value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })}>
              {iconOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex items-end gap-3">
            <span
              className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-white shadow-sm"
              style={{ backgroundColor: form.color }}
              aria-hidden="true"
            >
              <PreviewIcon size={19} />
            </span>
            <label className="flex items-center gap-2 pb-2 text-sm text-slate-600 dark:text-slate-300">
              <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
              Ativo
            </label>
            <Button type="submit">
              <Plus size={18} />
            </Button>
          </div>
        </form>
      </Panel>

      <Panel>
        <TableShell minWidth="min-w-[680px]">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Cor</th>
              <th className="px-4 py-3">Ícone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.categories.map((category) => {
              const CategoryIcon = getCategoryIcon(category.icon);

              return (
                <tr key={category.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{category.name}</td>
                  <td className="px-4 py-3">{category.type}</td>
                  <td className="px-4 py-3">
                    <span
                      className="block h-6 w-12 rounded-full border border-white/70 shadow-sm ring-1 ring-slate-200 dark:border-slate-900 dark:ring-slate-700"
                      style={{ backgroundColor: category.color }}
                      title="Cor da categoria"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-md text-white shadow-sm"
                      style={{ backgroundColor: category.color }}
                      title="Ícone da categoria"
                      aria-label={`Ícone de ${category.name}`}
                    >
                      <CategoryIcon size={18} />
                    </span>
                  </td>
                  <td className="px-4 py-3">{category.active ? <Badge tone="green">ativo</Badge> : <Badge>inativo</Badge>}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        className="min-h-8 px-2 py-1"
                        onClick={() => actions.updateCategory(category.id, { active: !category.active })}
                      >
                        {category.active ? 'Desativar' : 'Ativar'}
                      </Button>
                      <ConfirmDeleteButton onConfirm={() => actions.removeRecord('categories', category.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
