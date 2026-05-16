import { useState } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { useFinanceData } from './hooks/useFinanceData';
import { Categorias } from './pages/Categorias';
import { Configuracoes } from './pages/Configuracoes';
import { Dashboard } from './pages/Dashboard';
import { Despesas } from './pages/Despesas';
import { Dividas } from './pages/Dividas';
import { Faturas } from './pages/Faturas';
import { GastosDiarios } from './pages/GastosDiarios';
import { Lancamentos } from './pages/Lancamentos';
import { Receitas } from './pages/Receitas';
import { Relatorios } from './pages/Relatorios';
import type { PageId } from './types/finance';

const pages = {
  dashboard: Dashboard,
  lancamentos: Lancamentos,
  'gastos-diarios': GastosDiarios,
  receitas: Receitas,
  despesas: Despesas,
  faturas: Faturas,
  dividas: Dividas,
  categorias: Categorias,
  relatorios: Relatorios,
  configuracoes: Configuracoes,
};

export default function App() {
  const controller = useFinanceData();
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const Page = pages[activePage];

  return (
    <AppLayout activePage={activePage} setActivePage={setActivePage} controller={controller}>
      <Page controller={controller} />
    </AppLayout>
  );
}
