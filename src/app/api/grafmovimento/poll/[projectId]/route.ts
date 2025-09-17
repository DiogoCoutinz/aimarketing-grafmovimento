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

    // Se tem taskId e está waiting, tentar buscar na KIE.ai
    if (project.kie_task_id && project.status === 'generating_image_b_waiting') {
      console.log('🔍 Verificando status na KIE.ai para task:', project.kie_task_id)
      
      try {
        // Tentar diferentes endpoints para verificar status
        const possibleEndpoints = [
          `https://api.kie.ai/api/v1/jobs/queryTaskStatus?taskId=${project.kie_task_id}`,
          `https://api.kie.ai/api/v1/tasks/${project.kie_task_id}`,
          `https://api.kie.ai/api/v1/jobs/${project.kie_task_id}`
        ]
        
        for (const endpoint of possibleEndpoints) {
          try {
            console.log(`🔍 Tentando endpoint: ${endpoint}`)
            
            const statusResponse = await axios.get(endpoint, {
              headers: {
                'Authorization': `Bearer ${process.env.KIE_AI_API_KEY}`
              },
              timeout: 10000
            })
            
            console.log('📦 Resposta KIE.ai:', JSON.stringify(statusResponse.data, null, 2))
            
            const taskData = statusResponse.data.data
            
            if (taskData?.state === 'success') {
              // Parse do resultado
              let imageUrl: string | null = null
              
              if (taskData.resultJson) {
                try {
                  const result = JSON.parse(taskData.resultJson)
                  imageUrl = result.resultUrls?.[0]
                } catch (parseError) {
                  console.error('❌ Erro ao parse resultJson:', parseError)
                }
              }
              
              if (imageUrl) {
                console.log('🎉 Imagem encontrada via polling!')
                
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
                  project_status: 'image_b_generated',
                  source: 'polling'
                })
              }
            } else if (taskData?.state === 'fail') {
              // Atualizar com erro
              await supabase
                .from('grafmovimento_projects')
                .update({
                  status: 'error',
                  error_message: `KIE.ai falhou: ${taskData.failMsg || 'Erro desconhecido'}`
                })
                .eq('id', projectId)
              
              return NextResponse.json({ 
                status: 'error', 
                error: taskData.failMsg || 'Erro desconhecido',
                project_status: 'error'
              })
            }
            
            // Se chegou aqui, endpoint funcionou mas ainda está processando
            console.log(`⏳ Task ainda processando: ${taskData?.state}`)
            break
            
          } catch (endpointError: unknown) {
            const error = endpointError as { response?: { status?: number } }
            console.log(`❌ Endpoint falhou (${error.response?.status}): ${endpoint}`)
            continue
          }
        }
        
      } catch (kieError) {
        console.error('❌ Erro ao verificar KIE.ai:', kieError)
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
