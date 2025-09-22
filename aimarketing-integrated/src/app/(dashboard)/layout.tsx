// app/(dashboard)/layout.tsx

"use client"

import { ReactNode } from 'react'
import FloatingMenu from '@/components/FloatingMenu'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary-900 to-primary-900">
      {/* Main Content - Now full width without sidebar */}
      <main className="min-h-screen p-8 overflow-y-auto">
        {children}
      </main>
      
      {/* Floating Menu replaces the sidebar */}
      <FloatingMenu />
    </div>
  )
}