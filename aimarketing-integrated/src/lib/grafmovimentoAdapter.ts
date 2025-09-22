// lib/grafmovimentoAdapter.ts

'use client'

import { 
  createGrafMovimentoProject,
  getGrafMovimentoProjectStatus,
  updateGrafMovimentoProject,
  analyzeImageA,
  generateImageB,
  generateTransitionPrompts,
  generateVideo,
  type GrafMovimentoProject
} from '@/app/grafmovimento/actions'
import type { 
  ImageAnalysis, 
  TransitionSuggestion, 
  VideoGenerationSettings, 
  VideoStatus 
} from './aiService'

/**
 * Adapter que conecta o frontend mock ao backend real do GrafMovimento
 * Converte interface stateless (Files) para stateful (Projects)
 */
class GrafMovimentoAdapter {
  private projectId: string | null = null
  private projectCache = new Map<string, GrafMovimentoProject>()
  
  /**
   * Cria um novo projeto ou reutiliza existente para a sessão
   */
  private async ensureProject(imageFile?: File): Promise<string> {
    if (!this.projectId && imageFile) {
      const formData = new FormData()
      formData.append('image_a', imageFile)
      
      const project = await createGrafMovimentoProject(formData)
      this.projectId = project.id
      console.log('🆔 Novo projeto GrafMovimento criado:', this.projectId)
    }
    
    if (!this.projectId) {
      throw new Error('Nenhum projeto ativo. Faça upload de uma imagem primeiro.')
    }
    
    return this.projectId
  }

  /**
   * Analisa uma imagem e retorna sugestões de transformação
   */
  async analyzeImage(imageFile: File): Promise<ImageAnalysis> {
    try {
      const projectId = await this.ensureProject(imageFile)
      
      // Chamar análise real do backend
      const result = await analyzeImageA(projectId)
      
      if (!result.success || !result.analysis) {
        throw new Error('Falha na análise da imagem')
      }

      // Retornar formato compatível com frontend
      return {
        productType: result.analysis.productType || 'Produto Identificado',
        dominantColors: result.analysis.dominantColors || ['#FF6B6B', '#4ECDC4', '#45B7D1'],
        style: result.analysis.style || 'Análise OpenAI',
        mood: result.analysis.mood || 'Criativo',
        suggestedScenarios: result.analysis.suggestedScenarios || []
      }

    } catch (error) {
      console.error('❌ Erro no adapter analyzeImage:', error)
      throw error
    }
  }

  /**
   * Gera imagem B baseada na imagem A e cenário selecionado
   */
  async generateImage(
    baseImageFile: File, 
    scenario: string, 
    customPrompt?: string,
    style?: string
  ): Promise<{ imageUrl: string; prompt: string }> {
    try {
      const projectId = await this.ensureProject(baseImageFile)
      
      // Usar prompt customizado ou cenário
      const finalPrompt = customPrompt || scenario
      
      // Obter URL da imagem A do projeto
      const projectStatus = await getGrafMovimentoProjectStatus(projectId)
      const imageAUrl = projectStatus.image_a_url
      
      if (!imageAUrl) {
        throw new Error('URL da imagem A não encontrada no projeto')
      }
      
      // Gerar imagem B usando backend real
      console.log('🎨 Gerando imagem B com prompt:', finalPrompt)
      const result = await generateImageB(projectId, imageAUrl, finalPrompt)
      
      // ✅ EM DESENVOLVIMENTO: Polling direto do fal.ai (sem webhook)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 DESENVOLVIMENTO - Fazendo polling direto do fal.ai...')
        
        const fal = await import('fal')
        let attempts = 0
        const maxAttempts = 30
        
        while (attempts < maxAttempts) {
          try {
            // Buscar status diretamente do fal.ai
            const falStatus = await fal.default.queue.status('fal-ai/bytedance/seedream/v4/edit', { 
              request_id: result.request_id 
            })
            
            console.log(`🔍 FAL.AI POLLING [${attempts + 1}/${maxAttempts}] - Status:`, falStatus.status)
            
            if (falStatus.status === 'COMPLETED') {
              const imageUrl = falStatus.data?.images?.[0]?.url
              if (imageUrl) {
                console.log('✅ FAL.AI POLLING - Imagem encontrada!', imageUrl)
                
                // Atualizar projeto na database
                await updateGrafMovimentoProject(projectId, {
                  image_b_url: imageUrl,
                  status: 'image_b_generated'
                })
                
                return {
                  imageUrl,
                  prompt: finalPrompt
                }
              }
            }
            
            if (falStatus.status === 'FAILED') {
              console.log('❌ FAL.AI POLLING - Erro detectado:', falStatus.error)
              throw new Error(`fal.ai error: ${falStatus.error}`)
            }
            
          } catch (falError) {
            console.warn('⚠️ Erro no polling fal.ai, tentando database:', falError)
          }
          
          // Fallback: tentar database também
          const dbStatus = await getGrafMovimentoProjectStatus(projectId)
          if (dbStatus.status === 'image_b_generated' && dbStatus.image_b_url) {
            console.log('✅ DATABASE FALLBACK - Imagem encontrada!', dbStatus.image_b_url)
            return {
              imageUrl: dbStatus.image_b_url,
              prompt: finalPrompt
            }
          }
          
          console.log('⏳ FAL.AI POLLING - Aguardando 3 segundos...')
          await new Promise(resolve => setTimeout(resolve, 3000))
          attempts++
        }
        
      } else {
        // ✅ EM PRODUÇÃO: Polling da database (com webhook)
        console.log('🔄 PRODUÇÃO - Fazendo polling da database (webhook)...')
        
        let attempts = 0
        const maxAttempts = 30
        
        while (attempts < maxAttempts) {
          const status = await getGrafMovimentoProjectStatus(projectId)
          
          console.log(`🔍 DB POLLING [${attempts + 1}/${maxAttempts}] - Status:`, status.status)
          console.log(`🔍 DB POLLING - image_b_url:`, status.image_b_url ? 'PRESENTE' : 'AUSENTE')
          
          if (status.status === 'image_b_generated' && status.image_b_url) {
            console.log('✅ DB POLLING - Imagem B encontrada!', status.image_b_url)
            return {
              imageUrl: status.image_b_url,
              prompt: finalPrompt
            }
          }
          
          if (status.status === 'error') {
            console.log('❌ DB POLLING - Erro detectado:', status.error_message)
            throw new Error(status.error_message || 'Erro na geração da imagem B')
          }
          
          console.log('⏳ DB POLLING - Aguardando 2 segundos...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          attempts++
        }
      }
      
      throw new Error('Timeout na geração da imagem B')

    } catch (error) {
      console.error('❌ Erro no adapter generateImage:', error)
      throw error
    }
  }

  /**
   * Sugere transições entre duas imagens
   */
  async suggestTransitions(
    imageAFile: File,
    imageBFile?: File,
    concept?: string,
    style?: string
  ): Promise<TransitionSuggestion[]> {
    try {
      const projectId = await this.ensureProject(imageAFile)
      
      // Gerar prompts de transição usando backend real
      const suggestions = await generateTransitionPrompts(projectId)
      
      // Converter para formato esperado pelo frontend
      return suggestions.map((suggestion, index) => ({
        id: `transition_${index + 1}`,
        name: `Transição ${index + 1}`,
        description: suggestion,
        prompt: suggestion,
        duration: 6,
        complexity: 'medium' as const
      }))

    } catch (error) {
      console.error('❌ Erro no adapter suggestTransitions:', error)
      throw error
    }
  }

  /**
   * Gera vídeo A→B usando as imagens e prompt de transição
   */
  async generateVideo(
    imageAFile: File,
    transitionPrompt: string,
    settings: VideoGenerationSettings,
    scenario: 'magic' | 'creative' | 'viral',
    imageBFile?: File,
    template?: string
  ): Promise<{ processingId: string; estimatedTime: number }> {
    try {
      const projectId = await this.ensureProject(imageAFile)
      
      // Gerar vídeo usando backend real
      console.log('🎬 Iniciando geração de vídeo com prompt:', transitionPrompt)
      const result = await generateVideo(projectId, transitionPrompt)
      
      return {
        processingId: projectId, // Usar projectId como processingId
        estimatedTime: 60 // Estimativa de 60 segundos
      }

    } catch (error) {
      console.error('❌ Erro no adapter generateVideo:', error)
      throw error
    }
  }

  /**
   * Verifica status de geração de vídeo
   */
  async checkVideoStatus(processingId: string): Promise<VideoStatus> {
    try {
      const projectStatus = await getGrafMovimentoProjectStatus(processingId)
      
      // Mapear status do backend para frontend
      let status: 'processing' | 'completed' | 'failed' = 'processing'
      let progress = 0
      let videoUrl: string | undefined
      let message = 'Processando vídeo...'
      
      switch (projectStatus.status) {
        case 'video_generated':
        case 'completed':
          status = 'completed'
          progress = 100
          videoUrl = projectStatus.video_url || undefined
          message = 'Vídeo gerado com sucesso!'
          break
          
        case 'error':
          status = 'failed'
          progress = 0
          message = projectStatus.error_message || 'Erro na geração do vídeo'
          break
          
        case 'generating_video_waiting':
        case 'generating_video':
          status = 'processing'
          progress = 50
          message = 'Gerando vídeo com AI...'
          break
          
        case 'generating_image_b_waiting':
        case 'generating_image_b':
          status = 'processing'
          progress = 25
          message = 'Gerando imagem de destino...'
          break
          
        default:
          status = 'processing'
          progress = Math.min(90, (Date.now() % 60000) / 600) // Simular progresso
      }
      
      return {
        status,
        progress,
        videoUrl,
        message
      }

    } catch (error) {
      console.error('❌ Erro no adapter checkVideoStatus:', error)
      return {
        status: 'failed',
        progress: 0,
        message: 'Erro ao verificar status do vídeo'
      }
    }
  }

  /**
   * Limpa o projeto atual (útil para começar novo workflow)
   */
  clearCurrentProject() {
    this.projectId = null
    this.projectCache.clear()
    console.log('🧹 Projeto atual limpo')
  }

  /**
   * Obtém o ID do projeto atual
   */
  getCurrentProjectId(): string | null {
    return this.projectId
  }
}

// Export singleton instance
export const grafmovimentoAdapter = new GrafMovimentoAdapter()
export default grafmovimentoAdapter

