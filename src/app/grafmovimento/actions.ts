'use server'

import OpenAI from 'openai'
import axios from 'axios'
import { createClient } from '@/lib/supabase/server'

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY não encontrada no ambiente')
  }
  
  return new OpenAI({
    apiKey: apiKey,
  })
}

// Interface para o projeto GrafMovimento
interface GrafMovimentoProject {
  id?: string
  status: string
  image_a_url?: string
  image_b_url?: string
  image_b_source?: 'ai_suggestion' | 'user_prompt' | 'user_upload'
  image_b_prompt?: string
  transition_prompt?: string
  selected_audio_id?: string
  video_url?: string
  final_video_url?: string
  image_a_analysis?: Record<string, unknown>
  error_message?: string
}

// Função para criar um novo projeto
export async function createGrafMovimentoProject(formData: FormData) {
  try {
    const supabase = await createClient()
    let imageAUrl: string | null = null

    // Upload da imagem A se foi fornecida
    const imageA = formData.get('image_a') as File | null
    if (imageA && imageA.size > 0) {
      const fileName = `grafmovimento/image-a-${Date.now()}-${imageA.name}`
      
      console.log('🖼️ Upload de Imagem A iniciado:', fileName.split('/').pop())
      
      // Upload para Supabase Storage
      const bucketName = 'grafmovimento-uploads'
      const { data: buckets } = await supabase.storage.listBuckets()
      
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
      if (!bucketExists) {
        console.log('🏗️ Criando bucket grafmovimento-uploads...')
        await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 50 * 1024 * 1024
        })
      }
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, imageA)

      if (uploadError) {
        throw new Error(`Erro ao fazer upload da Imagem A: ${uploadError.message}`)
      }

      // Obter URL público da imagem
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(uploadData.path)
      
      imageAUrl = publicUrl
      console.log('✅ Upload da Imagem A concluído')
    }

    // Inserir projeto na base de dados
    const { data: newProject, error: dbError } = await supabase
      .from('grafmovimento_projects')
      .insert({
        status: 'pending',
        image_a_url: imageAUrl
      })
      .select('*')
      .single()

    if (dbError) {
      throw new Error(`Erro ao criar projeto: ${dbError.message}`)
    }

    console.log('✅ Projeto GrafMovimento criado:', newProject.id)

    // TODO: Iniciar processamento em background
    // await processGrafMovimentoProject(newProject.id)

    return newProject

  } catch (error) {
    console.error('❌ Erro ao criar projeto GrafMovimento:', error)
    throw error
  }
}

// Função para buscar status de um projeto
export async function getGrafMovimentoProjectStatus(projectId: string) {
  try {
    const supabase = await createClient()
    
    const { data: project, error } = await supabase
      .from('grafmovimento_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error) {
      throw new Error(`Erro ao buscar projeto: ${error.message}`)
    }

    return project

  } catch (error) {
    console.error('❌ Erro ao buscar projeto:', error)
    throw error
  }
}

// Função para atualizar projeto (placeholder)
export async function updateGrafMovimentoProject(
  projectId: string, 
  updates: Partial<GrafMovimentoProject>
) {
  try {
    const supabase = await createClient()
    
    const { data: project, error } = await supabase
      .from('grafmovimento_projects')
      .update(updates)
      .eq('id', projectId)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar projeto: ${error.message}`)
    }

    return project

  } catch (error) {
    console.error('❌ Erro ao atualizar projeto:', error)
    throw error
  }
}

// Placeholder para análise da Imagem A (será implementado depois)
export async function analyzeImageA(projectId: string) {
  try {
    console.log('🔍 Analisando Imagem A do projeto:', projectId)
    
    // TODO: Implementar análise com OpenAI
    // const analysis = await analyzeWithOpenAI(imageAUrl)
    
    // Placeholder - atualizar status
    await updateGrafMovimentoProject(projectId, {
      status: 'image_a_analyzed',
      image_a_analysis: { placeholder: 'analysis_result' }
    })
    
    return { success: true }

  } catch (error) {
    console.error('❌ Erro ao analisar Imagem A:', error)
    
    await updateGrafMovimentoProject(projectId, {
      status: 'error',
      error_message: error instanceof Error ? error.message : 'Erro desconhecido'
    })
    
    throw error
  }
}

// Função para salvar escolhas da Imagem B
export async function saveImageBChoice(
  projectId: string,
  method: 'ai_suggestion' | 'user_prompt' | 'user_upload',
  prompt?: string,
  imageB?: File
) {
  try {
    console.log(`💾 Salvando escolha Imagem B para projeto ${projectId} via ${method}`)
    
    const supabase = await createClient()
    let imageBUrl: string | null = null

    // Se foi upload de imagem, fazer upload
    if (method === 'user_upload' && imageB) {
      const fileName = `grafmovimento/image-b-${Date.now()}-${imageB.name}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('grafmovimento-uploads')
        .upload(fileName, imageB)

      if (uploadError) {
        throw new Error(`Erro ao fazer upload da Imagem B: ${uploadError.message}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('grafmovimento-uploads')
        .getPublicUrl(uploadData.path)
      
      imageBUrl = publicUrl
      console.log('✅ Upload da Imagem B concluído')
    }

    // Atualizar projeto na base de dados
    const updates: Partial<GrafMovimentoProject> = {
      image_b_source: method,
      status: 'image_b_selected'
    }

    if (prompt) updates.image_b_prompt = prompt
    if (imageBUrl) updates.image_b_url = imageBUrl

    const { data: updatedProject, error } = await supabase
      .from('grafmovimento_projects')
      .update(updates)
      .eq('id', projectId)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Erro ao salvar escolha: ${error.message}`)
    }

    console.log('✅ Escolha da Imagem B salva')
    return updatedProject

  } catch (error) {
    console.error('❌ Erro ao salvar escolha Imagem B:', error)
    throw error
  }
}

// Função para analisar Imagem A e gerar sugestões criativas
export async function generateAISuggestions(projectId: string) {
  try {
    console.log(`🤖 Gerando sugestões AI para projeto ${projectId}`)
    
    const supabase = await createClient()
    
    // Buscar a imagem A do projeto
    const { data: project, error } = await supabase
      .from('grafmovimento_projects')
      .select('image_a_url')
      .eq('id', projectId)
      .single()

    if (error || !project?.image_a_url) {
      throw new Error('Imagem A não encontrada')
    }

    console.log('🎨 Analisando imagem com OpenAI...')
    
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a creative AI agent specialized in image-to-video transitions. 

Your task: Analyze the given image and create exactly 3 creative transformation suggestions that would make compelling video transitions.

Consider:
- Colors, lighting, and mood of the image
- Objects, people, or brands visible
- Style and composition
- Creative potential for dramatic transitions

Generate suggestions that are:
- Visually striking and cinematic
- Feasible for AI image generation
- Different from each other (variety in style/mood)
- Specific and descriptive (not vague)

Return ONLY a JSON array with exactly 3 strings. No explanations.

Example format:
["Transform into a futuristic cyberpunk scene with neon lighting", "Convert to an ethereal watercolor painting in pastel tones", "Place in a dramatic thunderstorm with lightning effects"]`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this image and suggest 3 creative transformations for a video transition:'
            },
            {
              type: 'image_url',
              image_url: {
                url: project.image_a_url
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    })

    const jsonResponse = response.choices[0]?.message?.content
    if (!jsonResponse) {
      throw new Error('Resposta vazia da OpenAI')
    }

    // Parse da resposta JSON
    const parsedResponse = JSON.parse(jsonResponse)
    const suggestions = Array.isArray(parsedResponse) ? parsedResponse : 
                      parsedResponse.suggestions || 
                      Object.values(parsedResponse)

    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      console.warn('⚠️ Resposta OpenAI inválida, usando fallback')
      return [
        'Transform into a cyberpunk warrior in neon-lit cityscape',
        'Convert to watercolor painting with soft pastel colors',
        'Place in magical forest with glowing particles'
      ]
    }

    console.log('✅ Sugestões AI geradas:', suggestions.length)
    return suggestions.slice(0, 3) // Garantir máximo 3 sugestões

  } catch (error) {
    console.error('❌ Erro ao gerar sugestões AI:', error)
    
    // Fallback em caso de erro
    console.warn('⚠️ Usando sugestões fallback')
    return [
      'Transform into a cyberpunk warrior in neon-lit cityscape',
      'Convert to watercolor painting with soft pastel colors',
      'Place in magical forest with glowing particles'
    ]
  }
}

// Função para gerar Imagem B usando ByteDance Seedream V4 Edit
export async function generateImageB(
  projectId: string,
  imageAUrl: string,
  prompt: string
) {
  try {
    console.log(`🎨 Gerando Imagem B para projeto ${projectId}`)
    console.log(`📝 Prompt: ${prompt}`)
    console.log(`🖼️ Imagem A: ${imageAUrl}`)
    
    const supabase = await createClient()
    
    // Atualizar status para generating_image_b
    await supabase
      .from('grafmovimento_projects')
      .update({ status: 'generating_image_b' })
      .eq('id', projectId)

    // Criar task no KIE.ai SEM CALLBACK (polling manual estilo VEO3)
    console.log('🚀 Criando task no KIE.ai (polling manual)...')
    console.log('🔑 API Key presente:', !!process.env.KIE_AI_API_KEY)
    
    const createResponse = await axios.post(
      'https://api.kie.ai/api/v1/jobs/createTask',
      {
        model: 'bytedance/seedream-v4-edit',
        // callBackUrl removido - usamos polling manual
        input: {
          prompt: prompt,
          image_urls: [imageAUrl],
          image_size: 'square_hd',
          image_resolution: '2K',
          max_images: 1
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.KIE_AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    )

    const taskId = createResponse.data.data?.taskId
    if (!taskId) {
      throw new Error('Task ID não retornado pelo KIE.ai')
    }

    console.log(`✅ Task criada com callback: ${taskId}`)

    // Salvar taskId na base de dados e marcar como processando
    const { data: updatedProject, error } = await supabase
      .from('grafmovimento_projects')
      .update({
        status: 'generating_image_b_waiting',
        kie_task_id: taskId, // Guardar taskId para matching no callback
        error_message: null // Limpar erros anteriores
      })
      .eq('id', projectId)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Erro ao salvar task ID: ${error.message}`)
    }

    console.log('⏳ Imagem B sendo gerada... Aguardando callback do KIE.ai')
    
    // Retornar projeto em estado de processamento
    // O callback vai atualizar quando completar
    return {
      ...updatedProject,
      taskId // Para debug, se necessário
    }

  } catch (error) {
    console.error('❌ Erro ao gerar Imagem B:', error)
    
    // Atualizar status para erro
    const supabase = await createClient()
    await supabase
      .from('grafmovimento_projects')
      .update({ 
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Erro na geração da Imagem B'
      })
      .eq('id', projectId)
    
    throw error
  }
}

// Placeholder para geração de vídeo (será implementado depois)
export async function generateVideo(
  projectId: string,
  transitionPrompt: string
) {
  try {
    console.log(`🎬 Gerando vídeo para projeto ${projectId}`)
    
    // TODO: Implementar com fal-ai/minimax/hailuo-02/standard/image-to-video
    
    return { success: true }

  } catch (error) {
    console.error('❌ Erro ao gerar vídeo:', error)
    throw error
  }
}

// Placeholder para adicionar áudio (será implementado depois)
export async function addAudioToVideo(
  projectId: string,
  audioId: string
) {
  try {
    console.log(`🎵 Adicionando áudio ao vídeo do projeto ${projectId}`)
    
    // TODO: Implementar mixing de áudio
    
    return { success: true }

  } catch (error) {
    console.error('❌ Erro ao adicionar áudio:', error)
    throw error
  }
}
