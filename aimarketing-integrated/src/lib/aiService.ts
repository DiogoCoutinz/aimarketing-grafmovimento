// lib/aiService.ts

import { grafmovimentoAdapter } from './grafmovimentoAdapter'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Feature flag para usar backend real vs mocks
const USE_REAL_BACKEND = process.env.NEXT_PUBLIC_USE_REAL_BACKEND === 'true' || false;

export interface ImageAnalysis {
  productType: string;
  dominantColors: string[];
  style: string;
  mood: string;
  suggestedScenarios: Array<{
    id: string;
    name: string;
    description: string;
    prompt: string;
  }>;
}

export interface TransitionSuggestion {
  id: string;
  name: string;
  description: string;
  prompt: string;
  duration: number;
  complexity: 'simple' | 'medium' | 'complex';
}

export interface AudioSuggestion {
  id: string;
  name: string;
  artist: string;
  duration: number;
  mood: string;
  genre: string;
  previewUrl: string;
  downloadUrl: string;
  matchScore: number;
  description: string;
}

export interface VideoGenerationSettings {
  duration: number;
  quality: 'SD' | 'HD' | '4K';
  format: 'MP4' | 'MOV' | 'AVI';
  aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
}

export interface VideoStatus {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  message?: string;
}

class AIService {
  private isDevelopmentMode(): boolean {
    // Check if we're in development and edge functions might not be deployed
    return process.env.NODE_ENV === 'development' || !SUPABASE_ANON_KEY || SUPABASE_URL.includes('localhost');
  }

  private async callEdgeFunction(functionName: string, payload: Record<string, unknown>) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (this.isDevelopmentMode()) {
          console.warn(`Edge function ${functionName} not available in development mode, using mock response`);
          return this.getMockResponse(functionName, payload);
        }
        throw new Error(`Edge function ${functionName} failed: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (this.isDevelopmentMode()) {
        console.warn(`Edge function ${functionName} failed, using mock response:`, error);
        return this.getMockResponse(functionName, payload);
      }
      throw error;
    }
  }

  private getMockResponse(functionName: string, payload: Record<string, unknown>): unknown {
    switch (functionName) {
      case 'analyze-image':
        return {
          success: true,
          analysis: {
            productType: 'Produto Digital',
            dominantColors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'],
            style: 'Moderno e Minimalista',
            mood: 'Profissional e Criativo',
            suggestedScenarios: [
              {
                id: 'futuristic_tech',
                name: 'Transformação Tecnológica',
                description: 'Produto se transforma em versão futurista com hologramas e efeitos neon',
                prompt: 'Transform the product into a futuristic technological version with holographic overlays, neon lighting, and digital particle effects'
              },
              {
                id: 'magical_reveal',
                name: 'Revelação Mágica',
                description: 'Produto emerge de uma explosão de partículas douradas mágicas',
                prompt: 'Create a magical reveal with golden particles, ethereal light beams, and enchanting sparkle effects'
              },
              {
                id: 'dramatic_transformation',
                name: 'Transformação Dramática',
                description: 'Mudança cinematográfica com efeitos de impacto visual',
                prompt: 'Generate a dramatic cinematic transformation with powerful visual impact and professional lighting'
              }
            ]
          }
        };

      case 'generate-image':
        return {
          success: true,
          generatedImageUrl: 'https://picsum.photos/800/600?random=' + Math.floor(Math.random() * 1000),
          prompt: payload.customPrompt || 'AI-generated transformation of the original image with creative enhancements'
        };

      case 'suggest-transitions':
        return {
          success: true,
          suggestions: [
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
              name: 'Morfose Dinâmica',
              description: 'Transformação fluida entre as duas imagens',
              prompt: 'Create a dynamic morphing transition that fluidly transforms between the images',
              duration: 4,
              complexity: 'medium'
            },
            {
              id: 'explosive_change',
              name: 'Mudança Explosiva',
              description: 'Transição com efeitos de explosão e partículas',
              prompt: 'Generate an explosive transition with particle effects and dramatic impact',
              duration: 5,
              complexity: 'complex'
            }
          ]
        };

      case 'optimize-prompt':
        return {
          success: true,
          originalPrompt: payload.userPrompt,
          optimizedPrompt: `Enhanced professional version: ${payload.userPrompt} with cinematic lighting, high-quality textures, and optimal composition for maximum visual impact`,
          improvements: [
            'Adicionada iluminação cinematográfica',
            'Melhorada a composição visual',
            'Otimizado para máximo impacto',
            'Adicionados detalhes profissionais'
          ]
        };

      case 'generate-video':
        return {
          success: true,
          processingId: 'mock_processing_' + Math.random().toString(36).substr(2, 9),
          estimatedTime: 30
        };

      case 'check-video-status':
        // Simulate video processing progress
        const mockProgress = Math.min(100, (Date.now() % 30000) / 300); // 30 second cycle
        if (mockProgress >= 99) {
          return {
            success: true,
            status: 'completed',
            progress: 100,
            videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
            thumbnailUrl: 'https://picsum.photos/640/360?random=' + Math.floor(Math.random() * 1000),
            message: 'Video generation completed successfully!'
          };
        } else {
          return {
            success: true,
            status: 'processing',
            progress: Math.floor(mockProgress),
            message: 'Processing your video...'
          };
        }

      case 'suggest-audio':
        return {
          success: true,
          suggestions: [
            {
              id: 'upbeat_electronic',
              name: 'Electronic Vibes',
              artist: 'AI Music',
              duration: 30,
              mood: 'Energetic',
              genre: 'Electronic',
              previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              downloadUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
              matchScore: 95,
              description: 'Perfect for modern, tech-focused content'
            }
          ]
        };

      default:
        return {
          success: true,
          message: `Mock response for ${functionName}`,
          data: payload
        };
    }
  }

  // Convert File to base64 for API calls
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  // Convert File to URL for API calls
  private async fileToUrl(file: File): Promise<string> {
    // In production, you would upload to Supabase Storage and return the URL
    // For now, we'll create a temporary URL
    return URL.createObjectURL(file);
  }

  /**
   * Analyze an image to identify product, style, and suggest scenarios
   */
  async analyzeImage(imageFile: File): Promise<ImageAnalysis> {
    try {
      // 🔥 USAR BACKEND REAL SE FLAG ATIVADA
      if (USE_REAL_BACKEND) {
        console.log('🚀 Usando backend real para analyzeImage')
        return await grafmovimentoAdapter.analyzeImage(imageFile)
      }
      
      // Fallback para mocks em desenvolvimento
      const imageUrl = await this.fileToUrl(imageFile);
      const imageBase64 = await this.fileToBase64(imageFile);
      
      const response = await this.callEdgeFunction('analyze-image', {
        imageUrl,
        imageBase64
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to analyze image');
      }

      return response.analysis;
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  }

  /**
   * Generate Image B based on Image A and selected scenario
   */
  async generateImage(
    baseImageFile: File, 
    scenario: string, 
    customPrompt?: string,
    style?: string
  ): Promise<{ imageUrl: string; prompt: string }> {
    try {
      // 🔍 DEBUG: Verificar flag
      console.log('🔍 DEBUG generateImage - USE_REAL_BACKEND:', USE_REAL_BACKEND)
      console.log('🔍 DEBUG generateImage - NEXT_PUBLIC_USE_REAL_BACKEND:', process.env.NEXT_PUBLIC_USE_REAL_BACKEND)
      
      // 🔥 USAR BACKEND REAL SE FLAG ATIVADA
      if (USE_REAL_BACKEND) {
        console.log('🚀 Usando backend real para generateImage')
        return await grafmovimentoAdapter.generateImage(baseImageFile, scenario, customPrompt, style)
      }
      
      // Fallback para mocks
      const baseImageUrl = await this.fileToUrl(baseImageFile);
      
      const response = await this.callEdgeFunction('generate-image', {
        baseImageUrl,
        scenario,
        customPrompt,
        style
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to generate image');
      }

      return {
        imageUrl: response.generatedImageUrl,
        prompt: response.prompt
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  /**
   * Get AI-suggested transitions between two images
   */
  async suggestTransitions(
    imageAFile: File,
    imageBFile: File,
    concept?: string,
    style?: string
  ): Promise<TransitionSuggestion[]> {
    try {
      // 🔥 USAR BACKEND REAL SE FLAG ATIVADA
      if (USE_REAL_BACKEND) {
        console.log('🚀 Usando backend real para suggestTransitions')
        return await grafmovimentoAdapter.suggestTransitions(imageAFile, imageBFile, concept, style)
      }
      
      // Fallback para mocks
      const imageAUrl = await this.fileToUrl(imageAFile);
      const imageBUrl = await this.fileToUrl(imageBFile);
      
      const response = await this.callEdgeFunction('suggest-transitions', {
        imageAUrl,
        imageBUrl,
        concept,
        style
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to suggest transitions');
      }

      return response.suggestions;
    } catch (error) {
      console.error('Error suggesting transitions:', error);
      throw error;
    }
  }

  /**
   * Optimize a user-written prompt for better video generation
   */
  async optimizePrompt(
    userPrompt: string,
    context?: {
      imageADescription?: string;
      imageBDescription?: string;
      style?: string;
      mood?: string;
    }
  ): Promise<{ originalPrompt: string; optimizedPrompt: string; improvements: string[] }> {
    try {
      const response = await this.callEdgeFunction('optimize-prompt', {
        userPrompt,
        context
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to optimize prompt');
      }

      return {
        originalPrompt: response.originalPrompt,
        optimizedPrompt: response.optimizedPrompt,
        improvements: response.improvements
      };
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      throw error;
    }
  }

  /**
   * Generate video from images and transition prompt
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
      // 🔥 USAR BACKEND REAL SE FLAG ATIVADA
      if (USE_REAL_BACKEND) {
        console.log('🚀 Usando backend real para generateVideo')
        return await grafmovimentoAdapter.generateVideo(imageAFile, transitionPrompt, settings, scenario, imageBFile, template)
      }
      
      // Fallback para mocks
      const imageAUrl = await this.fileToUrl(imageAFile);
      const imageBUrl = imageBFile ? await this.fileToUrl(imageBFile) : undefined;
      
      const response = await this.callEdgeFunction('generate-video', {
        imageAUrl,
        imageBUrl,
        transitionPrompt,
        settings,
        scenario,
        template
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to start video generation');
      }

      return {
        processingId: response.processingId,
        estimatedTime: response.estimatedTime
      };
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  }

  /**
   * Check video generation status
   */
  async checkVideoStatus(processingId: string): Promise<VideoStatus> {
    try {
      // 🔥 USAR BACKEND REAL SE FLAG ATIVADA
      if (USE_REAL_BACKEND) {
        console.log('🚀 Usando backend real para checkVideoStatus')
        return await grafmovimentoAdapter.checkVideoStatus(processingId)
      }
      
      // Fallback para mocks
      const response = await this.callEdgeFunction('check-video-status', {
        processingId
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to check video status');
      }

      return {
        status: response.status,
        progress: response.progress,
        videoUrl: response.videoUrl,
        thumbnailUrl: response.thumbnailUrl,
        message: response.message
      };
    } catch (error) {
      console.error('Error checking video status:', error);
      throw error;
    }
  }

  /**
   * Get AI-suggested audio tracks based on video analysis
   */
  async suggestAudio(
    videoUrl?: string,
    videoAnalysis?: {
      duration: number;
      mood: string;
      rhythm: 'slow' | 'medium' | 'fast';
      colors: string[];
      style: string;
    }
  ): Promise<AudioSuggestion[]> {
    try {
      const response = await this.callEdgeFunction('suggest-audio', {
        videoUrl,
        videoAnalysis
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to suggest audio');
      }

      return response.suggestions;
    } catch (error) {
      console.error('Error suggesting audio:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiService = new AIService();