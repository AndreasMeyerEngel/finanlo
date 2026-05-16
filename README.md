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

## Tecnologias

- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Vite

## Como rodar localmente

Instale as dependências:

```bash
npm install
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

O FINANLO usa dados mockados na primeira abertura e salva alterações no LocalStorage do navegador. A estrutura já está preparada para futura integração com backend/API.

## Marca

FINANLO é um sistema financeiro pessoal de Andreas e Lorena.
