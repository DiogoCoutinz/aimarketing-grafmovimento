import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar Service Role Key para bypass de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Webhook video minimax recebido!')
    const body = await request.json()
    console.log('📦 Video webhook body:', JSON.stringify(body, null, 2))

    // Extrair dados do webhook fal.ai minimax
    const requestId = body.request_id
    const status = body.status
    const data = body.data

    console.log('🔍 Parsed video webhook:', { requestId, status })

    if (!requestId) {
      console.warn('⚠️ Video webhook sem request_id')
      return NextResponse.json({ ok: true, message: 'No request_id provided' })
    }

    // Buscar projeto pelo request_id
    const { data: projects, error: searchError } = await supabase
      .from('grafmovimento_projects')
      .select('*')
      .eq('kie_task_id', requestId)
      .limit(1)
    
    if (searchError) {
      console.error('❌ Erro ao buscar projeto video:', searchError)
      return NextResponse.json({ ok: false, error: 'Database search failed' }, { status: 500 })
    }

    const project = projects?.[0]
    if (!project) {
      console.warn('⚠️ Projeto não encontrado para video request_id:', requestId)
      return NextResponse.json({ ok: true, message: 'Project not found' })
    }

    console.log('🎯 Projeto encontrado para vídeo:', project.id)

    if (status === 'COMPLETED' && data?.video?.url) {
      const videoUrl = data.video.url
      console.log('🎉 Vídeo gerado com sucesso:', videoUrl)
      
      // Atualizar projeto com vídeo
      const { error: updateError } = await supabase
        .from('grafmovimento_projects')
        .update({
          video_url: videoUrl,
          status: 'video_generated',
          error_message: null
        })
        .eq('id', project.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar projeto com vídeo:', updateError)
        return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 })
      }
      
      console.log('✅ Projeto atualizado com vídeo!')
      
    } else if (status === 'FAILED') {
      console.error('❌ Geração de vídeo falhou:', body.error)
      
      // Atualizar projeto com erro
      const { error: updateError } = await supabase
        .from('grafmovimento_projects')
        .update({ 
          status: 'error',
          error_message: body.error || 'Geração de vídeo falhou no minimax'
        })
        .eq('id', project.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar erro de vídeo:', updateError)
      }
      
    } else {
      console.log('⏳ Status intermediário de vídeo:', status)
    }

    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('❌ Erro no webhook video minimax:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

// Permitir GET para debug
export async function GET() {
  return NextResponse.json({ 
    message: 'fal.ai Minimax Video Webhook Endpoint', 
    timestamp: new Date().toISOString() 
  })
}
