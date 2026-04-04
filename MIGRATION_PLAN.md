# Plano De Migracao Incremental

## Contexto

Este repositorio alvo ainda esta praticamente vazio e o projeto finalizado esta em `../dashboard`.

O objetivo aqui deve ser fazer uma migracao incremental, com commits pequenos e verdadeiros, sem tentar fingir que o projeto ainda esta sendo criado do zero. A historia pode ser enxuta, mas cada commit precisa corresponder a uma entrega real.

## Regras Da Migracao

1. Cada fase deve deixar o projeto em estado executavel ou ao menos consistente.
2. Os commits devem ser por capacidade entregue, nao por copia massiva de pasta.
3. As mensagens devem ser honestas. Preferir `init`, `migrate`, `port`, `integrate`, `stabilize`, `fix`.
4. Antes de copiar arquivos, filtrar duplicatas e sobras do projeto final.
5. Escolher um unico gerenciador de pacotes e uma unica configuracao do Next.

## Ajustes Necessarios Antes De Migrar

Esses pontos existem no projeto final e devem ser tratados como parte da migracao:

- Existe duplicacao de componentes. Os arquivos efetivamente usados sao:
  - `components/sidebar.tsx`
  - `components/session-provider.tsx`
  - `components/new-lot-modal.tsx`
- Existem variantes paralelas que nao parecem ser as usadas:
  - `components/layout/sidebar.tsx`
  - `components/providers/session-provider.tsx`
  - `components/estoque/new-lot-modal.tsx`
- Existem duas configs do Next (`next.config.ts` e `next.config.mjs`). Manter so uma.
- O status dos lotes esta inconsistente:
  - partes do sistema usam `active`
  - outras usam `Encomendado`, `Chegou`, `Em Estoque`, `Embalado`, `Vendido`
- A documentacao de migracao de usuarios fala em PBKDF2, mas o codigo atual de senha usa SHA-256 simples. Isso precisa ser assumido como debito tecnico ou corrigido numa fase propria.

## Fase 1. Base Do Projeto

Objetivo: criar a fundacao do app sem colocar regra de negocio ainda.

Arquivos para portar:

- `package.json`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `components.json`
- uma unica `next.config.*`
- `app/layout.tsx`
- `app/globals.css`
- `app/page.tsx`
- `public/*` so com os assets realmente usados
- `lib/utils.ts`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components/ui/card.tsx`

Commits sugeridos:

- `chore: initialize next.js app scaffold`
- `feat: add base styles and shared ui primitives`
- `feat: add landing page and brand assets`

## Fase 2. Banco E Autenticacao

Objetivo: colocar o app de pe com login, cadastro e sessao.

Arquivos para portar:

- `lib/db.ts`
- `lib/password.ts`
- `lib/auth.ts`
- `types/next-auth.d.ts`
- `components/session-provider.tsx`
- `middleware.ts`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/register/route.ts`
- `scripts/001-create-tables.sql`

Commits sugeridos:

- `feat: add neon database connection and initial schema`
- `feat: add user registration endpoint and page`
- `feat: add credentials auth with next-auth`
- `feat: protect private routes with auth middleware`

## Fase 3. Casca Do Dashboard

Objetivo: subir a area autenticada com layout, navegacao e placeholders.

Arquivos para portar:

- `app/(dashboard)/layout.tsx`
- `components/sidebar.tsx`
- `app/(dashboard)/dashboard/loading.tsx`
- `app/(dashboard)/estoque/loading.tsx`
- `app/(dashboard)/financeiro/loading.tsx`
- `app/(dashboard)/historico/loading.tsx`

Nesta fase vale deixar paginas ainda com placeholder simples, desde que a navegacao esteja funcionando.

Commits sugeridos:

- `feat: add protected dashboard layout and sidebar`
- `feat: add route skeletons for dashboard modules`

## Fase 4. Estoque CRUD

Objetivo: entregar o modulo central do sistema primeiro.

Arquivos para portar:

- `components/new-lot-modal.tsx`
- `components/ui/dialog.tsx`
- `components/ui/select.tsx`
- `app/(dashboard)/estoque/page.tsx`
- `app/api/lots/route.ts`
- `app/api/lots/[id]/route.ts`
- `app/api/lots/[id]/delete/route.ts`
- `scripts/002-update-lots-table.sql`
- `scripts/003-add-missing-columns.sql`
- `scripts/004-fix-unit-column.sql`
- `scripts/005-complete-database-fix.sql`
- `scripts/006-update-status-values.sql`

Ordem interna recomendada:

1. listar lotes
2. criar lote
3. editar lote
4. trocar status
5. deletar lote
6. estabilizar schema e status

Commits sugeridos:

- `feat: add lots listing endpoint and stock table`
- `feat: add create and edit lot modal`
- `feat: add lot status update and delete flow`
- `fix: normalize lot status values in database`

## Fase 5. Dashboard E Financeiro

Objetivo: conectar dados do estoque aos modulos analiticos.

Arquivos para portar:

- `app/api/dashboard/stats/route.ts`
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/financeiro/page.tsx`

Atencao: antes de portar sem revisar, alinhar consultas que ainda usam `status = 'active'` com o status final do estoque.

Commits sugeridos:

- `feat: add dashboard stats endpoint`
- `feat: add overview dashboard with charts`
- `feat: add financial analysis page`
- `fix: align analytics queries with current lot statuses`

## Fase 6. Auditoria E Configuracoes

Objetivo: fechar os fluxos administrativos do sistema.

Arquivos para portar:

- `app/api/logs/route.ts`
- `app/(dashboard)/historico/page.tsx`
- `app/api/user/change-password/route.ts`
- `app/(dashboard)/configuracoes/page.tsx`
- `app/(dashboard)/configuracoes/loading.tsx`

Commits sugeridos:

- `feat: add audit logs endpoint and history page`
- `feat: add account settings page`
- `feat: add password change flow`

## Fase 7. Camada Extra De Acesso E Hardening

Objetivo: portar os recursos extras de seguranca depois que o fluxo principal ja estiver estavel.

Arquivos para portar:

- `app/verify-access/page.tsx`
- `app/api/verify-access/route.ts`
- `lib/rate-limit.ts`
- `lib/env-check.ts`

Commits sugeridos:

- `feat: add master access code verification flow`
- `feat: add rate limiting for access verification`
- `fix: validate critical environment variables`

## Fase 8. Documentacao, Limpeza E Operacao

Objetivo: encerrar a migracao com o repositorio organizado.

Arquivos para avaliar e portar so se fizerem sentido depois da revisao:

- `README.md`
- `MANUAL-DB-SETUP.md`
- `SECURITY.md`
- `CODIGO-ACESSO.md`
- `QUICK-FIX.md`
- `MIGRACAO-USUARIOS.md`
- `scripts/007-manual-password-reset.sql`

Tambem entra aqui:

- remover arquivos duplicados ou nao usados
- decidir se a senha continua em SHA-256 por enquanto ou se vai haver migracao real para PBKDF2
- padronizar mensagens, logs e nomes de rotas

Commits sugeridos:

- `docs: add local setup and database instructions`
- `docs: add security and access configuration notes`
- `refactor: remove duplicated components and dead files`
- `fix: document password migration strategy`

## Sequencia Mais Natural Para O Grupo

Se a ideia for parecer um desenvolvimento normal, a sequencia mais crivel e:

1. fundacao do app
2. auth
3. layout privado
4. estoque
5. dashboard
6. financeiro
7. historico
8. configuracoes
9. seguranca extra
10. docs e limpeza

Isso porque o estoque e a fonte de dados central. Dashboard, financeiro e historico passam a parecer evolucoes naturais em cima dele.

## Ritmo Recomendado De Commit

- 2 a 4 commits por fase
- sempre finalizar a fase com app rodando
- evitar commits gigantes de mais de uma feature
- evitar importar arquivos duplicados do projeto final
- ao final de cada fase, registrar no README o que ja esta funcional

## Proximo Passo

Se for seguir este plano, a primeira execucao pratica deve ser a Fase 1, criando o esqueleto do projeto neste repositorio e escolhendo:

- `npm` ou `pnpm`
- `next.config.mjs` ou `next.config.ts`
- se a migracao de senha fica para o fim ou entra como correcao mais cedo
