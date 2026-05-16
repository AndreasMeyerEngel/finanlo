# FINANLO

Sistema web para controle financeiro pessoal, criado para organizar receitas, despesas, gastos diários, faturas de cartão, dívidas e relatórios mensais.

## Funcionalidades

- Dashboard com visão mensal, saldo, receitas, despesas, dívidas e gráficos
- Cadastro e filtro de lançamentos financeiros
- Controle de gastos diários com limite recomendado
- Gestão de receitas e despesas
- Controle de cartões de crédito, compras parceladas e faturas
- Gestão de dívidas com pagamento de parcelas
- Categorias personalizáveis com cores e ícones
- Relatórios com filtros e exportação CSV, Excel e PDF via impressão
- Tema claro/escuro
- Persistência inicial em LocalStorage
- Interface responsiva para desktop e mobile
- Login e cadastro com Supabase Auth
- Dados financeiros salvos por usuário no Supabase

## Tecnologias

- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Vite
- Supabase

## Como rodar localmente

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Preencha:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Gere uma build de produção:

```bash
npm run build
```

## Dados

O FINANLO cria uma base vazia para cada usuário novo. Apenas as categorias padrão do sistema são carregadas inicialmente. Os dados são salvos na tabela `finance_profiles` do Supabase.

Para criar a tabela no Supabase, execute o SQL em:

```text
supabase/schema.sql
```

## Deploy na Vercel

1. Importe o repositório `AndreasMeyerEngel/finanlo` na Vercel.
2. Configure o framework como Vite.
3. Adicione as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Rode o deploy.

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

## Marca

FINANLO é um sistema financeiro pessoal de Andreas e Lorena.
