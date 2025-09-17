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

// Endpoint para polling server-side (backup caso callback falhe)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    console.log('🔄 Polling projeto:', projectId)
    console.log('🔑 KIE_AI_API_KEY presente:', !!process.env.KIE_AI_API_KEY)
    
    // Buscar projeto na DB
    const { data: project, error } = await supabase
      .from('grafmovimento_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Se já tem imagem B, retornar
    if (project.status === 'image_b_generated' && project.image_b_url) {
      return NextResponse.json({ 
        status: 'success', 
        image_b_url: project.image_b_url,
        project_status: project.status
      })
    }

    // POLLING FAL.AI - buscar status da request
    if (project.kie_task_id && project.status === 'generating_image_b_waiting') {
      console.log('🔍 Polling fal.ai request:', project.kie_task_id)
      
      try {
        // Buscar status no fal.ai
        const status = await fal.queue.status('fal-ai/bytedance/seedream/v4/edit', {
          requestId: project.kie_task_id,
          logs: true
        })
        
        console.log('📦 fal.ai status:', JSON.stringify(status, null, 2))
        
        const statusValue = status.status as string
        if (statusValue === 'COMPLETED') {
          // Buscar resultado
          const result = await fal.queue.result('fal-ai/bytedance/seedream/v4/edit', {
            requestId: project.kie_task_id
          })
          
          const imageUrl = result.data.images?.[0]?.url
          
          if (imageUrl) {
            console.log('🎉 Imagem encontrada via polling fal.ai!')
            
            // Atualizar DB
            await supabase
              .from('grafmovimento_projects')
              .update({
                image_b_url: imageUrl,
                status: 'image_b_generated',
                error_message: null
              })
              .eq('id', projectId)
            
            return NextResponse.json({ 
              status: 'success', 
              image_b_url: imageUrl,
              project_status: 'image_b_generated'
            })
          }
        } else if (statusValue === 'FAILED') {
          console.error('❌ Task falhou no fal.ai')
          
          await supabase
            .from('grafmovimento_projects')
            .update({
              status: 'error',
              error_message: 'Geração falhou no fal.ai'
            })
            .eq('id', projectId)
          
          return NextResponse.json({ 
            status: 'error', 
            error: 'Geração falhou no fal.ai'
          })
        } else {
          console.log('⏳ Task ainda processando no fal.ai:', statusValue)
        }
        
      } catch (pollError) {
        const error = pollError as { response?: { status?: number; data?: unknown }; message?: string }
        console.error('❌ Erro no polling fal.ai:', error.message)
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
    console.error('❌ Erro no polling:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
