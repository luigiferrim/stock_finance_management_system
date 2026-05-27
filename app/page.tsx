import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Coffee,
  Database,
  History,
  Package,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const featureCards = [
  {
    title: "Planeje seus lotes",
    description: "Organize cafés encomendados, recebidos, em estoque, embalados e vendidos em uma sequência clara.",
    icon: ClipboardList,
  },
  {
    title: "Analise margens",
    description: "Transforme custo/kg e venda/kg em receita potencial, lucro estimado e margem por lote ativo.",
    icon: BarChart3,
  },
  {
    title: "Audite a operação",
    description: "Mantenha o histórico de logins, cadastros, edições, status, exclusões e trocas de senha.",
    icon: History,
  },
]

const productRows = [
  { lot: "Fazenda Primavera", status: "Em Estoque", kg: "48 kg", margin: "36%" },
  { lot: "Blend Espresso", status: "Embalado", kg: "32 kg", margin: "41%" },
  { lot: "Mantiqueira Natural", status: "Chegou", kg: "60 kg", margin: "33%" },
]

const proofStats = [
  { value: "5", label: "status de lote" },
  { value: "60+", label: "dias para alerta de torra" },
  { value: "4", label: "métricas financeiras" },
]

const integrations = ["NextAuth", "Neon", "PostgreSQL", "Recharts"]

const plans = [
  {
    name: "Operação",
    price: "R$0",
    description: "Para validar a rotina de lotes e margem em uma torrefaria pequena.",
    cta: "Criar conta",
    href: "/register",
    highlighted: false,
    features: ["Controle de lotes", "Dashboard operacional", "Histórico de auditoria"],
  },
  {
    name: "Torrefaria",
    price: "Sob medida",
    description: "Para equipes que precisam consolidar dados reais antes de escalar módulos.",
    cta: "Entrar no painel",
    href: "/login",
    highlighted: true,
    features: ["Estoque ativo", "Margem projetada", "Alertas de torra", "Configurações de conta"],
  },
  {
    name: "Expansão",
    price: "Futuro",
    description: "Para próximas etapas com relatórios, exportação e permissões por equipe.",
    cta: "Ver escopo",
    href: "#faq",
    highlighted: false,
    features: ["Relatórios avançados", "Perfis de usuário", "Exportação de dados"],
  },
]

const faqs = [
  {
    question: "O que é o Stockfee e para quem ele é?",
    answer: "É um painel para torrefarias pequenas controlarem lotes de café, estoque, margem financeira e auditoria.",
  },
  {
    question: "O Stockfee já faz vendas reais?",
    answer: "Ainda não. A etapa atual consolida estoque, lotes, margem projetada, alertas e histórico operacional.",
  },
  {
    question: "Quais campos um lote possui?",
    answer: "Nome, quantidade, custo/kg, venda/kg, fornecedor, categoria, variedade, processo, torra e status.",
  },
  {
    question: "O dashboard exige autenticação?",
    answer: "Sim. A landing, login e cadastro são públicos; qualquer rota em /dashboard exige sessão.",
  },
  {
    question: "Os planos cobram automaticamente?",
    answer: "Não. Os planos nesta página organizam o posicionamento do produto, sem cobrança integrada nesta etapa.",
  },
]

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Stockfee",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "pt-BR",
  description:
    "Aplicação web para torrefarias pequenas controlarem lotes de café, estoque, margem financeira, alertas e auditoria.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
    availability: "https://schema.org/InStock",
  },
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen bg-[#f7f4ef] text-[#302b27]">
        <div className="mx-auto min-h-screen max-w-[1680px] border-x border-[#ded9d1] bg-[#f7f4ef]">
        <header className="px-4 pt-5 sm:px-6 lg:px-8">
          <nav className="mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between rounded-full border border-white/80 bg-white/70 px-4 shadow-sm backdrop-blur sm:px-6">
            <Link href="/" className="flex items-center gap-3" aria-label="Stockfee">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#332e2a] text-white">
                <Coffee className="h-5 w-5" />
              </span>
              <span className="text-xl font-semibold">Stockfee</span>
            </Link>

            <div className="hidden items-center gap-7 text-sm font-medium text-[#6d6660] md:flex">
              <Link href="#produto" className="hover:text-[#302b27]">
                Produto
              </Link>
              <Link href="#prova" className="hover:text-[#302b27]">
                Resultados
              </Link>
              <Link href="#planos" className="hover:text-[#302b27]">
                Planos
              </Link>
              <Link href="#faq" className="hover:text-[#302b27]">
                FAQ
              </Link>
            </div>

            <Button asChild variant="outline" className="rounded-full border-[#e0dbd4] bg-white px-5">
              <Link href="/login">Entrar</Link>
            </Button>
          </nav>
        </header>

        <section className="px-4 pb-16 pt-24 text-center sm:px-6 sm:pb-20 sm:pt-28 lg:px-8">
          <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-[#e0dbd4] bg-white/75 px-4 py-2 text-sm font-medium text-[#6d6660]">
            <Sparkles className="h-4 w-4 text-[#8b6f47]" />
            Lotes, estoque e margem para torrefarias pequenas
          </div>

          <h1 className="mx-auto max-w-5xl font-serif text-5xl leading-[1.05] text-[#302b27] sm:text-7xl lg:text-8xl">
            Stockfee organiza sua torrefaria por lote e margem
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#706963]">
            Controle cafés, acompanhe rastreabilidade, veja alertas de torra e entenda o financeiro da operação sem
            depender de planilhas espalhadas.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full bg-[#302b27] px-8 text-base hover:bg-[#211e1b]">
              <Link href="/register">
                Criar conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-[#ded9d1] bg-white px-8 text-base">
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </section>

        <section id="produto" className="border-y border-[#ded9d1] bg-white/45">
          <div className="mx-auto grid max-w-7xl grid-cols-1 md:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="border-[#ded9d1] p-8 md:border-r md:last:border-r-0">
                  <Icon className="h-6 w-6 text-[#8b6f47]" />
                  <h2 className="mt-8 text-xl font-semibold">{feature.title}</h2>
                  <p className="mt-4 text-base leading-7 text-[#706963]">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-[#ded9d1] bg-white px-4 py-2 text-sm font-medium text-[#6d6660]">
                <Package className="h-4 w-4" />
                Produto em uso
              </div>
              <h2 className="max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
                Uma tela para enxergar lote, estoque, alerta e margem.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#706963]">
                O painel interno mantém os módulos atuais: Dashboard, Estoque, Financeiro, Histórico e Configurações,
                com navegação direta dentro da área autenticada.
              </p>
            </div>

            <div className="overflow-hidden rounded-lg border border-[#ded9d1] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#ded9d1] px-5 py-4">
                <div>
                  <p className="text-sm font-semibold">Dashboard Stockfee</p>
                  <p className="text-sm text-[#706963]">Visão simulada com dados de torrefaria</p>
                </div>
                <span className="rounded-full bg-[#eff7ef] px-3 py-1 text-sm font-medium text-[#477347]">
                  132 kg ativos
                </span>
              </div>

              <div className="grid grid-cols-3 border-b border-[#ded9d1]">
                <div className="p-5">
                  <p className="text-sm text-[#706963]">Margem</p>
                  <p className="mt-2 text-3xl font-semibold">37,8%</p>
                </div>
                <div className="border-x border-[#ded9d1] p-5">
                  <p className="text-sm text-[#706963]">Lotes</p>
                  <p className="mt-2 text-3xl font-semibold">12</p>
                </div>
                <div className="p-5">
                  <p className="text-sm text-[#706963]">Alertas</p>
                  <p className="mt-2 text-3xl font-semibold text-[#9a6b17]">2</p>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4 flex items-center justify-between text-sm text-[#706963]">
                  <span>Lote</span>
                  <span>Margem</span>
                </div>
                <div className="space-y-3">
                  {productRows.map((row) => (
                    <div key={row.lot} className="grid grid-cols-[1fr_auto] gap-4 rounded-md border border-[#e6e0d8] p-4">
                      <div>
                        <p className="font-medium">{row.lot}</p>
                        <p className="mt-1 text-sm text-[#706963]">
                          {row.status} · {row.kg}
                        </p>
                      </div>
                      <p className="self-center font-semibold text-[#477347]">{row.margin}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="prova" className="border-y border-[#ded9d1] bg-white/45 px-4 py-20 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-7 flex w-fit items-center gap-2 rounded-full border border-[#ded9d1] bg-white px-4 py-2 text-sm font-medium text-[#6d6660]">
            <Users className="h-4 w-4" />
            Prova operacional
          </div>
          <h2 className="mx-auto max-w-3xl text-5xl font-semibold leading-tight sm:text-6xl">
            Confiança baseada em dados de rotina
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#706963]">
            O Stockfee organiza informações que a torrefaria já usa todos os dias, sem exigir novos contratos de API ou
            mudanças no banco nesta etapa.
          </p>

          <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-3">
            {proofStats.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-[#ded9d1] bg-white p-8">
                <p className="font-serif text-5xl">{stat.value}</p>
                <p className="mt-3 text-sm font-medium text-[#706963]">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-14 max-w-5xl border-t border-[#ded9d1] pt-10">
            <p className="text-sm font-medium uppercase text-[#706963]">Integrações e base técnica</p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {integrations.map((integration) => (
                <div key={integration} className="rounded-full border border-[#ded9d1] bg-white px-4 py-3 text-sm font-semibold">
                  {integration}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-7 flex w-fit items-center gap-2 rounded-full border border-[#ded9d1] bg-white px-4 py-2 text-sm font-medium text-[#6d6660]">
              <CircleDollarSign className="h-4 w-4" />
              Planos
            </div>
            <h2 className="text-5xl font-semibold leading-tight sm:text-6xl">Escolha o próximo passo</h2>
            <p className="mt-6 text-lg leading-8 text-[#706963]">
              Os planos abaixo organizam o escopo do produto. A cobrança automática não faz parte desta etapa.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-7xl gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-lg border p-8 ${
                  plan.highlighted
                    ? "border-[#302b27] bg-[#302b27] text-white"
                    : "border-[#ded9d1] bg-white text-[#302b27]"
                }`}
              >
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className={`mt-4 min-h-20 leading-7 ${plan.highlighted ? "text-white/70" : "text-[#706963]"}`}>
                  {plan.description}
                </p>
                <p className="mt-8 font-serif text-5xl">{plan.price}</p>
                <Button
                  asChild
                  size="lg"
                  variant={plan.highlighted ? "outline" : "default"}
                  className={`mt-8 h-12 w-full rounded-full text-base ${
                    plan.highlighted
                      ? "border-white bg-white text-[#302b27] hover:bg-white/90"
                      : "bg-[#302b27] text-white hover:bg-[#211e1b]"
                  }`}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
                <ul className="mt-10 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className={`h-4 w-4 ${plan.highlighted ? "text-[#d9b56f]" : "text-[#8b6f47]"}`} />
                      <span className={plan.highlighted ? "text-white/80" : "text-[#706963]"}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className="border-y border-[#ded9d1] bg-white/45 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-5xl font-semibold leading-tight">Perguntas frequentes</h2>
              <p className="mt-6 max-w-md text-lg leading-8 text-[#706963]">
                Respostas curtas sobre escopo, autenticação, lotes e próximos passos do Stockfee.
              </p>
            </div>

            <div className="divide-y divide-[#ded9d1]">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-xl font-semibold">
                    {faq.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-[#706963] transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-4 max-w-2xl leading-7 text-[#706963]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <footer className="px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-lg border border-[#ded9d1] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#302b27] text-white">
                <Coffee className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Stockfee</p>
                <p className="text-sm text-[#706963]">Gestão de lotes e margem para torrefarias.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-[#ded9d1] px-4 py-2 text-sm text-[#706963]">
                <Database className="h-4 w-4" />
                Sem alteração de schema
              </div>
              <div className="flex items-center gap-2 rounded-full border border-[#ded9d1] px-4 py-2 text-sm text-[#706963]">
                <ShieldCheck className="h-4 w-4" />
                Dashboard autenticado
              </div>
            </div>
          </div>
        </footer>
        </div>
      </main>
    </>
  )
}
