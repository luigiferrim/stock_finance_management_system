# ☕ Stockfee

> **Gerenciamento Inteligente de Café**
> Trabalho Prático — INE5646 (Programação para Web)
> Universidade Federal de Santa Catarina (UFSC)

---

## 📝 Descrição

O **Stockfee** é uma aplicação web full-stack voltada para cafeterias e torrefadoras, oferecendo controle de estoque de lotes de café com rastreamento de validade, análise financeira em tempo real e auditoria de ações críticas dos usuários. O sistema centraliza inventário, fluxo financeiro e histórico operacional em um único painel.

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

## 📂 Estrutura do Projeto

```
stockfee/
├── app/                  # App Router do Next.js
│   ├── api/              # Rotas de API (auth, dashboard, logs, lots, register, user, verify-access)
│   ├── configuracoes/    # Redirect para /dashboard/configurações
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
