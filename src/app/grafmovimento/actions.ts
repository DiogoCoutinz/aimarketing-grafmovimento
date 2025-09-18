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
          content: `You are an expert creative director specializing in AI image transformations and video transitions.

CONTEXT: You'll analyze an image that will be transformed using Seedream V4 (image-to-image AI model) to create a destination image for video generation.

TASK: Create exactly 3 transformation suggestions that are:
1. TECHNICALLY VIABLE for AI image generation (avoid impossible physics, complex multi-step changes)
2. VISUALLY DRAMATIC yet achievable (lighting changes, style transfers, environment shifts work well)
3. DIVERSE in approach (one realistic, one stylistic, one fantastical)

OPTIMIZATION RULES:
- Focus on SINGLE major transformation (not multiple simultaneous changes)
- Emphasize lighting, atmosphere, and mood changes (AI excels at these)
- Include specific visual elements: colors, textures, lighting direction
- Avoid complex object manipulation or fine details
- Consider the original composition and work WITH it, not against it

RETURN FORMAT: {"suggestions": ["suggestion1", "suggestion2", "suggestion3"]}

EXAMPLES OF GOOD SUGGESTIONS:
- "Transform into a dramatic noir scene with stark black and white contrast and moody shadows"
- "Shift to a vibrant cyberpunk aesthetic with neon purple and blue lighting effects"
- "Convert to a dreamy watercolor painting style with soft pastel tones and ethereal atmosphere"`
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
    console.log('🔍 Raw OpenAI response:', jsonResponse)
    
    let suggestions: string[] = []
    
    try {
      const parsedResponse = JSON.parse(jsonResponse)
      console.log('📦 Parsed response:', parsedResponse)
      
      // Tentar diferentes estruturas possíveis
      if (Array.isArray(parsedResponse)) {
        suggestions = parsedResponse
      } else if (parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
        suggestions = parsedResponse.suggestions
      } else if (typeof parsedResponse === 'object') {
        // Se for objeto, pegar os values que são strings
        const values = Object.values(parsedResponse)
        suggestions = values.filter((v): v is string => typeof v === 'string')
      }
      
      // Se ainda não temos sugestões válidas, tentar split por padrões
      if (suggestions.length === 0 && typeof jsonResponse === 'string') {
        // Tentar encontrar padrões como "1.", "2.", "3." ou quebras de linha
        const lines = jsonResponse
          .split(/\d+\.|[\n\r]+|(?=Transform)|(?=Convert)|(?=Place)|(?=Shift)|(?=Morph)/)
          .map(line => line.trim())
          .filter(line => line.length > 10) // Filtrar linhas muito pequenas
          
        suggestions = lines.slice(0, 3)
      }
      
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse JSON:', parseError)
    }

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
    
    // Garantir que prompt é string e otimizar para Seedream V4
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
    
    // Otimizar prompt para Seedream V4 Edit (melhor qualidade e controle)
    const optimizedPrompt = `${finalPrompt}, high quality, detailed, professional photography, sharp focus, good lighting, realistic textures, maintain composition, preserve main subject`
    
    console.log(`📝 Original prompt: ${finalPrompt}`)
    console.log(`🎯 Optimized prompt: ${optimizedPrompt}`)
    
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
        prompt: optimizedPrompt,
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
CONTEXT: Create video transition prompts for Minimax Hailuo-02 (image-to-video AI model)
DURATION: 6 seconds
IMAGES: A→B transformation
TRANSFORMATION: ${project.image_b_prompt}

TECHNICAL REQUIREMENTS for Minimax optimization:
- Start with camera movement description (zoom, pan, dolly, orbit)
- Include temporal progression (gradual, sudden, rhythmic)
- Specify visual effects that work well with AI video generation
- Focus on smooth, continuous motion rather than cuts or jumps

PROMPT STRUCTURE: [Camera Movement] + [Visual Transition] + [Atmosphere/Mood] + [Technical Quality]

Create 3 distinct video transition prompts:

1. CINEMATIC APPROACH: Professional camera work with dramatic movement
2. SMOOTH MORPH: Focus on seamless transformation between states  
3. DYNAMIC ENERGY: Bold, energetic transition with visual flair

Each prompt should be 15-25 words, technically precise, and optimized for AI video generation.

EXAMPLES:
- "Smooth dolly zoom out revealing transformation, cinematic lighting transition, professional color grading, fluid motion"
- "Gentle camera orbit around subject as gradual morphing occurs, soft atmospheric particles, dreamy transition"
- "Dynamic push-in with swirling energy effects, dramatic lighting shift, bold cinematic transformation"

Return only the 3 prompts, one per line, no numbering:`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a technical director specializing in AI video generation and prompt optimization. You understand the capabilities and limitations of image-to-video models like Minimax Hailuo-02. Your prompts consistently produce smooth, cinematic results with optimal motion and visual quality.'
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
    
    // Otimizar prompt para Minimax Hailuo-02
    const optimizedPrompt = `${transitionPrompt}, high quality cinematic video, smooth motion, professional color grading, no artifacts, stable camera work, seamless transformation, 6 second duration`
    
    // Criar input object com end_image_url (pode não estar nos tipos ainda)
    const videoInput = {
      prompt: optimizedPrompt,
      image_url: project.image_a_url,
      end_image_url: project.image_b_url,
      duration: "6",
      prompt_optimizer: true, // Let Minimax optimize further
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
