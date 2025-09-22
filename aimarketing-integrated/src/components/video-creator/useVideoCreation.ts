// components/VideoCreator/useVideoCreation.ts

'use client'

import { useState } from 'react'
import { aiService, ImageAnalysis, TransitionSuggestion } from '@/lib/aiService'
import { ViralTemplate } from '@/lib/types'

export interface UploadedImageData {
  name: string;
  size: number;
  type: string;
  preview: string;
  file?: File;
}


export type ScenarioType = 'magic' | 'creative' | 'viral' | null;

export function useVideoCreation() {
  // Main state
  const [uploadedImage, setUploadedImage] = useState<UploadedImageData | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>(null)
  const [selectedMethod, setSelectedMethod] = useState<ScenarioType>(null)
  
  // Magic scenario states
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [selectedMagicScenario, setSelectedMagicScenario] = useState<string | null>(null)
  const [selectedMagicOption, setSelectedMagicOption] = useState<string | null>(null)
  const [customMagicInput, setCustomMagicInput] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [showCustomPrompt, setShowCustomPrompt] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generationPrompt, setGenerationPrompt] = useState('')
  const [showWaveLoader, setShowWaveLoader] = useState(false)
  const [showImageProcessing, setShowImageProcessing] = useState(false)
  
  // Creative scenario states
  const [uploadedImageB, setUploadedImageB] = useState<UploadedImageData | null>(null)
  const [imageBPreview, setImageBPreview] = useState<string | null>(null)
  const [isOptimizingPrompt, setIsOptimizingPrompt] = useState(false)
  const [optimizedPrompt, setOptimizedPrompt] = useState('')
  const [promptImprovements, setPromptImprovements] = useState<string[]>([])
  
  // Viral scenario states
  const [selectedTemplate, setSelectedTemplate] = useState<ViralTemplate | null>(null)
  const [viralTemplateConfirmed, setViralTemplateConfirmed] = useState(false)
  
  // Shared transition/video states
  const [isLoadingTransitions, setIsLoadingTransitions] = useState(false)
  const [transitionSuggestions, setTransitionSuggestions] = useState<TransitionSuggestion[]>([])
  const [selectedTransition, setSelectedTransition] = useState<TransitionSuggestion | null>(null)
  const [selectedTransitionOption, setSelectedTransitionOption] = useState<string | null>(null)
  const [customTransitionPrompt, setCustomTransitionPrompt] = useState('')
  const [showCustomTransition, setShowCustomTransition] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null)

  // Video generation tasks
  const videoGenerationTasks = [
    {
      id: 'prepare-assets',
      title: 'Preparando recursos',
      description: 'Organizando imagens e configurações',
      duration: 2000
    },
    {
      id: 'apply-transitions',
      title: 'Aplicando transições',
      description: 'Criando efeitos visuais e animações',
      duration: 3000
    },
    {
      id: 'render-frames',
      title: 'Renderizando frames',
      description: 'Processando cada quadro do vídeo',
      duration: 4000
    },
    {
      id: 'encode-video',
      title: 'Codificando vídeo',
      description: 'Finalizando arquivo de saída',
      duration: 2000
    }
  ]

  // Handler functions
  const handleFileSelect = (file: File, preview: string) => {
    setUploadedImage({
      name: file.name,
      size: file.size,
      type: file.type,
      preview: preview
    })
    setImageFile(file)
  }

  const handleFileRemove = () => {
    setUploadedImage(null)
    setImageFile(null)
    // Reset all scenario states
    setSelectedScenario(null)
    setSelectedMethod(null)
    setSelectedMagicScenario(null)
    setSelectedMagicOption(null)
    setCustomMagicInput('')
    setShowWaveLoader(false)
    setShowImageProcessing(false)
    setAnalysis(null)
    setGeneratedImageUrl(null)
    setUploadedImageB(null)
    setImageBPreview(null)
    setSelectedTemplate(null)
    setViralTemplateConfirmed(false)
    setSelectedTransition(null)
    setSelectedTransitionOption(null)
    setFinalVideoUrl(null)
  }

  const selectScenario = (scenario: ScenarioType) => {
    setSelectedScenario(scenario)
    
    // Start scenario-specific logic
    if (scenario === 'magic' && imageFile) {
      analyzeImage(imageFile)
    } else if (scenario === 'creative' && imageFile) {
      loadTransitionSuggestions()
    }
  }

  // Magic scenario functions
  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    
    try {
      console.log('🔥 FRONTEND: Chamando aiService.analyzeImage')
      // ✅ USAR BACKEND REAL: Análise OpenAI + 3 sugestões reais
      const realAnalysis = await aiService.analyzeImage(file)
      console.log('✅ FRONTEND: Análise OpenAI recebida:', realAnalysis)
      
      setAnalysis(realAnalysis)
      setIsAnalyzing(false)
    } catch (error) {
      console.error('❌ FRONTEND: Erro na análise:', error)
      setAnalysisError(error instanceof Error ? error.message : 'Erro desconhecido')
      setIsAnalyzing(false)
    }
  }

  const selectMagicScenario = async (scenarioId: string) => {
    console.log('🔥 selectMagicScenario called with:', scenarioId)
    console.log('🔥 imageFile:', imageFile)
    console.log('🔥 analysis:', analysis)
    
    if (!imageFile || !analysis) {
      console.log('🔥 Early return - missing imageFile or analysis')
      return
    }
    
    console.log('🔥 Setting selectedMagicScenario and isGeneratingImage')
    setSelectedMagicScenario(scenarioId)
    setIsGeneratingImage(true)
    
    try {
      let prompt = ''
      
      if (scenarioId === 'custom') {
        prompt = customMagicInput.trim()
      } else {
        const scenario = analysis.suggestedScenarios.find(s => s.id === scenarioId)
        prompt = showCustomPrompt && customPrompt ? customPrompt : scenario?.prompt || ''
      }
      
      console.log('🔥 Setting showImageProcessing to true')
      setShowImageProcessing(true)
      
      // ✅ USAR BACKEND REAL: Gerar imagem B com fal.ai Seedream V4
      console.log('🔥 FRONTEND: Chamando aiService.generateImage')
      const result = await aiService.generateImage(imageFile, scenarioId, prompt)
      console.log('✅ FRONTEND: Imagem B gerada:', result)
      
      console.log('🔥 Image generation complete - setting results')
      setGeneratedImageUrl(result.imageUrl)
      setGenerationPrompt(result.prompt)
      setShowImageProcessing(false)
      // Note: loadTransitionSuggestions() will be called when user proceeds to transitions
      
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Falha ao gerar imagem. Tente novamente.')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  // Creative scenario functions
  const handleImageBSelect = (file: File, preview: string) => {
    const imageData: UploadedImageData = {
      name: file.name,
      size: file.size,
      type: file.type,
      preview: preview,
      file: file
    }
    setUploadedImageB(imageData)
    setImageBPreview(preview)
    loadTransitionSuggestions()
  }

  const handleImageBRemove = () => {
    setUploadedImageB(null)
    setImageBPreview(null)
  }

  // Shared functions
  const loadTransitionSuggestions = async () => {
    if (!imageFile) return
    
    setIsLoadingTransitions(true)
    
    try {
      let secondImage: File | null = null
      
      if (uploadedImageB && uploadedImageB.file) {
        secondImage = uploadedImageB.file
      } else if (selectedScenario === 'magic' && generatedImageUrl) {
        const response = await fetch(generatedImageUrl)
        const blob = await response.blob()
        secondImage = new File([blob], 'generated-image.jpg', { type: 'image/jpeg' })
      }
      
      if (!secondImage) {
        setTransitionSuggestions([
          {
            id: 'smooth_reveal',
            name: 'Revelação Suave',
            description: 'Transição elegante que revela gradualmente a transformação',
            prompt: 'Create a smooth, elegant transition that gradually reveals the transformation',
            duration: 3,
            complexity: 'simple'
          },
          {
            id: 'dynamic_morph',
            name: 'Transformação Dinâmica',
            description: 'Mudança energética com efeitos de morphing e movimento fluido',
            prompt: 'Create a dynamic morphing transition with fluid movement and energetic effects',
            duration: 4,
            complexity: 'medium'
          },
          {
            id: 'cinematic_fade',
            name: 'Fade Cinematográfico',
            description: 'Transição profissional com fade suave e efeitos de profundidade',
            prompt: 'Create a cinematic fade transition with professional depth effects and smooth blending',
            duration: 5,
            complexity: 'simple'
          }
        ])
        setIsLoadingTransitions(false)
        return
      }
      
      const suggestions = await aiService.suggestTransitions(
        imageFile, 
        secondImage, 
        selectedMagicScenario || undefined,
        analysis?.style
      )
      
      setTransitionSuggestions(suggestions)
    } catch (error) {
      console.error('Error loading transitions:', error)
      // Provide fallback suggestions
      setTransitionSuggestions([
        {
          id: 'smooth_reveal',
          name: 'Revelação Suave',
          description: 'Transição elegante que revela gradualmente a transformação',
          prompt: 'Create a smooth, elegant transition that gradually reveals the transformation',
          duration: 3,
          complexity: 'simple'
        },
        {
          id: 'dynamic_morph',
          name: 'Transformação Dinâmica',
          description: 'Mudança energética com efeitos de morphing e movimento fluido',
          prompt: 'Create a dynamic morphing transition with fluid movement and energetic effects',
          duration: 4,
          complexity: 'medium'
        },
        {
          id: 'cinematic_fade',
          name: 'Fade Cinematográfico',
          description: 'Transição profissional com fade suave e efeitos de profundidade',
          prompt: 'Create a cinematic fade transition with professional depth effects and smooth blending',
          duration: 5,
          complexity: 'simple'
        }
      ])
    } finally {
      setIsLoadingTransitions(false)
    }
  }

  const selectTransition = (transition: TransitionSuggestion) => {
    setSelectedTransition(transition)
  }

  const generateVideo = async (transition?: TransitionSuggestion) => {
    const transitionToUse = transition || selectedTransition
    console.log('🔥 generateVideo called')
    console.log('🔥 imageFile:', imageFile)
    console.log('🔥 transition passed:', transition)
    console.log('🔥 selectedTransition:', selectedTransition)
    console.log('🔥 transitionToUse:', transitionToUse)
    
    if (!imageFile || !transitionToUse) {
      console.log('🔥 Early return - missing imageFile or transition')
      return
    }
    
    console.log('🔥 Starting video generation')
    setIsGeneratingVideo(true)
    setVideoProgress(0)
    
    // Mock video generation with progress simulation
    const progressInterval = setInterval(() => {
      setVideoProgress(prev => {
        const next = prev + Math.random() * 15 + 5
        
        if (next >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => {
            setFinalVideoUrl('https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4')
            setIsGeneratingVideo(false)
          }, 500)
          return 100
        }
        
        return next
      })
    }, 300)
  }

  const downloadVideo = () => {
    if (finalVideoUrl) {
      const a = document.createElement('a')
      a.href = finalVideoUrl
      a.download = 'generated-video.mp4'
      a.click()
    }
  }

  const resetToStart = () => {
    setSelectedScenario(null)
    handleFileRemove()
  }

  return {
    // State
    uploadedImage,
    imageFile,
    selectedScenario,
    selectedMethod,
    isAnalyzing,
    analysis,
    analysisError,
    selectedMagicScenario,
    selectedMagicOption,
    customMagicInput,
    customPrompt,
    showCustomPrompt,
    isGeneratingImage,
    generatedImageUrl,
    generationPrompt,
    showWaveLoader,
    showImageProcessing,
    uploadedImageB,
    imageBPreview,
    isOptimizingPrompt,
    optimizedPrompt,
    promptImprovements,
    selectedTemplate,
    viralTemplateConfirmed,
    isLoadingTransitions,
    transitionSuggestions,
    selectedTransition,
    selectedTransitionOption,
    customTransitionPrompt,
    showCustomTransition,
    isGeneratingVideo,
    videoProgress,
    processingId,
    finalVideoUrl,
    videoGenerationTasks,
    
    // Actions
    handleFileSelect,
    handleFileRemove,
    selectScenario,
    analyzeImage,
    selectMagicScenario,
    handleImageBSelect,
    handleImageBRemove,
    loadTransitionSuggestions,
    selectTransition,
    generateVideo,
    downloadVideo,
    resetToStart,
    setSelectedMethod,
    setSelectedMagicOption,
    setCustomMagicInput,
    setSelectedTemplate,
    setViralTemplateConfirmed,
    setSelectedTransition,
    setSelectedTransitionOption,
    setCustomTransitionPrompt,
    setUploadedImage,
    setUploadedImageB,
    setImageBPreview
  }
}
