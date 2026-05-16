import { BarChart3, Lock, Mail, UserRound } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { AuthController } from '../hooks/useAuth';
import { Button, Field, Panel, inputClass } from '../components/UI';

export function AuthPage({ auth }: { auth: AuthController }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    const { error } =
      mode === 'login'
        ? await auth.signIn(email.trim(), password)
        : await auth.signUp(email.trim(), password, name.trim() || email.trim().split('@')[0]);

    if (error) {
      setMessage(error.message);
    } else if (mode === 'register') {
      setMessage('Cadastro criado. Se a confirmação por email estiver ativa no Supabase, confirme seu email antes de entrar.');
    }

    setSubmitting(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <section className="hidden lg:block">
          <img src="/finanlo-logo.png" alt="FINANLO" className="h-24 w-full max-w-xl object-contain object-left" />
          <h1 className="mt-8 text-4xl font-semibold">Controle financeiro pessoal com dados seguros por usuário.</h1>
          <p className="mt-4 max-w-xl text-slate-300">
            Entre para acessar sua própria base financeira. Novas contas começam vazias, mantendo apenas as categorias padrão do sistema.
          </p>
        </section>

        <Panel className="border-slate-800 bg-white text-slate-950 dark:bg-white dark:text-slate-950">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-white">
              <BarChart3 size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{mode === 'login' ? 'Entrar no FINANLO' : 'Criar conta'}</h2>
              <p className="text-sm text-slate-500">Acesso com Supabase Auth</p>
            </div>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            {mode === 'register' ? (
              <Field label="Nome">
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className={`${inputClass} pl-10`} value={name} onChange={(event) => setName(event.target.value)} />
                </div>
              </Field>
            ) : null}
            <Field label="Email">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className={`${inputClass} pl-10`}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </Field>
            <Field label="Senha">
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className={`${inputClass} pl-10`}
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  minLength={6}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </Field>

            {message ? (
              <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
                {message}
              </p>
            ) : null}

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <button
            className="mt-4 w-full rounded-md px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            onClick={() => {
              setMode((current) => (current === 'login' ? 'register' : 'login'));
              setMessage('');
            }}
          >
            {mode === 'login' ? 'Ainda não tenho conta' : 'Já tenho conta'}
          </button>
        </Panel>
      </div>
    </main>
  );
}

export function SupabaseSetupPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-3xl place-items-center">
        <Panel className="border-slate-800 bg-white text-slate-950 dark:bg-white dark:text-slate-950">
          <img src="/finanlo-logo.png" alt="FINANLO" className="mb-6 h-16 w-56 object-contain object-left" />
          <h1 className="text-2xl font-semibold">Supabase ainda não configurado</h1>
          <p className="mt-3 text-sm text-slate-600">
            Crie um arquivo <code>.env</code> com as variáveis abaixo e rode o app novamente:
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
{`VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon`}
          </pre>
        </Panel>
      </div>
    </main>
  );
}
