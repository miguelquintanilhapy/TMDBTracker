import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CineTrack — Rastreie seus filmes e séries',
  description: 'Descubra, favorite e receba recomendações personalizadas de filmes e séries.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
