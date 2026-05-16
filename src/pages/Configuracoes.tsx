import { Plus, RotateCcw } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button, ConfirmDeleteButton, Field, Panel, SectionHeader, TableShell, inputClass } from '../components/UI';
import { formatCurrency, parseCurrencyInput } from '../utils/formatters';
import type { PageProps } from './PageProps';

export function Configuracoes({ controller }: PageProps) {
  const { data, actions } = controller;
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'corrente',
    balance: '',
  });

  function updateMoneySetting(key: 'initialBalance' | 'monthlyIncome' | 'monthlySpendingLimit' | 'recommendedDailyLimit', value: string) {
    actions.updateSettings({ [key]: parseCurrencyInput(value) });
  }

  function addAccount(event: FormEvent) {
    event.preventDefault();
    const balance = parseCurrencyInput(accountForm.balance);

    if (!accountForm.name.trim()) {
      window.alert('Preencha o nome da conta.');
      return;
    }

    actions.addAccount({
      name: accountForm.name.trim(),
      type: accountForm.type as 'corrente' | 'poupanca' | 'dinheiro' | 'investimento',
      balance,
    });
    setAccountForm({ ...accountForm, name: '', balance: '' });
  }

  return (
    <div className="grid gap-6">
      <SectionHeader title="Configurações" description="Ajuste preferências, limites, tema e cadastros auxiliares." />

      <Panel>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Nome do usuário">
            <input
              className={inputClass}
              value={data.settings.userName}
              onChange={(event) => actions.updateSettings({ userName: event.target.value })}
            />
          </Field>
          <Field label="Moeda padrão">
            <select className={inputClass} value={data.settings.currency} disabled>
              <option value="BRL">Real brasileiro</option>
            </select>
          </Field>
          <Field label="Saldo inicial">
            <input
              className={inputClass}
              defaultValue={String(data.settings.initialBalance).replace('.', ',')}
              onBlur={(event) => updateMoneySetting('initialBalance', event.target.value)}
            />
          </Field>
          <Field label="Renda mensal">
            <input
              className={inputClass}
              defaultValue={String(data.settings.monthlyIncome).replace('.', ',')}
              onBlur={(event) => updateMoneySetting('monthlyIncome', event.target.value)}
            />
          </Field>
          <Field label="Limite mensal de gastos">
            <input
              className={inputClass}
              defaultValue={String(data.settings.monthlySpendingLimit).replace('.', ',')}
              onBlur={(event) => updateMoneySetting('monthlySpendingLimit', event.target.value)}
            />
          </Field>
          <Field label="Limite diário recomendado">
            <input
              className={inputClass}
              defaultValue={String(data.settings.recommendedDailyLimit).replace('.', ',')}
              onBlur={(event) => updateMoneySetting('recommendedDailyLimit', event.target.value)}
            />
          </Field>
          <Field label="Início do mês financeiro">
            <input
              className={inputClass}
              type="number"
              min={1}
              max={28}
              value={data.settings.financialMonthStartDay}
              onChange={(event) => actions.updateSettings({ financialMonthStartDay: Number(event.target.value) })}
            />
          </Field>
          <Field label="Tema claro/escuro">
            <select
              className={inputClass}
              value={data.settings.theme}
              onChange={(event) => actions.updateSettings({ theme: event.target.value as 'light' | 'dark' })}
            >
              <option value="light">claro</option>
              <option value="dark">escuro</option>
            </select>
          </Field>
        </div>
      </Panel>

      <Panel>
        <h3 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">Gerenciamento de contas</h3>
        <form className="mb-4 grid gap-4 md:grid-cols-4" onSubmit={addAccount}>
          <Field label="Nome da conta">
            <input className={inputClass} value={accountForm.name} onChange={(event) => setAccountForm({ ...accountForm, name: event.target.value })} />
          </Field>
          <Field label="Tipo">
            <select className={inputClass} value={accountForm.type} onChange={(event) => setAccountForm({ ...accountForm, type: event.target.value })}>
              <option value="corrente">corrente</option>
              <option value="poupanca">poupança</option>
              <option value="dinheiro">dinheiro</option>
              <option value="investimento">investimento</option>
            </select>
          </Field>
          <Field label="Saldo">
            <input className={inputClass} value={accountForm.balance} onChange={(event) => setAccountForm({ ...accountForm, balance: event.target.value })} />
          </Field>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              <Plus size={18} />
              Adicionar conta
            </Button>
          </div>
        </form>

        <TableShell minWidth="min-w-[620px]">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Conta</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Saldo</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.accounts.map((account) => (
              <tr key={account.id}>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{account.name}</td>
                <td className="px-4 py-3">{account.type}</td>
                <td className="px-4 py-3">{formatCurrency(account.balance)}</td>
                <td className="px-4 py-3">
                  <ConfirmDeleteButton onConfirm={() => actions.removeRecord('accounts', account.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Panel>

      <Panel>
        <h3 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">Gerenciamento de cartões</h3>
        <TableShell minWidth="min-w-[720px]">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Cartão</th>
              <th className="px-4 py-3">Banco</th>
              <th className="px-4 py-3">Limite</th>
              <th className="px-4 py-3">Disponível</th>
              <th className="px-4 py-3">Fechamento</th>
              <th className="px-4 py-3">Vencimento</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.creditCards.map((card) => (
              <tr key={card.id}>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                  <span className="mr-2 inline-block h-3 w-3 rounded-full" style={{ backgroundColor: card.color }} />
                  {card.name}
                </td>
                <td className="px-4 py-3">{card.bank}</td>
                <td className="px-4 py-3">{formatCurrency(card.totalLimit)}</td>
                <td className="px-4 py-3">{formatCurrency(card.availableLimit)}</td>
                <td className="px-4 py-3">dia {card.closingDay}</td>
                <td className="px-4 py-3">dia {card.dueDay}</td>
                <td className="px-4 py-3">
                  <ConfirmDeleteButton onConfirm={() => actions.removeRecord('creditCards', card.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </Panel>

      <Panel className="border-red-200 dark:border-red-500/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-slate-950 dark:text-white">Limpar dados financeiros</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Remove seus registros e mantém apenas as categorias padrão do sistema.</p>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Limpar seus dados financeiros? Apenas as categorias padrão serão mantidas.')) {
                actions.resetData();
              }
            }}
          >
            <RotateCcw size={18} />
            Limpar base
          </Button>
        </div>
      </Panel>
    </div>
  );
}
