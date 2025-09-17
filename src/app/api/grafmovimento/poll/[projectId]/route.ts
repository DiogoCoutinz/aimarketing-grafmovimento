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

    // POLLING MANUAL estilo VEO3 - buscar status na KIE.ai
    if (project.kie_task_id && project.status === 'generating_image_b_waiting') {
      console.log('🔍 Polling manual KIE.ai task:', project.kie_task_id)
      
      try {
        // Endpoint para buscar status da task (baseado na doc oficial)
        // Tentar POST primeiro (como no VEO3)
        let taskInfoResponse = null
        
        try {
          console.log('🔍 Tentando POST queryTaskStatus...')
          taskInfoResponse = await axios.post(
            'https://api.kie.ai/api/v1/jobs/queryTaskStatus',
            { taskId: project.kie_task_id },
            {
              headers: {
                'Authorization': `Bearer ${process.env.KIE_AI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          )
        } catch (postError) {
          console.log('❌ POST falhou, tentando GET...')
          // Fallback para GET
          taskInfoResponse = await axios.get(
            `https://api.kie.ai/api/v1/jobs/queryTaskStatus?taskId=${project.kie_task_id}`,
            {
              headers: {
                'Authorization': `Bearer ${process.env.KIE_AI_API_KEY}`
              },
              timeout: 10000
            }
          )
        }
        
        console.log('📦 Task info response:', JSON.stringify(taskInfoResponse.data, null, 2))
        
        // KIE.ai pode retornar data diretamente ou dentro de data.data
        const taskData = taskInfoResponse.data.data || taskInfoResponse.data
        
        // Verificar múltiplos formatos de resposta
        const state = taskData?.state || taskData?.status
        console.log('📊 Task state:', state)
        
        if (state === 'success' || state === 'completed') {
          // Parse resultado - múltiplos formatos possíveis
          let imageUrl = null
          
          // Formato 1: resultJson string
          if (taskData.resultJson) {
            try {
              const result = typeof taskData.resultJson === 'string' 
                ? JSON.parse(taskData.resultJson) 
                : taskData.resultJson
              imageUrl = result.resultUrls?.[0]
            } catch (e) {
              console.error('❌ Erro parse resultJson:', e)
            }
          }
          
          // Formato 2: resultUrls direto
          if (!imageUrl && taskData.resultUrls) {
            imageUrl = taskData.resultUrls[0]
          }
          
          // Formato 3: response.resultUrls
          if (!imageUrl && taskData.response?.resultUrls) {
            imageUrl = taskData.response.resultUrls[0]
          }
          
          console.log('🖼️ Image URL encontrada:', imageUrl)
          
          // Fallback: construir URL baseada no padrão conhecido
          if (!imageUrl && project.kie_task_id) {
            // Padrão observado: https://tempfile.aiquickdraw.com/f/{taskId}_timestamp_hash.png
            console.log('🔧 Tentando construir URL baseada no taskId...')
            // Este é um hack temporário - idealmente a API deveria retornar a URL
            imageUrl = `https://tempfile.aiquickdraw.com/f/${project.kie_task_id}_*.png`
            console.log('⚠️ URL construída (pode não funcionar):', imageUrl)
          }
          
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
        } else if (state === 'fail' || state === 'failed') {
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
        const error = pollError as { response?: { status?: number; data?: unknown }; message?: string }
        console.error('❌ Erro no polling:', error.response?.status, error.message)
        console.error('📦 Response data:', error.response?.data)
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
