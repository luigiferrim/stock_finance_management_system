import type { Metadata } from "next"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Termos de Uso | Stockfee",
  description: "Condições básicas para uso do Stockfee.",
  alternates: {
    canonical: "/termos-de-uso",
  },
  robots: {
    index: true,
    follow: true,
  },
}

const sections = [
  {
    title: "Finalidade do serviço",
    content:
      "O Stockfee é uma aplicação web para apoiar pequenas torrefarias na organização de lotes, estoque, indicadores financeiros, histórico operacional e configurações de conta.",
  },
  {
    title: "Cadastro e conta",
    content:
      "Para usar o painel interno, o usuário deve fornecer dados verdadeiros no cadastro, manter suas credenciais em segurança e comunicar os responsáveis pelo projeto caso suspeite de uso indevido da conta.",
  },
  {
    title: "Responsabilidade pelos dados",
    content:
      "O usuário é responsável pelas informações operacionais cadastradas no sistema, incluindo dados de lotes, valores, fornecedores, status e demais registros inseridos durante o uso da aplicação.",
  },
  {
    title: "Uso permitido",
    content:
      "A aplicação deve ser usada apenas para fins legítimos de gestão operacional. Não é permitido tentar acessar contas de terceiros, explorar falhas, automatizar abusos, burlar mecanismos de autenticação ou inserir conteúdo ilícito.",
  },
  {
    title: "Disponibilidade e limitações",
    content:
      "O Stockfee é um projeto acadêmico e pode passar por ajustes, indisponibilidades, mudanças de escopo e revisões técnicas. Antes de uso em produção real, os termos formais, canais de suporte e responsabilidades comerciais devem ser revisados.",
  },
  {
    title: "Privacidade",
    content:
      "O tratamento de dados pessoais relacionado ao cadastro, autenticação e uso do sistema está descrito na Política de Privacidade do Stockfee.",
  },
]

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-[#f7f4ef] text-[#302b27]">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="border-b border-[#ded9d1] pb-8">
          <Link href="/" className="text-sm font-medium text-[#6d6660] hover:text-[#302b27]">
            Stockfee
          </Link>
          <h1 className="mt-6 text-4xl font-semibold tracking-normal sm:text-5xl">Termos de Uso</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[#706963]">
            Estes termos apresentam condições básicas para acesso e uso do Stockfee, incluindo responsabilidades do
            usuário e limitações do projeto.
          </p>
          <p className="mt-3 text-sm text-[#706963]">Última atualização: 10 de junho de 2026.</p>
        </header>

        <div className="divide-y divide-[#ded9d1]">
          {sections.map((section) => (
            <section key={section.title} className="py-8">
              <h2 className="text-2xl font-semibold">{section.title}</h2>
              <p className="mt-4 text-base leading-7 text-[#706963]">{section.content}</p>
              {section.title === "Privacidade" && (
                <p className="mt-4 text-base leading-7 text-[#706963]">
                  Consulte a{" "}
                  <Link href="/politica-de-privacidade" className="font-medium text-[#302b27] underline underline-offset-4">
                    Política de Privacidade
                  </Link>{" "}
                  para entender quais dados são coletados, por que são tratados e quais direitos podem ser exercidos.
                </p>
              )}
            </section>
          ))}
        </div>

        <section className="border-y border-[#ded9d1] py-8">
          <h2 className="text-2xl font-semibold">Revisão antes de produção</h2>
          <p className="mt-4 text-base leading-7 text-[#706963]">
            Estes termos foram criados para dar transparência ao projeto. Eles não substituem revisão jurídica
            especializada antes da disponibilização do Stockfee em ambiente de produção para clientes ou usuários reais.
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
