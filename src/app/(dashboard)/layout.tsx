import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - AIMarketing',
  description: 'Gerador de anúncios com inteligência artificial',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
