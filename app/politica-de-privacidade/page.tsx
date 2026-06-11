import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Política de Privacidade | Stockfee",
  description: "Informações sobre tratamento de dados pessoais no Stockfee.",
  alternates: {
    canonical: "/politica-de-privacidade",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const controllers = [
  "Luigi Ferri Maines",
  "Arthur Ferari Cichovski",
  "Arthur de Farias Salmoria",
  "Luan Schifini Clemente",
]

const sections = [
  {
    title: "Dados coletados",
    content:
      "No cadastro, o Stockfee coleta nome completo, e-mail, senha criptografada e nome da organização. Durante o uso, também pode registrar dados de lotes, movimentações operacionais, histórico de auditoria, informações de sessão e dados técnicos necessários para segurança e funcionamento da aplicação.",
  },
  {
    title: "Finalidades do tratamento",
    content:
      "Os dados são usados para criar e autenticar contas, associar usuários a organizações, controlar estoque e indicadores financeiros, registrar ações críticas no histórico, prevenir abusos, proteger rotas privadas e manter a rastreabilidade da operação.",
  },
  {
    title: "Retenção dos dados",
    content:
      "Os dados são mantidos enquanto a conta estiver ativa ou enquanto forem necessários para segurança, auditoria, cumprimento de obrigações legais e preservação do funcionamento do sistema. Quando a exclusão for solicitada, os responsáveis avaliarão a remoção ou anonimização conforme o contexto técnico e legal aplicável.",
  },
  {
    title: "Compartilhamento e operadores",
    content:
      "A aplicação usa serviços de infraestrutura que podem tratar dados em nome dos controladores, incluindo Vercel para hospedagem e execução da aplicação, Neon/PostgreSQL para armazenamento do banco de dados e GitHub para versionamento e processos de entrega do software. Os dados não devem ser vendidos a terceiros.",
  },
  {
    title: "Direitos do titular",
    content:
      "O titular pode solicitar confirmação de tratamento, acesso, correção, portabilidade, informações sobre compartilhamento, revogação de consentimento, anonimização, bloqueio ou eliminação de dados pessoais, observados os limites técnicos e legais.",
  },
  {
    title: "Segurança",
    content:
      "O Stockfee aplica medidas como senha armazenada com hash, sessões autenticadas, proteção de rotas privadas, verificação de origem em operações sensíveis, limites contra excesso de tentativas e logs de auditoria para reduzir riscos de acesso indevido.",
  },
]

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#302b27]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="border-b border-[#ded9d1] pb-8">
          <Link href="/" className="text-sm font-medium text-[#6d6660] hover:text-[#302b27]">
            Stockfee
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal sm:text-5xl">Política de Privacidade</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#706963]">
            Esta página informa, em linguagem clara, como o Stockfee trata dados pessoais no contexto do cadastro,
            autenticação e uso do painel de gestão de lotes e margem para torrefarias.
          </p>
          <p className="mt-3 text-sm text-[#706963]">Última atualização: 10 de junho de 2026.</p>
        </header>

        <section className="border-b border-[#ded9d1] py-8">
          <h2 className="text-2xl font-semibold">Controladores</h2>
          <p className="mt-4 text-base leading-7 text-[#706963]">
            Para fins desta política, os controladores responsáveis pelas principais decisões sobre o tratamento de
            dados pessoais no projeto Stockfee são os integrantes identificados na documentação do projeto:
          </p>
          <ul className="mt-4 grid gap-2 text-base text-[#302b27] sm:grid-cols-2">
            {controllers.map((controller) => (
              <li key={controller} className="rounded-md border border-[#ded9d1] bg-white/60 px-4 py-3">
                {controller}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-6 text-[#706963]">
            Antes de uso em produção para usuários reais, os dados formais do controlador, canal de contato e eventual
            encarregado pelo tratamento de dados devem ser revisados e publicados.
          </p>
        </section>

        <div className="divide-y divide-[#ded9d1]">
          {sections.map((section) => (
            <section key={section.title} className="py-8">
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="mt-4 text-base leading-7 text-[#706963]">{section.content}</p>
            </section>
          ))}
        </div>

        <section className="border-y border-[#ded9d1] py-8">
          <h2 className="text-2xl font-semibold">Como solicitar informações ou exclusão</h2>
          <p className="mt-4 text-base leading-7 text-[#706963]">
            Solicite acesso, correção, exclusão ou informações sobre seus dados entrando em contato com os responsáveis
            do projeto pelos canais oficiais do repositório ou pelos meios informados pela equipe Stockfee. A
            solicitação será avaliada conforme a LGPD, a segurança da conta e as obrigações de auditoria do sistema.
          </p>
        </section>

        <section className="py-8">
          <h2 className="text-2xl font-semibold">Aviso de revisão jurídica</h2>
          <p className="mt-4 text-base leading-7 text-[#706963]">
            Esta política foi criada para aumentar a transparência do projeto e orientar titulares de dados. Ela não
            substitui revisão jurídica especializada antes da disponibilização do Stockfee em ambiente de produção para
            clientes ou usuários reais.
          </p>
        </section>

        <footer className="flex flex-col gap-3 border-t border-[#ded9d1] pt-8 sm:flex-row">
          <Button asChild className="bg-[#302b27] hover:bg-[#211e1b]">
            <Link href="/register">Criar conta</Link>
          </Button>
          <Button asChild variant="outline" className="border-[#ded9d1] bg-white">
            <Link href="/">Voltar para início</Link>
          </Button>
        </footer>
      </div>
    </main>
  )
}
