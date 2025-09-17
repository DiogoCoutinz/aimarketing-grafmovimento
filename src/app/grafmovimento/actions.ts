'use server'

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { fal } from '@fal-ai/client'

// Configurar fal.ai
fal.config({
  credentials: process.env.FAL_KEY || ''
})

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
    console.log(`🎨 Gerando Imagem B para projeto ${projectId} (fal.ai)`)
    console.log(`📝 Prompt original: ${prompt}`)
    console.log(`🖼️ Imagem A: ${imageAUrl}`)
    console.log('🔑 FAL_KEY presente:', !!process.env.FAL_KEY)
    
    // Garantir que prompt é string (pode vir como array das sugestões)
    let finalPrompt = prompt
    if (typeof prompt !== 'string') {
      try {
        const parsed = JSON.parse(prompt)
        if (Array.isArray(parsed)) {
          finalPrompt = parsed[0] // Usar primeira sugestão se for array
          console.log(`🔧 Convertido array para string: ${finalPrompt}`)
        }
        } catch {
          console.warn('⚠️ Erro ao parse prompt, usando original')
        }
    }
    
    console.log(`📝 Prompt final: ${finalPrompt}`)
    
    const supabase = await createClient()
    
    // Atualizar status para generating_image_b
    await supabase
      .from('grafmovimento_projects')
      .update({ status: 'generating_image_b_waiting' })
      .eq('id', projectId)

    // Criar task no fal.ai com webhook
    console.log('🚀 Enviando para fal.ai com webhook...')
    
    const { request_id } = await fal.queue.submit('fal-ai/bytedance/seedream/v4/edit', {
      input: {
        prompt: finalPrompt,
        image_urls: [imageAUrl],
        image_size: 'square_hd',
        max_images: 1,
        enable_safety_checker: true
      },
      webhookUrl: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://aimarketing-grafmovimento.vercel.app'}/api/grafmovimento/fal-webhook`
    })

    console.log(`✅ Task fal.ai criada: ${request_id}`)

    // Salvar request_id na base de dados
    const { data: updatedProject, error } = await supabase
      .from('grafmovimento_projects')
      .update({
        status: 'generating_image_b_waiting',
        kie_task_id: request_id, // Usar request_id do fal.ai
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
    // O webhook vai atualizar quando completar
    return {
      ...updatedProject,
      request_id // Para debug, se necessário
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

// Função para gerar sugestões de prompts de transição
export async function generateTransitionPrompts(projectId: string) {
  try {
    console.log(`🎬 Gerando prompts de transição para projeto ${projectId}`)
    
    const supabase = await createClient()
    
    // Buscar projeto para contexto
    const { data: project, error } = await supabase
      .from('grafmovimento_projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (error || !project) {
      throw new Error(`Projeto não encontrado: ${error?.message}`)
    }
    
    const openai = getOpenAIClient()
    
    const prompt = `
Analisa estas duas imagens e o contexto da transformação:

IMAGEM A: ${project.image_a_url}
IMAGEM B: ${project.image_b_url}
PROMPT USADO: ${project.image_b_prompt}

Cria 3 prompts de transição cinematográfica para um vídeo de 6 segundos que conecte estas duas imagens de forma suave e envolvente.

Foca em:
- Movimento de câmara interessante
- Transições visuais fluidas
- Elementos que conectam as duas cenas
- Atmosfera cinematográfica

Retorna apenas os 3 prompts, um por linha, sem numeração.
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'És um especialista em direção cinematográfica e criação de vídeos. Crias prompts que resultam em transições visuais impressionantes.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.8
    })

    const suggestions = completion.choices[0]?.message?.content
      ?.split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 3) || []

    console.log('✅ Sugestões de transição geradas:', suggestions)
    return suggestions

  } catch (error) {
    console.error('❌ Erro ao gerar prompts de transição:', error)
    
    // Fallback suggestions
    return [
      'Smooth cinematic zoom out revealing the transformation with dynamic lighting',
      'Elegant camera pan with particles and smooth morphing effects',
      'Dramatic fade transition with swirling motion and depth of field'
    ]
  }
}

// Função para gerar vídeo A→B usando fal.ai minimax
export async function generateVideo(
  projectId: string,
  transitionPrompt: string
) {
  try {
    console.log(`🎬 Gerando vídeo para projeto ${projectId} (fal.ai minimax)`)
    console.log(`📝 Transition prompt: ${transitionPrompt}`)
    
    const supabase = await createClient()
    
    // Buscar projeto para obter as imagens
    const { data: project, error: fetchError } = await supabase
      .from('grafmovimento_projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (fetchError || !project) {
      throw new Error(`Projeto não encontrado: ${fetchError?.message}`)
    }
    
    if (!project.image_a_url || !project.image_b_url) {
      throw new Error('Imagens A e B são necessárias para gerar vídeo')
    }
    
    console.log(`🖼️ Imagem A: ${project.image_a_url}`)
    console.log(`🖼️ Imagem B: ${project.image_b_url}`)
    console.log('🔑 FAL_KEY presente:', !!process.env.FAL_KEY)
    
    // Atualizar status para generating_video
    await supabase
      .from('grafmovimento_projects')
      .update({ 
        status: 'generating_video_waiting',
        transition_prompt: transitionPrompt
      })
      .eq('id', projectId)

    // Criar task no fal.ai minimax com webhook
    console.log('🚀 Enviando para fal.ai minimax com webhook...')
    
    // Criar input object com end_image_url (pode não estar nos tipos ainda)
    const videoInput = {
      prompt: `${transitionPrompt}. Create a smooth 6-second video transition.`,
      image_url: project.image_a_url,
      end_image_url: project.image_b_url,
      duration: "6",
      prompt_optimizer: true,
      resolution: "768P"
    }

    const { request_id } = await fal.queue.submit('fal-ai/minimax/hailuo-02/standard/image-to-video', {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input: videoInput as any, // Bypass TypeScript até API types serem atualizados
      webhookUrl: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://aimarketing-grafmovimento.vercel.app'}/api/grafmovimento/video-webhook`
    })

    console.log(`✅ Task minimax criada: ${request_id}`)

    // Salvar video_request_id na base de dados
    const { data: updatedProject, error } = await supabase
      .from('grafmovimento_projects')
      .update({
        status: 'generating_video_waiting',
        kie_task_id: request_id, // Reusar campo para video request_id
        error_message: null
      })
      .eq('id', projectId)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Erro ao salvar video request ID: ${error.message}`)
    }

    console.log('⏳ Vídeo sendo gerado... Aguardando webhook do minimax')
    
    return {
      ...updatedProject,
      video_request_id: request_id
    }

  } catch (error) {
    console.error('❌ Erro ao gerar vídeo:', error)
    
    // Atualizar status para erro
    const supabase = await createClient()
    await supabase
      .from('grafmovimento_projects')
      .update({ 
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Erro na geração do vídeo'
      })
      .eq('id', projectId)
    
    throw error
  }
}

// Placeholder para adicionar áudio (será implementado depois)
export async function addAudioToVideo(
  projectId: string,
  _audioId: string
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
