'use server'

import { fal } from '@fal-ai/client'
import { createClient } from '@/lib/supabase/server'

// Configure fal.ai
fal.config({
  credentials: process.env.FAL_KEY || ''
})

interface TemplateProject {
  id: string
  template_id: string
  product_name: string
  product_image_url: string
  final_prompt: string
  video_url: string | null
  status: string
  veo3_request_id: string | null
  created_at: string
  error_message: string | null
}

// Template data (em produção seria da database)
const TEMPLATES = {
  'hero-product': {
    id: 'hero-product',
    title: 'Hero Product Showcase',
    prompt: 'A cinematic product showcase of {PRODUCT_NAME}, professional studio lighting, 360 degree rotation, dramatic zoom, premium aesthetic, high-end commercial style, luxury presentation, smooth camera movement'
  },
  'unboxing-reveal': {
    id: 'unboxing-reveal',
    title: 'Unboxing Reveal',
    prompt: 'Dramatic unboxing sequence of {PRODUCT_NAME}, hands carefully opening package, anticipation buildup, satisfying reveal moment, warm lighting, close-up details, excitement and discovery'
  },
  'lifestyle-action': {
    id: 'lifestyle-action',
    title: 'Lifestyle in Action',
    prompt: 'Person using {PRODUCT_NAME} in natural environment, authentic lifestyle moment, smooth camera movement, natural lighting, everyday scenario, real-world application'
  },
  'transformation': {
    id: 'transformation',
    title: 'Before & After',
    prompt: 'Before and after transformation using {PRODUCT_NAME}, dramatic reveal of improvement, split screen effect, compelling visual contrast, professional presentation, impactful results'
  },
  'tech-demo': {
    id: 'tech-demo',
    title: 'Tech Innovation',
    prompt: 'Futuristic technology demonstration of {PRODUCT_NAME}, sleek interface interactions, holographic elements, modern minimalist environment, cutting-edge aesthetics, innovation showcase'
  }
}

// Criar projeto de template
export async function createTemplateProject(
  templateId: string,
  productName: string,
  productImageFile: File
) {
  try {
    console.log(`🎬 Criando projeto de template: ${templateId}`)
    console.log(`📝 Produto: ${productName}`)
    
    const template = TEMPLATES[templateId as keyof typeof TEMPLATES]
    if (!template) {
      throw new Error(`Template ${templateId} não encontrado`)
    }
    
    const supabase = await createClient()
    
    // Upload da imagem do produto
    const fileName = `templates/${templateId}/product-${Date.now()}-${productImageFile.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('grafmovimento-uploads')
      .upload(fileName, productImageFile)
    
    if (uploadError) {
      throw new Error(`Erro no upload: ${uploadError.message}`)
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('grafmovimento-uploads')
      .getPublicUrl(uploadData.path)
    
    console.log('✅ Upload concluído:', publicUrl)
    
    // Gerar prompt final
    const finalPrompt = template.prompt.replace('{PRODUCT_NAME}', productName)
    
    // Criar projeto na database
    const { data: project, error: dbError } = await supabase
      .from('template_projects')
      .insert([{
        template_id: templateId,
        product_name: productName,
        product_image_url: publicUrl,
        final_prompt: finalPrompt,
        status: 'created'
      }])
      .select('*')
      .single()
    
    if (dbError) {
      throw new Error(`Erro na database: ${dbError.message}`)
    }
    
    console.log('✅ Projeto criado:', project.id)
    return project as TemplateProject
    
  } catch (error) {
    console.error('❌ Erro ao criar projeto:', error)
    throw error
  }
}

// Gerar vídeo com VEO3
export async function generateTemplateVideo(projectId: string) {
  try {
    console.log(`🎬 Gerando vídeo VEO3 para projeto: ${projectId}`)
    
    const supabase = await createClient()
    
    // Buscar projeto
    const { data: project, error: fetchError } = await supabase
      .from('template_projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (fetchError || !project) {
      throw new Error(`Projeto não encontrado: ${fetchError?.message}`)
    }
    
    // Atualizar status
    await supabase
      .from('template_projects')
      .update({ status: 'generating_video' })
      .eq('id', projectId)
    
    // Chamar VEO3 Fast
    console.log('🚀 Enviando para VEO3 Fast...')
    console.log('📝 Prompt:', project.final_prompt)
    
    const { request_id } = await fal.queue.submit('fal-ai/veo3/fast', {
      input: {
        prompt: project.final_prompt,
        duration: '8s' as const, // VEO3 aceita 4s, 6s, 8s
        aspect_ratio: '16:9' as const,
        resolution: '720p' as const,
        enhance_prompt: true,
        generate_audio: false // SEM SOM - economiza 33% créditos
      },
      webhookUrl: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://aimarketing-grafmovimento.vercel.app'}/api/grafmovimento/templates/veo3-webhook`
    })
    
    console.log(`✅ VEO3 task criada: ${request_id}`)
    
    // Salvar request_id
    const { data: updatedProject, error: updateError } = await supabase
      .from('template_projects')
      .update({
        status: 'generating_video_waiting',
        veo3_request_id: request_id,
        error_message: null
      })
      .eq('id', projectId)
      .select('*')
      .single()
    
    if (updateError) {
      throw new Error(`Erro ao salvar request_id: ${updateError.message}`)
    }
    
    console.log('⏳ Vídeo sendo gerado... Aguardando webhook VEO3')
    return updatedProject as TemplateProject
    
  } catch (error) {
    console.error('❌ Erro ao gerar vídeo:', error)
    
    // Salvar erro na database
    const supabase = await createClient()
    await supabase
      .from('template_projects')
      .update({
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Erro na geração do vídeo'
      })
      .eq('id', projectId)
    
    throw error
  }
}

// Buscar status do projeto
export async function getTemplateProjectStatus(projectId: string) {
  try {
    const supabase = await createClient()
    
    const { data: project, error } = await supabase
      .from('template_projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (error) {
      throw new Error(`Erro ao buscar projeto: ${error.message}`)
    }
    
    return project as TemplateProject
    
  } catch (error) {
    console.error('❌ Erro ao buscar status:', error)
    throw error
  }
}

// Criar projeto completo (upload + geração)
export async function createAndGenerateTemplateVideo(
  templateId: string,
  productName: string,
  productImageFile: File
) {
  try {
    console.log(`🚀 Processo completo: ${templateId} - ${productName}`)
    
    // 1. Criar projeto e fazer upload
    const project = await createTemplateProject(templateId, productName, productImageFile)
    
    // 2. Gerar vídeo
    const updatedProject = await generateTemplateVideo(project.id)
    
    return updatedProject
    
  } catch (error) {
    console.error('❌ Erro no processo completo:', error)
    throw error
  }
}
