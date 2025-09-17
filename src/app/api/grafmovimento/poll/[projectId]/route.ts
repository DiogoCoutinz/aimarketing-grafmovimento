import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'

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

    // POLLING MANUAL estilo VEO3 - buscar status na KIE.ai
    if (project.kie_task_id && project.status === 'generating_image_b_waiting') {
      console.log('🔍 Polling manual KIE.ai task:', project.kie_task_id)
      
      try {
        // Endpoint para buscar info da task (similar ao veo/record-info)
        const taskInfoResponse = await axios.post(
          'https://api.kie.ai/api/v1/jobs/queryTaskStatus',
          {
            taskId: project.kie_task_id
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.KIE_AI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        )
        
        console.log('📦 Task info response:', JSON.stringify(taskInfoResponse.data, null, 2))
        
        const taskData = taskInfoResponse.data.data
        
        if (taskData?.state === 'success' && taskData?.resultJson) {
          // Parse resultado
          const result = JSON.parse(taskData.resultJson)
          const imageUrl = result.resultUrls?.[0]
          
          if (imageUrl) {
            console.log('🎉 Imagem encontrada via polling manual!')
            
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
        } else if (taskData?.state === 'fail') {
          console.error('❌ Task falhou:', taskData.failMsg)
          
          await supabase
            .from('grafmovimento_projects')
            .update({
              status: 'error',
              error_message: taskData.failMsg || 'Geração falhou'
            })
            .eq('id', projectId)
          
          return NextResponse.json({ 
            status: 'error', 
            error: taskData.failMsg || 'Geração falhou'
          })
        } else {
          console.log('⏳ Task ainda processando:', taskData?.state)
        }
        
      } catch (pollError) {
        console.error('❌ Erro no polling:', pollError)
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
