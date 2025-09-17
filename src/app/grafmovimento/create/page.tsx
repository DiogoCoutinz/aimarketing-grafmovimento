'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { createGrafMovimentoProject, saveImageBChoice, generateAISuggestions, generateImageB, generateTransitionPrompts, generateVideo } from '../actions'
import { 
  Upload, 
  ArrowRight,
  ArrowLeft,
  ImageIcon,
  CheckCircle,
  Sparkles,
  Loader2,
  Wand2,
  Edit,
  FileImage
} from 'lucide-react'

export default function GrafMovimentoCreate() {
  const [currentStep, setCurrentStep] = useState(0)
  const [imageA, setImageA] = useState<File | null>(null)
  const [imageAPreview, setImageAPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [projectId, setProjectId] = useState<string | null>(null)
  
  // Step 2 - Choose Image B
  const [imageBMethod, setImageBMethod] = useState<'ai_suggestion' | 'user_prompt' | 'user_upload' | null>(null)
  const [imageBPrompt, setImageBPrompt] = useState('')
  const [imageB, setImageB] = useState<File | null>(null)
  const [imageBPreview, setImageBPreview] = useState<string | null>(null)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isSavingChoice, setIsSavingChoice] = useState(false)
  const [isGeneratingImageB, setIsGeneratingImageB] = useState(false)
  const [generatedImageB, setGeneratedImageB] = useState<string | null>(null)
  const [imageAUrl, setImageAUrl] = useState<string | null>(null)
  
  // Step 4 - Video Generation
  const [transitionPrompts, setTransitionPrompts] = useState<string[]>([])
  const [selectedTransitionPrompt, setSelectedTransitionPrompt] = useState('')
  const [isLoadingTransitionPrompts, setIsLoadingTransitionPrompts] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageBInputRef = useRef<HTMLInputElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const steps = [
    { title: 'Upload Image A', icon: ImageIcon, description: 'Your starting point' },
    { title: 'Choose Image B', icon: Sparkles, description: 'Your destination' },
    { title: 'Preview Images', icon: CheckCircle, description: 'Review A→B transition' },
    { title: 'Generate Video', icon: Upload, description: 'AI magic happens' }
  ]

  // Polling para verificar se Imagem B ou Vídeo ficou pronto
  useEffect(() => {
    if ((currentStep === 2 && projectId && !generatedImageB && imageBMethod !== 'user_upload') ||
        (currentStep === 3 && projectId && !generatedVideo)) {
      console.log('🔄 Iniciando polling para verificar resultado...', { 
        step: currentStep, 
        hasImageB: !!generatedImageB, 
        hasVideo: !!generatedVideo 
      })
      
      const pollProjectStatus = async () => {
        try {
          // Usar endpoint de polling que também verifica KIE.ai
          const response = await fetch(`/api/grafmovimento/poll/${projectId}`)
          const result = await response.json()
          
          console.log('📊 Polling result:', result)
          
          if (result.status === 'success') {
            if (result.image_b_url && !generatedImageB) {
              console.log('🎉 Imagem B pronta!')
              setGeneratedImageB(result.image_b_url)
              // Parar polling
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
              }
            }
            
            if (result.video_url && !generatedVideo) {
              console.log('🎉 Vídeo pronto!', result.video_url)
              setGeneratedVideo(result.video_url)
              setIsGeneratingVideo(false)
              // Parar polling
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current)
                pollingIntervalRef.current = null
              }
            }
          } else if (result.status === 'error') {
            console.error('❌ Erro na geração:', result.error)
            alert(`Erro na geração: ${result.error}`)
            setIsGeneratingVideo(false)
            
            // Parar polling
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
          } else {
            console.log('⏳ Ainda processando...', result.project_status)
          }
          
        } catch (error) {
          console.error('❌ Erro ao verificar status:', error)
        }
      }
      
      // Polling a cada 30 segundos (estilo VEO3)
      pollingIntervalRef.current = setInterval(pollProjectStatus, 30000)
      
      // Cleanup
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    }
    }, [currentStep, projectId, generatedImageB, imageBMethod, generatedVideo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [])

  // Handle file upload for Image A
  const handleImageAUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageA(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageAPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle upload da Imagem B
  const handleImageBUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageB(file)
      setImageBMethod('user_upload')
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setImageBPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Load AI suggestions
  const loadAISuggestions = async () => {
    if (!projectId) return

    try {
      setIsLoadingSuggestions(true)
      console.log('🤖 Carregando sugestões AI...')
      
      const suggestions = await generateAISuggestions(projectId)
      setAiSuggestions(suggestions)
      
    } catch (error) {
      console.error('❌ Erro ao carregar sugestões:', error)
      alert('Erro ao carregar sugestões. Vê o console.')
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  // Handle AI suggestion selection
  const handleAISuggestion = (suggestion: string) => {
    setImageBMethod('ai_suggestion')
    setImageBPrompt(suggestion)
    setImageBPreview(null) // Clear any previous upload
  }

  // Save Image B choice and generate if needed
  const handleSaveImageBChoice = async () => {
    if (!projectId || !imageBMethod) return

    try {
      setIsSavingChoice(true)
      
      console.log('💾 Salvando escolha da Imagem B...')
      await saveImageBChoice(projectId, imageBMethod, imageBPrompt, imageB || undefined)
      console.log('✅ Escolha salva!')
      
      // Se foi upload, já temos a Imagem B
      if (imageBMethod === 'user_upload') {
        console.log('📤 Upload detectado, saltando geração')
        nextStep()
        return
      }
      
      // Se foi AI suggestion ou user prompt, gerar Imagem B
      if (imageBMethod === 'ai_suggestion' || imageBMethod === 'user_prompt') {
        if (!imageAUrl || !imageBPrompt) {
          alert('Dados insuficientes para gerar Imagem B')
          return
        }
        
        setIsGeneratingImageB(true)
        console.log('🎨 Iniciando geração da Imagem B...')
        
        await generateImageB(projectId, imageAUrl, imageBPrompt)
        
        console.log('✅ Geração iniciada! Aguardando callback...')
        nextStep() // Ir para Step 3 onde vai fazer polling
      }
      
    } catch (error) {
      console.error('❌ Erro no processo:', error)
      alert('Erro no processo. Vê o console.')
    } finally {
      setIsSavingChoice(false)
      setIsGeneratingImageB(false)
    }
  }

  // Load transition prompts
  const loadTransitionPrompts = async () => {
    if (!projectId) return

    try {
      setIsLoadingTransitionPrompts(true)
      console.log('🎬 Carregando prompts de transição...')
      
      const prompts = await generateTransitionPrompts(projectId)
      setTransitionPrompts(prompts)
      
    } catch (error) {
      console.error('❌ Erro ao carregar prompts de transição:', error)
      alert('Erro ao carregar prompts. Vê o console.')
    } finally {
      setIsLoadingTransitionPrompts(false)
    }
  }

  // Handle transition prompt selection
  const handleTransitionPrompt = (prompt: string) => {
    setSelectedTransitionPrompt(prompt)
  }

  // Generate video
  const handleGenerateVideo = async () => {
    if (!projectId || !selectedTransitionPrompt) return

    try {
      setIsGeneratingVideo(true)
      console.log('🎬 Iniciando geração de vídeo...')
      
      await generateVideo(projectId, selectedTransitionPrompt)
      console.log('✅ Geração de vídeo iniciada! Aguardando webhook...')
      
      // NÃO fazer setIsGeneratingVideo(false) aqui!
      // O polling vai fazer isso quando o vídeo estiver pronto
      
    } catch (error) {
      console.error('❌ Erro ao gerar vídeo:', error)
      alert('Erro na geração de vídeo. Vê o console.')
      setIsGeneratingVideo(false) // Só parar se houver erro
    }
    // Remover finally - deixar o polling controlar o estado
  }

  // Upload da Imagem A e criar projeto
  const handleUploadAndNext = async () => {
    if (!imageA) return

    try {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append('image_a', imageA)
      
      console.log('🚀 Enviando Imagem A para Supabase...')
      const newProject = await createGrafMovimentoProject(formData)
      
      console.log('✅ Projeto criado:', newProject.id)
      setProjectId(newProject.id)
      setImageAUrl(newProject.image_a_url)
      
      nextStep()
      
    } catch (error) {
      console.error('❌ Erro no upload:', error)
      alert('Erro no upload. Vê o console.')
    } finally {
      setIsUploading(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return imageA !== null
      case 1:
        return imageBMethod !== null && (
          imageBMethod === 'user_upload' ? imageB !== null :
          imageBMethod === 'user_prompt' ? imageBPrompt.trim() !== '' :
          imageBMethod === 'ai_suggestion' ? imageBPrompt !== '' :
          false
        )
      case 2:
        return (generatedImageB !== null || imageBPreview !== null) && imageAPreview !== null
      case 3:
        return generatedVideo !== null
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10" />
        <div className="relative max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                GrafMovimento Studio
              </h1>
              <p className="text-slate-300">Transform images into dynamic videos with AI</p>
            </div>
            
            {/* Step indicator */}
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
          
          {/* Left Column - Controls */}
          <div className="lg:col-span-5">
            <div className="relative h-full rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 border border-white/10 backdrop-blur-xl overflow-hidden">
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
                  {/* Step 0: Upload Image A */}
                  {currentStep === 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="h-full flex flex-col space-y-6"
                    >
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-white mb-2">Upload Your Starting Image</h3>
                        <p className="text-slate-400 text-sm">This will be the beginning of your video transformation</p>
                      </div>
                      
                      {!imageAPreview ? (
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
                                <p>✓ Best results with clear images</p>
                              </div>
                            </div>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageAUpload}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col space-y-4">
                          <div className="relative rounded-2xl overflow-hidden flex-1 bg-slate-800">
                            <Image
                              src={imageAPreview}
                              alt="Image A preview"
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
                              setImageAPreview(null)
                              setImageA(null)
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

                  {/* Step 1: Choose Image B */}
                  {currentStep === 1 && (
                    <motion.div
                      key="image-b-selection"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Choose Your Destination</h3>
                        <p className="text-slate-400 text-sm">How do you want to create Image B?</p>
                      </div>
                      
                      {/* Method Selection */}
                      <div className="grid grid-cols-1 gap-4">
                        
                        {/* AI Suggestions */}
                        <div 
                          onClick={() => {
                            setImageBMethod('ai_suggestion')
                            if (aiSuggestions.length === 0) loadAISuggestions()
                          }}
                          className={`
                            p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                            ${imageBMethod === 'ai_suggestion' 
                              ? 'border-purple-400 bg-purple-500/10' 
                              : 'border-slate-600 hover:border-slate-500'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-3">
                            <Wand2 className="w-5 h-5 text-purple-400" />
                            <div>
                              <h4 className="font-semibold text-white">AI Suggestions</h4>
                              <p className="text-sm text-slate-400">AI analyzes your image and suggests ideas</p>
                            </div>
                          </div>
                          
                          {imageBMethod === 'ai_suggestion' && (
                            <div className="mt-4 space-y-2">
                              {isLoadingSuggestions ? (
                                <div className="flex items-center space-x-2 py-4">
                                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                  <p className="text-sm text-slate-400">AI analyzing your image...</p>
                                </div>
                              ) : aiSuggestions.length > 0 ? (
                                <>
                                  <p className="text-xs text-slate-400">AI generated suggestions:</p>
                                  {aiSuggestions.map((suggestion, idx) => (
                                    <Button
                                      key={idx}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAISuggestion(suggestion)}
                                      className={`
                                        w-full text-left border-slate-600 text-slate-300 hover:bg-slate-700
                                        ${imageBPrompt === suggestion ? 'bg-purple-500/20 border-purple-400' : ''}
                                      `}
                                    >
                                      {suggestion}
                                    </Button>
                                  ))}
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={loadAISuggestions}
                                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                                >
                                  <Wand2 className="w-4 h-4 mr-2" />
                                  Generate Suggestions
                                </Button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* User Prompt */}
                        <div 
                          onClick={() => setImageBMethod('user_prompt')}
                          className={`
                            p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                            ${imageBMethod === 'user_prompt' 
                              ? 'border-cyan-400 bg-cyan-500/10' 
                              : 'border-slate-600 hover:border-slate-500'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-3">
                            <Edit className="w-5 h-5 text-cyan-400" />
                            <div>
                              <h4 className="font-semibold text-white">Write Your Own</h4>
                              <p className="text-sm text-slate-400">Describe exactly what you want</p>
                            </div>
                          </div>
                          
                          {imageBMethod === 'user_prompt' && (
                            <div className="mt-4">
                              <Textarea
                                value={imageBPrompt}
                                onChange={(e) => setImageBPrompt(e.target.value)}
                                placeholder="e.g., Transform the person into a superhero in a dramatic cityscape..."
                                className="min-h-20 bg-slate-800/80 border-slate-600 text-white placeholder-slate-400"
                              />
                            </div>
                          )}
                        </div>

                        {/* Upload Image B */}
                        <div 
                          onClick={() => {
                            setImageBMethod('user_upload')
                            imageBInputRef.current?.click()
                          }}
                          className={`
                            p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                            ${imageBMethod === 'user_upload' 
                              ? 'border-green-400 bg-green-500/10' 
                              : 'border-slate-600 hover:border-slate-500'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-3">
                            <FileImage className="w-5 h-5 text-green-400" />
                            <div>
                              <h4 className="font-semibold text-white">Upload Image B</h4>
                              <p className="text-sm text-slate-400">Use your own destination image</p>
                            </div>
                          </div>
                          
                          {imageBMethod === 'user_upload' && imageBPreview && (
                            <div className="mt-4">
                              <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                <Image
                                  src={imageBPreview}
                                  alt="Image B preview"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                          )}
                          
                          <input
                            ref={imageBInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageBUpload}
                            className="hidden"
                          />
                        </div>
                      </div>

                      {projectId && (
                        <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                          <p className="text-green-400 text-xs">✅ Project: {projectId}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 2: Preview Images */}
                  {currentStep === 2 && (
                    <motion.div
                      key="preview-images"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Preview Your Transition</h3>
                        <p className="text-slate-400 text-sm">Review your images before generating the video</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* Image A */}
                        <div className="space-y-3">
                          <div className="text-center">
                            <h4 className="font-medium text-white mb-2">Image A (Start)</h4>
                            {imageAPreview && (
                              <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-square">
                                <Image
                                  src={imageAPreview}
                                  alt="Image A"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Image B */}
                        <div className="space-y-3">
                          <div className="text-center">
                            <h4 className="font-medium text-white mb-2">Image B (End)</h4>
                            {(generatedImageB || imageBPreview) ? (
                              <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-square">
                                <Image
                                  src={generatedImageB || imageBPreview || ''}
                                  alt="Image B"
                                  fill
                                  className="object-cover"
                                />
                                {generatedImageB && (
                                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                                    AI Generated
                                  </div>
                                )}
                              </div>
                            ) : imageBMethod !== 'user_upload' ? (
                              <div className="aspect-square bg-slate-700 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                  <Loader2 className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-spin" />
                                  <p className="text-purple-400 text-sm font-medium">Generating Image B...</p>
                                  <p className="text-slate-500 text-xs mt-1">This may take 30-60 seconds</p>
                                </div>
                              </div>
                            ) : (
                              <div className="aspect-square bg-slate-700 rounded-xl flex items-center justify-center">
                                <div className="text-center">
                                  <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                  <p className="text-slate-500 text-sm">Image B will appear here</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Transition Arrow */}
                      <div className="flex items-center justify-center py-4">
                        <div className="flex items-center space-x-2">
                          <ArrowRight className="w-6 h-6 text-purple-400" />
                          <span className="text-sm text-slate-400">Video Transition</span>
                          <ArrowRight className="w-6 h-6 text-purple-400" />
                        </div>
                      </div>
                      
                      {/* Method & Prompt Info */}
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/50">
                        <div className="flex items-start space-x-3">
                          <Sparkles className="w-5 h-5 text-purple-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white mb-1">
                              Method: {imageBMethod === 'ai_suggestion' ? 'AI Suggestion' : 
                                      imageBMethod === 'user_prompt' ? 'Custom Prompt' : 
                                      'Image Upload'}
                            </p>
                            {imageBPrompt && (
                              <p className="text-sm text-slate-400">
                                Prompt: &ldquo;{imageBPrompt}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {projectId && (
                        <div className="mt-4 p-3 bg-green-500/20 rounded-lg border border-green-500/30">
                          <p className="text-green-400 text-xs">✅ Project: {projectId}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Step 4: Video Generation */}
                  {currentStep === 3 && (
                    <motion.div
                      key="video-generation"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Generate Video Transition</h3>
                        <p className="text-slate-400">Choose how your images will transform</p>
                      </div>

                      {/* Transition Prompts */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-white">Transition Style</h4>
                          {transitionPrompts.length === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={loadTransitionPrompts}
                              disabled={isLoadingTransitionPrompts}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              {isLoadingTransitionPrompts ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <Wand2 className="w-4 h-4 mr-2" />
                                  Generate Ideas
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {isLoadingTransitionPrompts && (
                          <div className="flex items-center space-x-2 py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                            <p className="text-sm text-slate-400">AI creating transition ideas...</p>
                          </div>
                        )}

                        {transitionPrompts.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs text-slate-400">AI generated transition styles:</p>
                            {transitionPrompts.map((prompt, idx) => (
                              <Button
                                key={idx}
                                variant="outline"
                                size="sm"
                                onClick={() => handleTransitionPrompt(prompt)}
                                className={`
                                  w-full text-left border-slate-600 text-slate-300 hover:bg-slate-700
                                  ${selectedTransitionPrompt === prompt ? 'bg-purple-500/20 border-purple-400' : ''}
                                `}
                              >
                                {prompt}
                              </Button>
                            ))}
                          </div>
                        )}

                        {/* Custom prompt */}
                        <div className="space-y-2">
                          <p className="text-xs text-slate-400">Or write your own:</p>
                          <Textarea
                            placeholder="Describe your ideal video transition..."
                            value={selectedTransitionPrompt}
                            onChange={(e) => setSelectedTransitionPrompt(e.target.value)}
                            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                            rows={3}
                          />
                        </div>
                      </div>

                      {/* Generate Video Button */}
                      {selectedTransitionPrompt && (
                        <div className="text-center pt-4">
                          <Button
                            onClick={handleGenerateVideo}
                            disabled={isGeneratingVideo}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            {isGeneratingVideo ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating Video...
                              </>
                            ) : (
                              <>
                                <FileImage className="w-4 h-4 mr-2" />
                                Generate Video (6s)
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {/* Video Preview */}
                      {generatedVideo && (
                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-white mb-4">Your Generated Video</h4>
                          <div className="relative rounded-xl overflow-hidden bg-slate-800">
                            <video
                              src={generatedVideo}
                              controls
                              className="w-full h-auto"
                              style={{ maxHeight: '400px' }}
                            >
                              Your browser does not support the video tag.
                            </video>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Placeholder for steps 4+ */}
                  {currentStep > 3 && (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Step {currentStep + 1} Coming Soon</h3>
                        <p className="text-slate-400">Audio mixing will be implemented next!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
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

                  <Button
                    onClick={
                      currentStep === 0 ? handleUploadAndNext :
                      currentStep === 1 ? handleSaveImageBChoice :
                      nextStep
                    }
                    disabled={!canProceed() || isUploading || isSavingChoice || isGeneratingImageB}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25 disabled:opacity-50"
                  >
                    {isUploading || isSavingChoice || isGeneratingImageB ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isUploading ? 'Uploading...' : 
                         isSavingChoice ? 'Saving...' : 
                         isGeneratingImageB ? 'Generating Image...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-7">
            <div className="relative h-full rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 border border-white/10 backdrop-blur-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/5 via-transparent to-purple-600/5" />
              
              <div className="relative p-8 h-full flex flex-col items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center max-w-md"
                >
                  <div className="relative w-40 h-40 mx-auto mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-3xl animate-pulse" />
                    <div className="absolute inset-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-slate-500" />
                    </div>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">Your Video Preview</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">
                    Upload your starting image to see the magic begin. Your video transformation will appear here.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
