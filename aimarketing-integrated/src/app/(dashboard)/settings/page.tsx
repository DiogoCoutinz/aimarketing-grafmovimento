// app/settings/page.tsx

'use client'

import { useState } from 'react'
import { CreditCard, ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { Checkbox } from '@/components/ui/checkbox'

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    bio: ''
  })

  const [billing, setBilling] = useState({
    currentPlan: 'Pro',
    planPrice: '€29.99',
    billingCycle: 'monthly',
    nextBilling: '2024-01-15',
    paymentMethod: '**** **** **** 4242'
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    projectUpdates: true,
    marketingEmails: false
  })

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handleBillingAction = (action: string) => {
    // Handle billing actions (upgrade, downgrade, change payment method, etc.)
    console.log('Billing action:', action)
    
    switch (action) {
      case 'upgrade':
        alert('Redirecionando para upgrade do plano...')
        break
      case 'downgrade':
        alert('Redirecionando para downgrade do plano...')
        break
      case 'change_payment':
        alert('Redirecionando para alterar método de pagamento...')
        break
      case 'cancel':
        alert('Redirecionando para cancelar subscrição...')
        break
      case 'view_invoices':
        alert('Redirecionando para histórico de faturas...')
        break
      default:
        break
    }
  }

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Profile Settings */}
      <div className="mb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Definições do Perfil</h2>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                Primeiro Nome
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={profile.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                className="w-full px-4 py-3 border border-white/20 rounded-lg shadow-sm placeholder-gray-400 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                Último Nome
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={profile.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                className="w-full px-4 py-3 border border-white/20 rounded-lg shadow-sm placeholder-gray-400 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full px-4 py-3 border border-white/20 rounded-lg shadow-sm placeholder-gray-400 bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
            />
          </div>
          
        </div>
      </div>

      {/* Billing & Plans */}
      <div className="mb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Planos e Faturação</h2>
        </div>
        
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm border border-purple-400/40 rounded-xl p-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white">Plano {billing.currentPlan}</h3>
                <p className="text-purple-300">Plano atual ativo</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{billing.planPrice}</div>
                <div className="text-sm text-gray-300">por mês</div>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-300 mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Próxima faturação: {billing.nextBilling}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleBillingAction('upgrade')}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <ArrowUpCircle className="w-4 h-4 mr-1" />
                Upgrade
              </button>
              <button
                onClick={() => handleBillingAction('downgrade')}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <ArrowDownCircle className="w-4 h-4 mr-1" />
                Downgrade
              </button>
              <button
                onClick={() => handleBillingAction('cancel')}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancelar Subscrição
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Método de Pagamento</h4>
                <p className="text-gray-300 text-sm flex items-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  {billing.paymentMethod}
                </p>
              </div>
              <Button
                onClick={() => handleBillingAction('change_payment')}
                variant="outline"
                size="sm"
              >
                Alterar
              </Button>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Histórico de Faturação</h4>
                <p className="text-gray-300 text-sm">Ver todas as suas faturas e pagamentos</p>
              </div>
              <Button
                onClick={() => handleBillingAction('view_invoices')}
                variant="outline"
                size="sm"
              >
                Ver Faturas
              </Button>
            </div>
          </div>

          {/* Plan Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-green-400">∞</div>
              <div className="text-sm text-gray-300 mt-2">Vídeos por mês</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-primary-400">4K</div>
              <div className="text-sm text-gray-300 mt-2">Qualidade máxima</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-purple-400">✓</div>
              <div className="text-sm text-gray-300 mt-2">Suporte prioritário</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Notificações</h2>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white">Notificações por Email</h3>
              <p className="text-sm text-gray-300 mt-1">Receba atualizações importantes por email</p>
            </div>
            <Checkbox
              checked={notifications.emailNotifications}
              onChange={(checked) => handleNotificationChange('emailNotifications', checked)}
            />
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white">Notificações Push</h3>
              <p className="text-sm text-gray-300 mt-1">Receba notificações no navegador</p>
            </div>
            <Checkbox
              checked={notifications.pushNotifications}
              onChange={(checked) => handleNotificationChange('pushNotifications', checked)}
            />
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white">Atualizações de Projeto</h3>
              <p className="text-sm text-gray-300 mt-1">Seja notificado quando os projetos estiverem prontos</p>
            </div>
            <Checkbox
              checked={notifications.projectUpdates}
              onChange={(checked) => handleNotificationChange('projectUpdates', checked)}
            />
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white">Emails de Marketing</h3>
              <p className="text-sm text-gray-300 mt-1">Receba dicas, novidades e ofertas especiais</p>
            </div>
            <Checkbox
              checked={notifications.marketingEmails}
              onChange={(checked) => handleNotificationChange('marketingEmails', checked)}
            />
          </div>
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="mb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Privacidade e Segurança</h2>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white">Alterar Palavra-passe</h3>
              <p className="text-sm text-gray-300 mt-1">Atualize a sua palavra-passe de acesso</p>
            </div>
            <Button variant="outline" size="sm">
              Alterar
            </Button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white">Descarregar Dados</h3>
              <p className="text-sm text-gray-300 mt-1">Faça download de todos os seus dados</p>
            </div>
            <Button variant="outline" size="sm">
              Download
            </Button>
          </div>
          
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-6 border border-red-400/40 flex items-center justify-between">
            <div>
              <h3 className="text-base font-medium text-white">Eliminar Conta</h3>
              <p className="text-sm text-gray-300 mt-1">Elimine permanentemente a sua conta e todos os dados</p>
            </div>
            <Button variant="outline" size="sm" className="border-red-400 text-red-400 hover:bg-red-500/20">
              Eliminar
            </Button>
          </div>
        </div>
      </div>

    </div>
  )
}
