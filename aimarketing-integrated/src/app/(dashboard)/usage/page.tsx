// app/usage/page.tsx

'use client'

import { useState } from 'react'
import { 
  Video, 
  CloudUpload, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'


interface UsageCardProps {
  title: string;
  used: number;
  limit: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function UsageCard({ title, used, limit, unit, icon: Icon, color }: UsageCardProps) {
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isNearLimit = percentage > 80;
  
  const colorClasses = {
    blue: 'from-blue-600 to-cyan-600',
    green: 'from-green-600 to-emerald-600',
    purple: 'from-purple-600 to-pink-600',
    orange: 'from-orange-600 to-red-600'
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="ml-4 text-xl font-semibold text-white">{title}</h3>
        </div>
        {isNearLimit && (
          <AlertTriangle className="h-6 w-6 text-orange-400" />
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">{used} / {limit} {unit}</span>
          <span className={`font-medium ${isNearLimit ? 'text-orange-400' : 'text-gray-300'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-300 shadow-sm`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Mock data function for usage transactions
function getMockTransactionData() {
  const transactions = [];
  const today = new Date();
  
  const activities = [
    { type: 'video_created', description: 'Vídeo criado', icon: 'Video' },
    { type: 'ai_analysis', description: 'Análise IA realizada', icon: 'Sparkles' },
    { type: 'file_uploaded', description: 'Arquivo enviado', icon: 'CloudUpload' },
    { type: 'video_exported', description: 'Vídeo exportado', icon: 'TrendingUp' },
    { type: 'template_used', description: 'Template aplicado', icon: 'CheckCircle' }
  ];
  
  const videoTitles = [
    'Marketing Digital para E-commerce',
    'Apresentação de Produto',
    'Tutorial de Vendas',
    'Análise de Mercado Q3',
    'Campanha Publicitária',
    'Demonstração de Software',
    'Treinamento Corporativo',
    'Webinar de Lançamento',
    'Vídeo Promocional',
    'Case Study Cliente'
  ];
  
  // Generate 50 transactions over the last 30 days
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const videoTitle = videoTitles[Math.floor(Math.random() * videoTitles.length)];
    
    let details = '';
    let size = '';
    
    switch (activity.type) {
      case 'video_created':
        details = videoTitle;
        size = `${(Math.random() * 100 + 20).toFixed(1)}MB`;
        break;
      case 'ai_analysis':
        details = `Análise de sentimento - ${videoTitle}`;
        break;
      case 'file_uploaded':
        details = `${videoTitle}.mp4`;
        size = `${(Math.random() * 200 + 50).toFixed(1)}MB`;
        break;
      case 'video_exported':
        details = `${videoTitle} - HD 1080p`;
        size = `${(Math.random() * 150 + 80).toFixed(1)}MB`;
        break;
      case 'template_used':
        details = `Template: ${['Moderno', 'Corporativo', 'Criativo', 'Minimalista'][Math.floor(Math.random() * 4)]}`;
        break;
    }
    
    transactions.push({
      id: `tx_${i}`,
      type: activity.type,
      description: activity.description,
      details,
      size,
      date,
      icon: activity.icon,
      status: Math.random() > 0.05 ? 'completed' : 'failed' // 95% success rate
    });
  }
  
  // Sort by date (most recent first)
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export default function UsagePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Mock data - following the same pattern as other pages
  const subscription = {
    planId: 'pro',
    status: 'active' as const,
    plan: {
      id: 'pro',
      name: 'Pro',
      price: 29.99,
      billingPeriod: 'monthly' as const,
      features: {
        videosPerMonth: 50,
        maxVideoLength: 300,
        maxFileSize: 100,
        aiAnalysis: true,
        viralTemplates: true,
        hd4kExport: true
      }
    },
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-02-01')
  };

  const usage = {
    videosCreated: 23,
    storageUsed: 1250.5,
    storageLimit: 5000,
    aiAnalysisUsed: 15,
    aiAnalysisRemaining: 35,
    currentPeriodStart: new Date('2024-01-01'),
    currentPeriodEnd: new Date('2024-02-01')
  };

  const availablePlans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 9.99,
      billingPeriod: 'monthly' as const,
      features: {
        videosPerMonth: 10,
        maxVideoLength: 60,
        maxFileSize: 25,
        aiAnalysis: false,
        viralTemplates: false,
        hd4kExport: false
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29.99,
      billingPeriod: 'monthly' as const,
      features: {
        videosPerMonth: 50,
        maxVideoLength: 300,
        maxFileSize: 100,
        aiAnalysis: true,
        viralTemplates: true,
        hd4kExport: true
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      billingPeriod: 'monthly' as const,
      features: {
        videosPerMonth: 200,
        maxVideoLength: 600,
        maxFileSize: 500,
        aiAnalysis: true,
        viralTemplates: true,
        hd4kExport: true
      }
    }
  ];

  const handleUpgrade = (planId: string) => {
    setSelectedPlan(planId);
    // Simulate upgrade process
    setTimeout(() => {
      console.log('Upgraded to plan:', planId);
      setSelectedPlan(null);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto">
        {/* Credits Section */}
        <div className="mb-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Créditos Disponíveis</h2>
            <div className="text-5xl font-bold text-purple-400 mb-4">2,450</div>
            <p className="text-gray-300 text-lg">
              Créditos restantes para criação de vídeos
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <div className="text-sm text-gray-300">Este Mês</div>
                <div className="text-xl font-semibold text-white">127</div>
                <div className="text-xs text-gray-400">créditos usados</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
                <div className="text-sm text-gray-300">Última Recarga</div>
                <div className="text-xl font-semibold text-white">15/01</div>
                <div className="text-xs text-gray-400">+1000 créditos</div>
              </div>
            </div>
          </div>
        </div>


        {/* Usage History List */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-8">Histórico de Uso (Últimos 30 dias)</h3>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="max-h-96 overflow-y-auto">
              {getMockTransactionData().slice(0, 20).map((transaction, index) => {
                const getIconComponent = (iconName: string) => {
                  switch (iconName) {
                    case 'Video':
                      return Video;
                    case 'Sparkles':
                      return Sparkles;
                    case 'CloudUpload':
                      return CloudUpload;
                    case 'TrendingUp':
                      return TrendingUp;
                    case 'CheckCircle':
                      return CheckCircle;
                    default:
                      return Video;
                  }
                };

                const IconComponent = getIconComponent(transaction.icon);

                return (
                  <div 
                    key={transaction.id} 
                    className={`flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 transition-colors ${
                      index === 0 ? 'rounded-t-xl' : ''
                    } ${
                      index === 19 ? 'border-b-0 rounded-b-xl' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                          : 'bg-gradient-to-r from-red-600 to-orange-600'
                      }`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{transaction.description}</span>
                          {transaction.status === 'failed' && (
                            <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-full">
                              Falhou
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mt-1">{transaction.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-300">
                        {transaction.date.toLocaleDateString('pt-PT', { 
                          day: '2-digit', 
                          month: '2-digit',
                          year: '2-digit'
                        })}
                      </div>
                      <div className="text-xs text-gray-400">
                        {transaction.date.toLocaleTimeString('pt-PT', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {transaction.size && (
                        <div className="text-xs text-purple-400 mt-1">
                          {transaction.size}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-white/10 bg-white/5 rounded-b-xl">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Total de atividades: {getMockTransactionData().length}</span>
                <span>Últimas 20 atividades mostradas</span>
              </div>
            </div>
          </div>
        </div>

    </div>
  );
}
