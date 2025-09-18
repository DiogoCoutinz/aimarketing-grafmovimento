import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { fal } from '@fal-ai/client'

// Configurar fal.ai
fal.config({
  credentials: process.env.FAL_KEY || ''
})

// Usar Service Role Key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Endpoint para polling server-side dos templates
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    console.log('🔄 Polling projeto template:', projectId)
    
    // Buscar projeto na DB
    const { data: project, error } = await supabase
      .from('template_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Se já tem vídeo, retornar
    if (project.status === 'video_generated' && project.video_url) {
      return NextResponse.json({ 
        status: 'success', 
        video_url: project.video_url,
        project_status: project.status
      })
    }

    // POLLING VEO3 - buscar status da request
    if (project.veo3_request_id && project.status === 'generating_video_waiting') {
      console.log('🔍 Polling VEO3 request:', project.veo3_request_id)
      
      try {
        // Buscar status no VEO3
        const status = await fal.queue.status('fal-ai/veo3/fast', {
          requestId: project.veo3_request_id,
          logs: true
        })
        
        console.log('📦 VEO3 status:', JSON.stringify(status, null, 2))
        
        const statusValue = status.status as string
        if (statusValue === 'COMPLETED') {
          // Buscar resultado
          const result = await fal.queue.result('fal-ai/veo3/fast', {
            requestId: project.veo3_request_id
          })
          
          const videoUrl = result.data.video?.url
          
          if (videoUrl) {
            console.log('🎉 Vídeo VEO3 encontrado via polling!')
            
            // Atualizar DB
            await supabase
              .from('template_projects')
              .update({
                video_url: videoUrl,
                status: 'video_generated',
                error_message: null
              })
              .eq('id', projectId)
            
            return NextResponse.json({ 
              status: 'success', 
              video_url: videoUrl,
              project_status: 'video_generated'
            })
          }
        } else if (statusValue === 'FAILED') {
          console.error('❌ Task VEO3 falhou')
          
          await supabase
            .from('template_projects')
            .update({
              status: 'error',
              error_message: 'Geração falhou no VEO3'
            })
            .eq('id', projectId)
          
          return NextResponse.json({ 
            status: 'error', 
            error: 'Geração falhou no VEO3'
          })
        } else {
          console.log('⏳ Task VEO3 ainda processando:', statusValue)
        }
        
      } catch (pollError) {
        const error = pollError as { response?: { status?: number; data?: unknown }; message?: string }
        console.error('❌ Erro no polling VEO3:', error.message)
        // Não falha - continua tentando
      }
    }

    // Retornar status atual
    return NextResponse.json({ 
      status: 'processing', 
      project_status: project.status,
      message: 'Still generating...'
    })

  } catch (error) {
    console.error('❌ Erro no polling template:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
