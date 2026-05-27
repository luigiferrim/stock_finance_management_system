# Stockfee

Stockfee é uma aplicação web para torrefarias pequenas controlarem lotes de café, estoque ativo, margem financeira e histórico de auditoria em um único painel operacional.

O produto consolida a rotina atual da torrefaria antes de expandir para novos módulos: cadastro de lotes, acompanhamento por status, análise financeira projetada, alertas de torra e registro das ações críticas feitas pelos usuários.

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, NextAuth |
| Banco de dados | PostgreSQL via Neon Serverless |
| UI e dados | lucide-react, Recharts |
| Segurança | Sessão JWT, PBKDF2 para senhas, rate limit básico |

## Funcionalidades

- Landing pública em `/` com hero, CTAs para login/cadastro, blocos de produto, prova operacional, planos estáticos e FAQ.
- Autenticação com login, cadastro, sessão JWT e troca de senha.
- Área autenticada em `/dashboard/:path*`.
- Dashboard com lotes ativos, volume em kg, lotes com torra acima de 60 dias e margem projetada.
- Controle de lotes de café com nome, quantidade, custo/kg, venda/kg, fornecedor, categoria, variedade, processo, data da torra e status.
- Status de lote: `Encomendado`, `Chegou`, `Em Estoque`, `Embalado`, `Vendido`.
- Categorias atuais: `Blend` e `Single Origin`.
- Financeiro por lotes ativos, calculando custo total, receita potencial, lucro estimado e margem.
- Histórico de auditoria para login, cadastro, criação, edição, mudança de status, exclusão e troca de senha.
- Redirecionamentos de compatibilidade em `/estoque`, `/financeiro`, `/historico` e `/configuracoes`.

## Como Rodar Localmente

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente em `.env.local`:

```bash
DATABASE_URL="postgres://..."
NEXTAUTH_SECRET="uma-chave-segura"
NEXTAUTH_URL="http://localhost:3000"
```

Prepare o banco executando os scripts SQL em ordem, se o banco ainda não estiver inicializado:

```bash
scripts/001-create-tables.sql
scripts/002-update-lots-table.sql
scripts/003-add-missing-columns.sql
scripts/004-fix-unit-column.sql
scripts/005-complete-database-fix.sql
scripts/006-update-status-values.sql
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

- Landing pública: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Cadastro: `http://localhost:3000/register`
- Painel autenticado: `http://localhost:3000/dashboard`

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Rotas Principais

| Rota | Acesso | Descrição |
| --- | --- | --- |
| `/` | Público | Landing da Stockfee |
| `/login` | Público | Entrada de usuários |
| `/register` | Público | Cadastro de usuários |
| `/dashboard` | Privado | Redireciona para visão geral |
| `/dashboard/dashboard` | Privado | Métricas operacionais |
| `/dashboard/estoque` | Privado | Controle de lotes |
| `/dashboard/financeiro` | Privado | Análise financeira |
| `/dashboard/historico` | Privado | Auditoria e histórico |
| `/dashboard/configurações` | Privado | Configurações e senha |

## APIs Mantidas

- `GET /api/lots`
- `POST /api/lots`
- `PUT /api/lots/[id]`
- `POST /api/lots/[id]/delete`
- `GET /api/dashboard/stats`
- `GET /api/logs`
- `POST /api/register`
- `POST /api/user/change-password`

## Escopo Atual

Esta etapa não altera o schema do banco nem cria novas APIs. O foco é consolidar posicionamento, navegação, textos, documentação e a experiência inicial da aplicação.

Os planos exibidos na landing são conteúdo de apresentação e não acionam cobrança real.

Fora do escopo atual:

- Vendas reais e baixa automática por pedido.
- Exportação de relatórios.
- Perfis de usuário e permissões granulares.
- Verificação de e-mail.
- Novos dashboards financeiros.

## Próximos Passos

- Validar a jornada completa em produção com banco Neon configurado.
- Adicionar testes para autenticação, criação de lote e cálculos financeiros.
- Definir permissões por papel quando houver múltiplos usuários por torrefaria.
- Evoluir relatórios e exportação depois que o fluxo operacional estiver estável.

## Autoria

Trabalho Prático — INE5646 Programação para Web, Universidade Federal de Santa Catarina (UFSC).

| Nome | Matrícula |
| --- | --- |
| Luigi Ferri Maines | 25100803 |
| Arthur Ferari Cichovski | 25100798 |
| Arthur de Farias Salmoria | 25100792 |
| Luan Schifini Clemente | 25105156 |
