'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { createAndGenerateTemplateVideo } from '../actions'
import { 
  ArrowLeft,
  Upload,
  Play,
  Star,
  Clock,
  Zap,
  CheckCircle,
  Loader2,
  Download
} from 'lucide-react'

// Mock data dos templates (em produção viria da API/database)
const templatesData = {
  'hero-product': {
    id: 'hero-product',
    title: 'Hero Product Showcase',
    description: 'Cinematic 360° product reveal with dramatic lighting',
    category: 'Product',
    duration: '6s',
    popularity: 95,
    tags: ['Cinematic', 'Product', 'Premium'],
    prompt: 'A cinematic product showcase of {PRODUCT_NAME}, professional studio lighting, 360 degree rotation, dramatic zoom, premium aesthetic, high-end commercial style',
    exampleVideo: '/placeholder-video-1.mp4',
    tips: [
      'Works best with products that have interesting shapes',
      'Ensure good lighting in your product photo',
      'Remove background for best results'
    ]
  },
  'unboxing-reveal': {
    id: 'unboxing-reveal',
    title: 'Unboxing Reveal',
    description: 'Dramatic unboxing with anticipation buildup',
    category: 'Lifestyle',
    duration: '8s',
    popularity: 88,
    tags: ['Unboxing', 'Dramatic', 'Lifestyle'],
    prompt: 'Dramatic unboxing sequence of {PRODUCT_NAME}, hands carefully opening package, anticipation buildup, satisfying reveal moment, warm lighting, close-up details',
    exampleVideo: '/placeholder-video-2.mp4',
    tips: [
      'Include packaging in your photo if possible',
      'Works great for consumer products',
      'Add emotional appeal to the reveal'
    ]
  },
  'lifestyle-action': {
    id: 'lifestyle-action',
    title: 'Lifestyle in Action',
    description: 'Product being used in real-life scenarios',
    category: 'Lifestyle',
    duration: '6s',
    popularity: 92,
    tags: ['Lifestyle', 'Real-world', 'Action'],
    prompt: 'Person using {PRODUCT_NAME} in natural environment, authentic lifestyle moment, smooth camera movement, natural lighting, everyday scenario',
    exampleVideo: '/placeholder-video-3.mp4',
    tips: [
      'Show the product in context',
      'Natural, authentic scenarios work best',
      'Consider the target audience lifestyle'
    ]
  },
  'transformation': {
    id: 'transformation',
    title: 'Before & After',
    description: 'Dramatic transformation or improvement showcase',
    category: 'Transformation',
    duration: '8s',
    popularity: 85,
    tags: ['Transformation', 'Before/After', 'Impact'],
    prompt: 'Before and after transformation using {PRODUCT_NAME}, dramatic reveal of improvement, split screen effect, compelling visual contrast, professional presentation',
    exampleVideo: '/placeholder-video-4.mp4',
    tips: [
      'Perfect for beauty, fitness, or improvement products',
      'Clear before/after contrast is key',
      'Show measurable results'
    ]
  },
  'tech-demo': {
    id: 'tech-demo',
    title: 'Tech Innovation',
    description: 'Futuristic tech product demonstration',
    category: 'Technology',
    duration: '6s',
    popularity: 90,
    tags: ['Technology', 'Futuristic', 'Innovation'],
    prompt: 'Futuristic technology demonstration of {PRODUCT_NAME}, sleek interface interactions, holographic elements, modern minimalist environment, cutting-edge aesthetics',
    exampleVideo: '/placeholder-video-5.mp4',
    tips: [
      'Ideal for tech gadgets and software',
      'Emphasize innovation and modernity',
      'Clean, minimalist product photos work best'
    ]
  }
}

interface TemplateDetailPageProps {
  params: Promise<{ templateId: string }>
}

export default function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const [templateId, setTemplateId] = useState<string | null>(null)
  const [template, setTemplate] = useState<typeof templatesData['hero-product'] | null>(null)
  const [productImage, setProductImage] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null)
  const [productName, setProductName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [projectId, setProjectId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Resolve params
  React.useEffect(() => {
    params.then((resolvedParams) => {
      const id = resolvedParams.templateId
      setTemplateId(id)
      setTemplate(templatesData[id as keyof typeof templatesData] || null)
    })
  }, [params])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setProductImage(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setProductImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Polling para verificar se vídeo ficou pronto
  useEffect(() => {
    if (projectId && isGenerating && !generatedVideo) {
      console.log('🔄 Iniciando polling para template project...', projectId)
      
      const pollProjectStatus = async () => {
        try {
          const response = await fetch(`/api/grafmovimento/templates/poll/${projectId}`)
          const result = await response.json()
          
          console.log('📊 Template polling result:', result)
          
          if (result.status === 'success' && result.video_url) {
            console.log('🎉 Vídeo template pronto!', result.video_url)
            setGeneratedVideo(result.video_url)
            setIsGenerating(false)
            
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
          } else if (result.status === 'error') {
            console.error('❌ Erro na geração template:', result.error)
            alert(`Erro na geração: ${result.error}`)
            setIsGenerating(false)
            
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
          } else {
            console.log('⏳ Template ainda processando...', result.project_status)
          }
          
        } catch (error) {
          console.error('❌ Erro ao verificar status template:', error)
        }
      }
      
      // Polling a cada 15 segundos (VEO3 é mais rápido que minimax)
      pollingIntervalRef.current = setInterval(pollProjectStatus, 15000)
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    }
  }, [projectId, isGenerating, generatedVideo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  const handleGenerateVideo = async () => {
    if (!template || !productImage || !productName.trim() || !templateId) return

    try {
      setIsGenerating(true)
      
      console.log('🎬 Gerando vídeo com template VEO3:', template.id)
      console.log('📝 Produto:', productName)
      console.log('🖼️ Imagem:', productImage.name)
      
      // Chamar server action
      const project = await createAndGenerateTemplateVideo(
        templateId,
        productName.trim(),
        productImage
      )
      
      console.log('✅ Projeto template criado:', project.id)
      setProjectId(project.id)
      
      // O polling vai verificar o status e atualizar quando pronto
      
    } catch (error) {
      console.error('❌ Erro ao gerar vídeo template:', error)
      alert('Erro na geração. Vê o console.')
      setIsGenerating(false)
    }
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-slate-300">Loading template...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/grafmovimento/templates">
                <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Templates
                </Button>
              </Link>
              <div className="h-6 w-px bg-slate-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  {template.title}
                </h1>
                <p className="text-slate-400 text-sm">{template.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Star className="w-4 h-4 text-green-400" />
                <span>{template.popularity}% success rate</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{template.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column - Template Info & Preview */}
          <div className="space-y-6">
            {/* Template Preview */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Template Preview</h3>
                
                {/* Video Preview */}
                <div className="relative aspect-video bg-slate-700 rounded-xl overflow-hidden mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-white/60 mx-auto mb-2" />
                      <p className="text-white/60">Example Video</p>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="text-xs px-2 py-1 bg-slate-700/50 text-slate-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Tips */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2">💡 Tips for best results:</h4>
                  <ul className="space-y-1">
                    {template.tips.map((tip, index) => (
                      <li key={index} className="text-sm text-slate-400 flex items-start space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Upload & Generation */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-white/10 p-6">
              <h3 className="text-xl font-bold text-white mb-6">Create Your Video</h3>
              
              {/* Product Name Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., iPhone 15 Pro, Nike Air Max, Tesla Model S"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Product Image
                </label>
                
                {!productImagePreview ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-600 hover:border-purple-400 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group bg-slate-800/30 hover:bg-purple-500/10"
                  >
                    <div className="space-y-3">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-white mb-1">
                          Upload Product Image
                        </h4>
                        <p className="text-slate-400 text-sm">
                          JPG, PNG or WebP • Max 10MB
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden">
                      <Image
                        src={productImagePreview}
                        alt="Product preview"
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Ready</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProductImagePreview(null)
                        setProductImage(null)
                      }}
                      className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Different Image
                    </Button>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateVideo}
                disabled={!productImage || !productName.trim() || isGenerating}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 py-3 text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Generate Viral Video
                  </>
                )}
              </Button>
            </div>

            {/* Generated Video */}
            {generatedVideo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Your Viral Video</h3>
                  <div className="flex items-center space-x-2 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Generated</span>
                  </div>
                </div>
                
                <div className="relative rounded-xl overflow-hidden mb-4">
                  <video
                    src={generatedVideo}
                    controls
                    className="w-full h-auto"
                    style={{ maxHeight: '300px' }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <Button className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600">
                  <Download className="w-4 h-4 mr-2" />
                  Download Video
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
