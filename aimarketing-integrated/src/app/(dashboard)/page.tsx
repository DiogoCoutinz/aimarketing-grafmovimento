'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Plus, Sparkles, Play, BarChart3, Users, Zap } from 'lucide-react'

const stats = [
  {
    label: 'Campaigns Created',
    value: '24',
    icon: Sparkles,
    color: 'text-purple-400'
  },
  {
    label: 'Videos Generated',
    value: '89',
    icon: Play,
    color: 'text-cyan-400'
  },
  {
    label: 'Total Views',
    value: '1.2M',
    icon: BarChart3,
    color: 'text-green-400'
  },
  {
    label: 'Active Influencers',
    value: '5',
    icon: Users,
    color: 'text-orange-400'
  }
]

const recentCampaigns = [
  {
    id: 1,
    title: 'Summer Collection Launch',
    status: 'complete',
    thumbnail: '/api/placeholder/100/150',
    views: '45.2K',
    createdAt: '2 hours ago'
  },
  {
    id: 2, 
    title: 'Tech Product Demo',
    status: 'generating_videos',
    thumbnail: '/api/placeholder/100/150',
    views: '0',
    createdAt: '5 hours ago'
  },
  {
    id: 3,
    title: 'Fitness Challenge Ad',
    status: 'complete',
    thumbnail: '/api/placeholder/100/150', 
    views: '128K',
    createdAt: '1 day ago'
  }
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-['Inter']">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-[#0A0A0A]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Welcome back! Ready to create some viral content?</p>
            </div>
            
            <Link href="/campaigns/new">
              <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white">
                <Plus className="w-5 h-5 mr-2" />
                New Campaign
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Create Campaign Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/campaigns/new" className="block">
              <div className="bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl border border-purple-500/30 p-8 hover:border-purple-400 transition-all duration-300 h-full cursor-pointer group">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">Create Campaign</h3>
                  <p className="text-gray-400">Start building your next viral ad with AI</p>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Placeholder for Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 opacity-50 cursor-not-allowed"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-500">Templates</h3>
              <p className="text-gray-500">Coming soon - Pre-built campaign templates</p>
            </div>
          </motion.div>

          {/* Placeholder for Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8 opacity-50 cursor-not-allowed"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-500">Analytics</h3>
              <p className="text-gray-500">Coming soon - Performance insights</p>
            </div>
          </motion.div>
        </div>

        {/* Recent Campaigns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Recent Campaigns</h2>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-400 hover:text-white">
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentCampaigns.map((campaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:border-gray-600/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{campaign.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        campaign.status === 'complete' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {campaign.status === 'complete' ? 'Complete' : 'Processing'}
                      </span>
                      <span className="text-sm text-gray-400">{campaign.views} views</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{campaign.createdAt}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
