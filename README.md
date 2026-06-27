# ☕ Stockfee

> **Gerenciamento Inteligente de Café**
> Trabalho Prático — INE5646 (Programação para Web)
> Universidade Federal de Santa Catarina (UFSC)

---

## 📝 Descrição

O **Stockfee** é uma aplicação web full-stack voltada para cafeterias e torrefadoras, oferecendo controle de estoque de lotes de café com rastreamento de validade, análise financeira em tempo real e auditoria de ações críticas dos usuários. O sistema centraliza inventário, fluxo financeiro e histórico operacional em um único painel.

---

## 📋 Levantamento de Requisitos

### Objetivo do Sistema

O Stockfee deve apoiar cafeterias e torrefadoras no controle operacional e financeiro de lotes de café. O sistema precisa centralizar o cadastro dos lotes, acompanhar o status do estoque, calcular indicadores financeiros e registrar ações relevantes para consulta posterior.

### Público-Alvo

- Pequenas torrefadoras que precisam controlar lotes de café torrado ou em processo de produção.
- Cafeterias que trabalham com diferentes fornecedores, variedades e processos de café.
- Equipes que ainda dependem de planilhas para acompanhar estoque, custos, preços e histórico de alterações.

### Problemas Identificados

- Dificuldade para saber quais lotes estão ativos, vendidos, embalados ou em estoque.
- Falta de visão consolidada sobre custo, preço de venda, lucro estimado e margem.
- Risco de perda de qualidade em cafés com torra antiga.
- Baixa rastreabilidade sobre quem alterou, criou, vendeu ou excluiu informações.
- Acesso manual e disperso a dados que deveriam estar em um painel único.

### Requisitos Funcionais

| Código | Requisito |
|--------|-----------|
| RF01 | O sistema deve permitir cadastro de usuários. |
| RF02 | O sistema deve permitir login de usuários cadastrados. |
| RF03 | O sistema deve proteger o painel interno contra acesso não autenticado. |
| RF04 | O sistema deve permitir alteração de senha do usuário autenticado. |
| RF05 | O sistema deve permitir cadastrar lotes de café. |
| RF06 | O sistema deve permitir editar dados de lotes cadastrados. |
| RF07 | O sistema deve permitir excluir lotes cadastrados. |
| RF08 | O sistema deve permitir alterar o status de um lote. |
| RF09 | O sistema deve listar os lotes cadastrados no módulo de estoque. |
| RF10 | O sistema deve diferenciar lotes por status: `Encomendado`, `Chegou`, `Em Estoque`, `Embalado` e `Vendido`. |
| RF11 | O sistema deve considerar como ativos todos os lotes que não estejam com status `Vendido`. |
| RF12 | O sistema deve registrar nome, quantidade, custo por kg, venda por kg, fornecedor, categoria, variedade, processo, data de torra e status de cada lote. |
| RF13 | O sistema deve classificar os lotes nas categorias `Blend` e `Single Origin`. |
| RF14 | O sistema deve exibir uma visão geral com total de lotes ativos. |
| RF15 | O sistema deve exibir o volume total de café ativo em kg. |
| RF16 | O sistema deve alertar sobre lotes com torra acima de 60 dias. |
| RF17 | O sistema deve calcular custo total dos lotes ativos. |
| RF18 | O sistema deve calcular receita potencial dos lotes ativos. |
| RF19 | O sistema deve calcular lucro estimado dos lotes ativos. |
| RF20 | O sistema deve calcular margem projetada dos lotes ativos. |
| RF21 | O sistema deve exibir análise financeira por lote ou categoria. |
| RF22 | O sistema deve registrar histórico de ações críticas. |
| RF23 | O sistema deve registrar no histórico ações de login, cadastro, criação de lote, edição de lote, alteração de status, exclusão de lote e troca de senha. |
| RF24 | O sistema deve disponibilizar uma landing page pública para apresentação do produto. |
| RF25 | A landing page deve conter chamadas para login e cadastro. |

### Requisitos Não Funcionais

| Código | Requisito |
|--------|-----------|
| RNF01 | A interface deve estar em português do Brasil. |
| RNF02 | O sistema deve ser responsivo para desktop e mobile. |
| RNF03 | A navegação principal deve ser clara e consistente entre os módulos. |
| RNF04 | O sistema deve ter aparência profissional e adequada ao contexto de cafeterias e torrefadoras. |
| RNF05 | O painel deve priorizar leitura rápida de dados operacionais. |
| RNF06 | Senhas devem ser armazenadas com hash seguro. |
| RNF07 | Rotas privadas devem exigir sessão válida. |
| RNF08 | Ações sensíveis devem ser registradas para auditoria. |
| RNF09 | O sistema deve aplicar limites básicos contra excesso de tentativas de autenticação. |
| RNF10 | A aplicação deve ser implantável em ambiente web. |

### Regras de Negócio

| Código | Regra |
|--------|-------|
| RN01 | Um lote vendido não deve ser considerado estoque ativo. |
| RN02 | A margem deve ser calculada com base no custo total e na receita potencial dos lotes ativos. |
| RN03 | Lotes com data de torra superior a 60 dias devem aparecer como alerta operacional. |
| RN04 | O status de um lote deve seguir o fluxo operacional definido pelo sistema. |
| RN05 | Alterações críticas devem gerar registro no histórico para rastreabilidade. |
| RN06 | O cadastro de usuário deve exigir senha com critérios mínimos de segurança. |

### Requisitos de Dados

| Entidade | Dados principais |
|----------|------------------|
| Usuário | Nome, e-mail, senha criptografada e dados de sessão. |
| Lote | Nome, quantidade, custo por kg, venda por kg, fornecedor, categoria, variedade, processo, data da torra e status. |
| Histórico | Usuário responsável, ação realizada, detalhes, lote relacionado quando aplicável e data da ação. |

### Perfis de Usuário

| Perfil | Necessidade |
|--------|-------------|
| Gestor da torrefadora | Acompanhar estoque, margem, alertas e histórico geral da operação. |
| Operador de estoque | Cadastrar, editar e atualizar status de lotes. |
| Responsável financeiro | Consultar custo, receita potencial, lucro estimado e margem. |

### Escopo Atual

- Landing pública de apresentação.
- Cadastro e login de usuários.
- Painel interno autenticado.
- Módulos de dashboard, estoque, financeiro, histórico e configurações.
- CRUD de lotes.
- Indicadores operacionais e financeiros.
- Histórico de auditoria.

### Fora do Escopo Atual

- Venda real com baixa automática de estoque.
- Controle de múltiplas empresas por conta.
- Perfis de permissão avançados.
- Exportação de relatórios.
- Verificação de e-mail.
- Integração com sistemas externos.
- Cobrança ou assinatura dentro da aplicação.

### Critérios de Aceitação

- A página inicial deve abrir sem login.
- Os botões da página inicial devem direcionar para login e cadastro.
- Usuários sem sessão devem ser redirecionados ao tentar acessar o painel.
- Usuários autenticados devem conseguir navegar pelos módulos internos.
- O usuário deve conseguir criar, editar, excluir e alterar status de lotes.
- O dashboard deve exibir métricas de estoque e margem com base nos lotes ativos.
- Lotes com torra acima de 60 dias devem aparecer como alerta.
- Ações críticas devem aparecer no histórico.
- A documentação deve orientar instalação, execução e entendimento do escopo do sistema.

---

## 👥 Integrantes do Grupo

| Nome | Matrícula |
|------|-----------|
| Luigi Ferri Maines | 25100803 |
| Arthur Ferari Cichovski | 25100798 |
| Arthur de Farias Salmoria | 25100792 |
| Luan Schifini Clemente | 25105156 |

---

## 🔗 Links

- **Repositório:** [stock_finance_management_system](https://github.com/luigiferrim/stock_finance_management_system)
- **Aplicação em produção:** https://stock-finance-management-system.vercel.app

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 6 |
| UI | React 19, Tailwind CSS v4, Radix UI, shadcn/ui, lucide-react |
| Gráficos | Recharts 3 |
| Autenticação | NextAuth 4 |
| Banco de dados | PostgreSQL via Neon Serverless 1 |
| Hospedagem | Vercel |

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18.18+ (recomendado 20+)
- npm
- Acesso ao banco Neon do projeto (solicite as credenciais no grupo)

### Passos

```bash
# 1. Clonar o repositório
git clone https://github.com/luigiferrim/stock_finance_management_system.git
cd stock_finance_management_system

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
# Crie um arquivo .env.local na raiz com:
#   DATABASE_URL=<string de conexão do Neon>
#   NEXTAUTH_SECRET=<segredo aleatório para sessões>
#   NEXTAUTH_URL=http://localhost:3000

# 4. Subir o servidor de desenvolvimento
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

---

## 🗄️ Banco de Dados

Execute as migrations SQL versionadas em ordem no Neon SQL Editor antes de usar o sistema:

```text
scripts/001-create-tables.sql
scripts/002-update-lots-table.sql
scripts/003-add-missing-columns.sql
scripts/004-fix-unit-column.sql
scripts/005-complete-database-fix.sql
scripts/006-update-status-values.sql
scripts/008-create-organizations-scope.sql
```

O script `007-manual-password-reset.sql` é apenas para reset manual de senha em casos excepcionais.

---

## 📂 Estrutura do Projeto

```
stockfee/
├── app/                  # App Router do Next.js
│   ├── api/              # Rotas de API (auth, dashboard, invites, logs, lots, members, register, user)
│   ├── configuracoes/    # Redirect para /dashboard/configuracoes
│   ├── dashboard/        # Painel autenticado (estoque, financeiro, histórico, configurações)
│   ├── estoque/          # Redirect para /dashboard/estoque
│   ├── financeiro/       # Redirect para /dashboard/financeiro
│   ├── historico/        # Redirect para /dashboard/historico
│   ├── login/            # Tela de login
│   ├── register/         # Tela de cadastro
│   ├── globals.css       # Estilos globais e design tokens
│   ├── layout.tsx        # Layout raiz
│   └── page.tsx          # Landing
├── components/
│   ├── auth/             # Componentes de autenticação (login, register, sign-out)
│   ├── layout/           # Sidebar e estruturas de layout
│   ├── providers/        # Providers de contexto (sessão)
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── new-lot-modal.tsx # Modal de criação de lote
├── lib/                  # Utilitários, queries e regras de negócio
│   ├── auth/             # Configuração do NextAuth, hash de senha e validação
│   ├── db/               # Cliente do banco de dados
│   ├── security/         # Rate limit, verificação de origem e validação de requests
│   └── stock/            # Validações de estoque
├── scripts/              # Migrations SQL versionadas
├── types/                # Tipos TypeScript compartilhados
└── proxy.ts              # Interceptação de requests e proteção de rotas
```

---

## 🔐 Autenticação e Segurança

O sistema utiliza NextAuth com estratégia de credenciais (sessão via JWT) e proteção de rotas via `proxy.ts` (convenção introduzida no Next.js 16, antigamente `middleware.ts`), que envolve a aplicação com o wrapper `withAuth` e protege todas as rotas sob `/dashboard/*`.

**Implementado:**
- Login e cadastro de usuários
- Hash de senha moderno com PBKDF2 e migração transparente do esquema legado
- Rate limit em login e cadastro, combinando limites por IP e por e-mail
- Verificação de mesma origem nas rotas de cadastro
- Proteção das rotas sob `/dashboard/*` para usuários autenticados
- Auditoria de ações críticas (login, cadastro e atualizações de credenciais)

**Próximo passo:** verificação por e-mail com código aleatório antes da ativação completa da conta.

---

## 👥 Divisão de Responsabilidades

| Integrante | Frente |
|------------|--------|
| Arthur de Farias Salmoria | Autenticação e segurança |
| Luan Schifini Clemente | Banco de dados, API e regras de negócio |
| Luigi Ferri Maines | Integração e módulos |
| Arthur Ferari Cichovski | Front-end e UI |

---

<div align="center">Desenvolvido por <strong>Luigi Ferri Maines, Arthur Ferari Cichovski, Arthur de Farias Salmoria e Luan Schifini Clemente</strong> — UFSC</div>
