'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { createJob, getJobStatus } from '@/app/actions'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  Sparkles, 
  Play, 
  CheckCircle, 
  Loader2, 
  Download,
  ArrowRight,
  ArrowLeft,
  User,
  Target,
  Settings,
  Wand2,
  Share,
  Video,
  Eye,
  Clock
} from 'lucide-react'

interface Job {
  id: number
  status: string
  generated_image_url?: string
  generated_video_prompts?: Array<{
    model: string
    video_prompt: string
    aspect_ratio_video: string
  }>
  generated_video_urls?: string[]
  video_url?: string
}

const influencers = [
  {
    id: 1,
    name: 'Sofia',
    persona: 'Minimalist Chic',
    avatar: '/api/placeholder/200/300',
    description: 'Clean and sophisticated aesthetic',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 2,
    name: 'Marco', 
    persona: 'Tech Enthusiast',
    avatar: '/api/placeholder/200/300',
    description: 'Innovation and cutting-edge tech',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    id: 3,
    name: 'Ana',
    persona: 'Natural Lifestyle',
    avatar: '/api/placeholder/200/300', 
    description: 'Healthy and sustainable living',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 4,
    name: 'Carlos',
    persona: 'Fitness Coach',
    avatar: '/api/placeholder/200/300',
    description: 'Energy and constant motivation', 
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 5,
    name: 'Rita',
    persona: 'Fashion Forward',
    avatar: '/api/placeholder/200/300',
    description: 'Urban trends and street style',
    color: 'from-pink-500 to-rose-600'
  }
]

const statusMessages = {
  pending: { text: 'Initializing your project...', icon: Loader2, color: 'text-blue-400' },
  analyzing_image: { text: 'AI analyzing your product...', icon: Eye, color: 'text-purple-400' },
  generating_image_prompt: { text: 'Creating image concept...', icon: Wand2, color: 'text-indigo-400' },
  generating_image: { text: 'Generating personalized image...', icon: Sparkles, color: 'text-cyan-400' },
  generating_video_prompts: { text: 'Writing video scripts...', icon: Wand2, color: 'text-green-400' },
  generating_videos: { text: 'Creating your video (2-3 minutes)...', icon: Video, color: 'text-orange-400' },
  merging_videos: { text: 'Finalizing your masterpiece...', icon: Loader2, color: 'text-pink-400' },
  complete: { text: 'Your viral ad is ready! 🚀', icon: CheckCircle, color: 'text-green-400' },
  error: { text: 'Something went wrong. Try again.', icon: CheckCircle, color: 'text-red-400' }
}

export default function CampaignStudio() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('9:16')
  const [duration, setDuration] = useState([8])
  const [job, setJob] = useState<Job | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const steps = [
    { title: 'Choose Your Influencer', icon: User, description: 'Select the perfect AI personality' },
    { title: 'Upload Your Product', icon: Upload, description: 'Show us what you want to promote' },
    { title: 'Set Campaign Details', icon: Settings, description: 'Customize your ad preferences' }
  ]

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  // Start polling for job status
  const startPolling = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const jobStatus = await getJobStatus(jobId)
        setJob(jobStatus)
        
        if (jobStatus.status === 'complete' || jobStatus.status === 'error') {
          clearInterval(interval)
          setPollingInterval(null)
          setIsProcessing(false)
        }
      } catch (error) {
        console.error('Error fetching status:', error)
        clearInterval(interval)
        setPollingInterval(null)
        setIsProcessing(false)
      }
    }, 5000)

    setPollingInterval(interval)
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedImage(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!uploadedImage || selectedInfluencer === null) return

    try {
      setIsProcessing(true)
      
      const formData = new FormData()
      formData.set('prompt', prompt)
      formData.set('image', uploadedImage)
      formData.set('aspect_ratio', aspectRatio)
      formData.set('duration', duration[0].toString())
      
      const newJob = await createJob(formData)
      setJob(newJob as Job)
      
      startPolling(newJob.id.toString())
      
    } catch (error) {
      console.error('Error creating campaign:', error)
      setIsProcessing(false)
    }
  }

  // Navigation helpers
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return selectedInfluencer !== null
      case 1:
        return uploadedImage !== null
      case 2:
        return prompt.trim().length > 0
      default:
        return false
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getSelectedInfluencer = () => {
    return influencers.find(inf => inf.id === selectedInfluencer)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Premium Header with Glass Effect */}
      <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                Creative Studio
              </h1>
              <p className="text-slate-300">Transform ideas into viral content with AI</p>
            </div>
            
            {/* Enhanced Step indicator */}
            <div className="hidden md:flex items-center space-x-8">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`
                      relative flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all duration-500
                      ${index <= currentStep 
                        ? 'border-purple-400 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/25' 
                        : 'border-slate-600 bg-slate-800/50'
                      }
                    `}>
                      <step.icon className={`w-5 h-5 ${index <= currentStep ? 'text-purple-300' : 'text-slate-500'}`} />
                      {index < currentStep && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className={`text-sm font-medium ${index <= currentStep ? 'text-white' : 'text-slate-400'}`}>
                        {step.title}
                      </div>
                      <div className={`text-xs ${index <= currentStep ? 'text-slate-300' : 'text-slate-500'}`}>
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-16 h-0.5 mx-4 rounded transition-colors duration-500
                      ${index < currentStep 
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
                        : 'bg-slate-600'
                      }
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[calc(100vh-200px)]">
          
          {/* Left Column - Premium Controls */}
          <div className="lg:col-span-5">
            <div className="relative h-full rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 border border-white/10 backdrop-blur-xl overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-cyan-600/5" />
              
              <div className="relative p-8 h-full flex flex-col">
                
                {/* Current Step Header */}
                <div className="mb-8">
                  <div className="flex items-center space-x-3 mb-4">
                    {React.createElement(steps[currentStep].icon, {
                      className: "w-8 h-8 text-purple-400"
                    })}
                    <div>
                      <h2 className="text-2xl font-bold text-white">{steps[currentStep].title}</h2>
                      <p className="text-slate-400 text-sm">{steps[currentStep].description}</p>
                    </div>
                  </div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    
                    {/* Step 0: Choose Influencer */}
                    {currentStep === 0 && (
                      <motion.div
                        key="influencer-selection"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                      >
                        <div className="text-center mb-6">
                          <h3 className="text-lg font-semibold text-white mb-2">Select Your AI Influencer</h3>
                          <p className="text-slate-400 text-sm">Each personality brings unique authenticity to your brand</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {influencers.map((influencer) => (
                            <motion.div
                              key={influencer.id}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedInfluencer(influencer.id)}
                              className={`
                                cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300
                                ${selectedInfluencer === influencer.id 
                                  ? 'border-purple-400 shadow-lg shadow-purple-500/25 ring-2 ring-purple-400/20' 
                                  : 'border-slate-600 hover:border-slate-500'
                                }
                              `}
                            >
                              <div className={`aspect-[3/4] bg-gradient-to-br ${influencer.color} p-4 flex items-center justify-center text-4xl relative`}>
                                👤
                                {selectedInfluencer === influencer.id && (
                                  <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  </div>
                                )}
                              </div>
                              <div className="p-3 bg-slate-800/80">
                                <h4 className="font-bold text-sm text-white">{influencer.name}</h4>
                                <p className="text-xs text-purple-300 mb-1">{influencer.persona}</p>
                                <p className="text-xs text-slate-400">{influencer.description}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 1: Upload Product */}
                    {currentStep === 1 && (
                      <motion.div
                        key="product-upload"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full flex flex-col space-y-6"
                      >
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-white mb-2">Upload Your Product</h3>
                          <p className="text-slate-400 text-sm">High-quality images work best for AI generation</p>
                        </div>
                        
                        {!imagePreview ? (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 border-2 border-dashed border-slate-600 hover:border-purple-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:from-purple-500/10 hover:to-pink-500/10"
                          >
                            <div className="text-center space-y-4">
                              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-purple-400" />
                              </div>
                              <div>
                                <h4 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">
                                  Drop your image here
                                </h4>
                                <p className="text-slate-400 mb-4">or click to browse</p>
                                <div className="text-xs text-slate-500 space-y-1">
                                  <p>✓ JPG, PNG, GIF supported</p>
                                  <p>✓ Max size: 50MB</p>
                                  <p>✓ Best results with clear product images</p>
                                </div>
                              </div>
                            </div>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col space-y-4">
                            <div className="relative rounded-2xl overflow-hidden flex-1 bg-slate-800">
                              <Image
                                src={imagePreview}
                                alt="Product preview"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                              <div className="absolute top-4 right-4">
                                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Ready</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setImagePreview(null)
                                setUploadedImage(null)
                              }}
                              className="w-full bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Different Image
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Step 2: Campaign Details */}
                    {currentStep === 2 && (
                      <motion.div
                        key="campaign-details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                      >
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-white mb-2">Customize Your Campaign</h3>
                          <p className="text-slate-400 text-sm">Fine-tune the details for perfect results</p>
                        </div>
                        
                        {/* Selected Influencer Preview */}
                        {selectedInfluencer && (
                          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getSelectedInfluencer()?.color} flex items-center justify-center text-lg`}>
                              👤
                            </div>
                            <div>
                              <p className="font-medium text-white">{getSelectedInfluencer()?.name}</p>
                              <p className="text-sm text-purple-300">{getSelectedInfluencer()?.persona}</p>
                            </div>
                          </div>
                        )}

                        {/* Prompt Input */}
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-white">Campaign Message</label>
                          <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ex: Show this product in a casual and authentic way for young adults..."
                            className="min-h-24 bg-slate-800/80 border-slate-600 text-white placeholder-slate-400 focus:border-purple-400 focus:ring-purple-400/20"
                          />
                          <p className="text-xs text-slate-500">Describe how you want the influencer to present your product</p>
                        </div>

                        {/* Format Selection */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-white">Video Format</label>
                          <RadioGroup value={aspectRatio} onValueChange={setAspectRatio} className="space-y-3">
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-600 hover:border-purple-400/50 transition-colors">
                              <RadioGroupItem value="9:16" id="vertical" />
                              <label htmlFor="vertical" className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-white">Vertical (9:16)</p>
                                    <p className="text-sm text-slate-400">Perfect for Stories, Reels, TikTok</p>
                                  </div>
                                  <div className="w-8 h-12 bg-gradient-to-b from-purple-500 to-pink-500 rounded"></div>
                                </div>
                              </label>
                            </div>
                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-600 hover:border-purple-400/50 transition-colors">
                              <RadioGroupItem value="16:9" id="horizontal" />
                              <label htmlFor="horizontal" className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-white">Horizontal (16:9)</p>
                                    <p className="text-sm text-slate-400">Great for YouTube, Desktop</p>
                                  </div>
                                  <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded"></div>
                                </div>
                              </label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Duration Slider */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-white">
                              Duration
                            </label>
                            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1 rounded-full">
                              <Clock className="w-4 h-4 text-purple-400" />
                              <span className="text-sm font-medium text-white">{duration[0]}s</span>
                            </div>
                          </div>
                          <Slider
                            value={duration}
                            onValueChange={setDuration}
                            max={24}
                            min={8}
                            step={8}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>8s (Quick impact)</span>
                            <span>16s (Detailed story)</span>
                            <span>24s (Full narrative)</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Enhanced Navigation */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-700/50">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 disabled:opacity-50"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!canProceed() || isProcessing}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Magic...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate Campaign
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Premium Preview */}
          <div className="lg:col-span-7">
            <div className="relative h-full rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 border border-white/10 backdrop-blur-xl overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 via-transparent to-purple-600/5" />
              
              <div className="relative p-8 h-full flex flex-col items-center justify-center">
                
                {!job && !isProcessing ? (
                  // Enhanced Initial state
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md"
                  >
                    <div className="relative w-40 h-40 mx-auto mb-8">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-3xl animate-pulse" />
                      <div className="absolute inset-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
                        <Target className="w-16 h-16 text-slate-500" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Your Creative Canvas</h3>
                    <p className="text-slate-400 text-lg leading-relaxed">
                      Complete the steps on the left to see your AI-generated campaign come to life here.
                    </p>
                  </motion.div>
                ) : (
                  // Enhanced Processing/Results state
                  <div className="w-full max-w-2xl">
                    
                    {/* Status Display */}
                    {job && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                      >
                        <div className="flex items-center justify-center mb-6">
                          {(() => {
                            const statusInfo = statusMessages[job.status as keyof typeof statusMessages] || statusMessages.pending
                            const Icon = statusInfo.icon
                            return (
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <Icon className={`w-8 h-8 ${statusInfo.color} ${job.status !== 'complete' && job.status !== 'error' ? 'animate-spin' : ''}`} />
                                  {job.status !== 'complete' && job.status !== 'error' && (
                                    <div className="absolute -inset-2 rounded-full border-2 border-purple-400/30 animate-ping" />
                                  )}
                                </div>
                                <span className="text-xl font-medium text-white">{statusInfo.text}</span>
                              </div>
                            )
                          })()}
                        </div>
                        
                        {/* Progress Animation */}
                        {job.status !== 'complete' && job.status !== 'error' && (
                          <div className="w-full bg-slate-700 rounded-full h-2 mb-4 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse" style={{
                              width: job.status === 'pending' ? '10%' :
                                     job.status === 'analyzing_image' ? '25%' :
                                     job.status === 'generating_image_prompt' ? '40%' :
                                     job.status === 'generating_image' ? '60%' :
                                     job.status === 'generating_video_prompts' ? '75%' :
                                     job.status === 'generating_videos' ? '90%' : '95%'
                            }} />
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Final Video (Priority Display) */}
                    {job?.video_url ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full"
                      >
                        <div className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 rounded-2xl p-6 border border-green-500/20 backdrop-blur-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-2xl font-bold text-green-400 flex items-center">
                              <CheckCircle className="w-7 h-7 mr-3" />
                              Campaign Ready! 🚀
                            </h4>
                            <div className="text-right text-sm text-slate-400">
                              <p>Generated in ~2 minutes</p>
                            </div>
                          </div>
                          
                          <div className="relative rounded-xl overflow-hidden mb-6 group">
                            <video
                              controls
                              className="w-full h-auto max-h-[500px] object-cover"
                              poster={job.generated_image_url}
                            >
                              <source src={job.video_url} type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Play className="w-16 h-16 text-white/80" />
                            </div>
                          </div>
                          
                          <div className="flex space-x-4">
                            <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg">
                              <Download className="w-4 h-4 mr-2" />
                              Download HD Video
                            </Button>
                            <Button variant="outline" className="border-green-500 text-green-400 hover:bg-green-500/10">
                              <Share className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ) : job?.generated_image_url ? (
                      // Generated Image (Fallback when no video yet)
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8"
                      >
                        <h4 className="text-lg font-semibold mb-4 flex items-center text-purple-400">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generated Preview
                        </h4>
                        <div className="relative rounded-xl overflow-hidden">
                          <Image
                            src={job.generated_image_url}
                            alt="Generated image"
                            width={400}
                            height={600}
                            className="w-full h-auto rounded-xl"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                          <div className="absolute bottom-4 left-4 right-4 text-center">
                            <p className="text-white text-sm font-medium">Creating your video from this image...</p>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}