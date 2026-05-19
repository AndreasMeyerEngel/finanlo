import { ArrowLeftRight, Coffee, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { Panel, SectionHeader } from '../components/UI';
import { Despesas } from './Despesas';
import { GastosDiarios } from './GastosDiarios';
import { Lancamentos } from './Lancamentos';
import type { PageProps } from './PageProps';

type TransactionTab = 'lancamentos' | 'gastos-diarios' | 'despesas';

const tabs: Array<{
  id: TransactionTab;
  label: string;
  description: string;
  icon: typeof ArrowLeftRight;
}> = [
  {
    id: 'lancamentos',
    label: 'Lançamentos',
    description: 'Movimentações gerais, receitas e despesas manuais.',
    icon: ArrowLeftRight,
  },
  {
    id: 'gastos-diarios',
    label: 'Gastos diários',
    description: 'Compras pequenas e recorrentes do dia a dia.',
    icon: Coffee,
  },
  {
    id: 'despesas',
    label: 'Despesas',
    description: 'Contas fixas, variáveis, futuras e vencidas.',
    icon: ReceiptText,
  },
];

export function Transacoes({ controller }: PageProps) {
  const [activeTab, setActiveTab] = useState<TransactionTab>('lancamentos');
  const ActivePage = activeTab === 'gastos-diarios' ? GastosDiarios : activeTab === 'despesas' ? Despesas : Lancamentos;

  return (
    <div className="grid gap-6">
      <SectionHeader
        title="Transações"
        description="Centralize lançamentos, gastos diários e despesas em uma única área."
      />

      <Panel className="p-2 sm:p-2">
        <div className="grid gap-2 md:grid-cols-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                className={`rounded-md border p-3 text-left transition ${
                  active
                    ? 'border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-500/30 dark:bg-brand-500/15 dark:text-brand-100'
                    : 'border-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Icon size={17} />
                  {tab.label}
                </span>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{tab.description}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <ActivePage controller={controller} />
    </div>
  );
}
