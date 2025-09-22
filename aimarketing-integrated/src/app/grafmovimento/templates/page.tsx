'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Play,
  TrendingUp,
  Zap,
  Star,
  Clock
} from 'lucide-react'

// Mock data dos templates virais
const viralTemplates = [
  {
    id: 'hero-product',
    title: 'Hero Product Showcase',
    description: 'Cinematic 360° product reveal with dramatic lighting',
    category: 'Product',
    thumbnail: '/placeholder-video-1.jpg', // Placeholder por agora
    duration: '6s',
    popularity: 95,
    tags: ['Cinematic', 'Product', 'Premium'],
    prompt: 'A cinematic product showcase of {PRODUCT_NAME}, professional studio lighting, 360 degree rotation, dramatic zoom, premium aesthetic, high-end commercial style'
  },
  {
    id: 'unboxing-reveal',
    title: 'Unboxing Reveal',
    description: 'Dramatic unboxing with anticipation buildup',
    category: 'Lifestyle',
    thumbnail: '/placeholder-video-2.jpg',
    duration: '8s',
    popularity: 88,
    tags: ['Unboxing', 'Dramatic', 'Lifestyle'],
    prompt: 'Dramatic unboxing sequence of {PRODUCT_NAME}, hands carefully opening package, anticipation buildup, satisfying reveal moment, warm lighting, close-up details'
  },
  {
    id: 'lifestyle-action',
    title: 'Lifestyle in Action',
    description: 'Product being used in real-life scenarios',
    category: 'Lifestyle',
    thumbnail: '/placeholder-video-3.jpg',
    duration: '6s',
    popularity: 92,
    tags: ['Lifestyle', 'Real-world', 'Action'],
    prompt: 'Person using {PRODUCT_NAME} in natural environment, authentic lifestyle moment, smooth camera movement, natural lighting, everyday scenario'
  },
  {
    id: 'transformation',
    title: 'Before & After',
    description: 'Dramatic transformation or improvement showcase',
    category: 'Transformation',
    thumbnail: '/placeholder-video-4.jpg',
    duration: '8s',
    popularity: 85,
    tags: ['Transformation', 'Before/After', 'Impact'],
    prompt: 'Before and after transformation using {PRODUCT_NAME}, dramatic reveal of improvement, split screen effect, compelling visual contrast, professional presentation'
  },
  {
    id: 'tech-demo',
    title: 'Tech Innovation',
    description: 'Futuristic tech product demonstration',
    category: 'Technology',
    thumbnail: '/placeholder-video-5.jpg',
    duration: '6s',
    popularity: 90,
    tags: ['Technology', 'Futuristic', 'Innovation'],
    prompt: 'Futuristic technology demonstration of {PRODUCT_NAME}, sleek interface interactions, holographic elements, modern minimalist environment, cutting-edge aesthetics'
  }
]

export default function ViralTemplatesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/grafmovimento">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Studio
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Viral Templates
                </h1>
                <p className="text-slate-400 text-sm">Proven formats that drive engagement</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>5 viral formats</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Intro Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Choose Your <span className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">Viral Format</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            These templates are based on formats that have generated millions of views. 
            Just upload your product image and let AI create your viral video.
          </p>
        </motion.div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {viralTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/grafmovimento/templates/${template.id}`}>
                <div className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-white/10 overflow-hidden hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-slate-700 overflow-hidden">
                    {/* Placeholder for video thumbnail */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-12 h-12 text-white/60 mx-auto mb-2" />
                        <p className="text-white/60 text-sm">Video Preview</p>
                      </div>
                    </div>
                    
                    {/* Play overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Popularity badge */}
                    <div className="absolute top-3 right-3 bg-green-500/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                      <Star className="w-3 h-3 text-white" />
                      <span className="text-white text-xs font-medium">{template.popularity}%</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                        {template.category}
                      </span>
                      <div className="flex items-center space-x-1 text-slate-400 text-xs">
                        <Clock className="w-3 h-3" />
                        <span>{template.duration}</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4">
                      {template.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.tags.map((tag) => (
                        <span 
                          key={tag}
                          className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    {/* CTA */}
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all">
                      <Zap className="w-4 h-4 mr-2" />
                      Use This Template
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Need Something Custom?
            </h3>
            <p className="text-slate-300 mb-6">
              Create your own unique video with our advanced AI studio
            </p>
            <Link href="/grafmovimento/create">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Try Custom Creation
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
