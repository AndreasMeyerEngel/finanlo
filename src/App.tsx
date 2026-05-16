import { useState } from 'react';
import { AppLayout } from './components/Layout/AppLayout';
import { useAuth } from './hooks/useAuth';
import { useFinanceData } from './hooks/useFinanceData';
import { AuthPage, SupabaseSetupPage } from './pages/AuthPage';
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
  const auth = useAuth();

  if (!auth.hasSupabaseConfig) {
    return <SupabaseSetupPage />;
  }

  if (auth.loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <img src="/finanlo-logo.png" alt="FINANLO" className="mx-auto h-16 w-64 object-contain" />
          <p className="mt-4 text-sm text-slate-300">Carregando sessão...</p>
        </div>
      </main>
    );
  }

  if (!auth.user) {
    return <AuthPage auth={auth} />;
  }

  return <AuthenticatedApp auth={auth} />;
}

function AuthenticatedApp({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const controller = useFinanceData(auth.user!);
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const Page = pages[activePage];

  if (controller.dataLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <img src="/finanlo-logo.png" alt="FINANLO" className="mx-auto h-16 w-64 object-contain" />
          <p className="mt-4 text-sm text-slate-300">Carregando seus dados financeiros...</p>
        </div>
      </main>
    );
  }

  return (
    <AppLayout
      activePage={activePage}
      setActivePage={setActivePage}
      controller={controller}
      currentUserEmail={auth.user?.email}
      onSignOut={auth.signOut}
    >
      <Page controller={controller} />
    </AppLayout>
  );
}
