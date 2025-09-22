// components/FloatingMenu.tsx

"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { Home, Plus, Settings, LogOut, Video, Menu, X, MoreVertical } from 'lucide-react'
import { FloatButton } from './shared/FloatButton'

export default function FloatingMenu() {
  const router = useRouter()

  const navigationItems = [
    {
      label: "Novo Vídeo",
      icon: <Plus className="w-4 h-4" />,
      href: "/video-creator",
      tooltip: "Criar Novo Vídeo"
    },
    {
      label: "Biblioteca",
      icon: <Video className="w-4 h-4" />,
      href: "/video-library",
      tooltip: "Ver Biblioteca"
    },
    {
      label: "Como Usar",
      icon: <Home className="w-4 h-4" />,
      href: "/usage",
      tooltip: "Como Usar a Plataforma"
    },
    {
      label: "Definições",
      icon: <Settings className="w-4 h-4" />,
      href: "/settings",
      tooltip: "Configurações"
    },
    {
      label: "Sair",
      icon: <LogOut className="w-4 h-4" />,
      href: "/login",
      tooltip: "Sair da Aplicação"
    },
  ]

  const handleNavigation = (href: string) => {
    router.push(href)
  }

  return (
    <FloatButton.Group
      trigger="click"
      type="primary"
      style={{ 
        right: 24, 
        bottom: 24,
        zIndex: 1001
      }}
      icon={<Menu className="w-5 h-5" />}
      closeIcon={<X className="w-5 h-5" />}
      tooltip="Menu Principal"
      placement="top"
    >
      {navigationItems.map((item, index) => (
        <FloatButton
          key={index}
          icon={item.icon}
          tooltip={item.tooltip}
          type="primary"
          onClick={() => handleNavigation(item.href)}
        />
      ))}
    </FloatButton.Group>
  )
}
