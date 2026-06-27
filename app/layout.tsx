import type React from "react"
import type { Metadata } from "next"

import { SessionProvider } from "@/components/providers/session-provider"

import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
const siteDescription =
  "Stockfee ajuda torrefarias pequenas a controlar lotes de café, estoque, margem financeira, alertas e auditoria."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Stockfee | Gestão de lotes e margem para torrefarias",
  description: siteDescription,
  applicationName: "Stockfee",
  keywords: [
    "Stockfee",
    "gestão de torrefaria",
    "controle de lotes de café",
    "estoque de café",
    "margem financeira",
    "auditoria operacional",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Stockfee | Gestão de lotes e margem para torrefarias",
    description: siteDescription,
    url: "/",
    siteName: "Stockfee",
    locale: "pt_BR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    card: "summary",
    title: "Stockfee | Gestão de lotes e margem para torrefarias",
    description: siteDescription,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
