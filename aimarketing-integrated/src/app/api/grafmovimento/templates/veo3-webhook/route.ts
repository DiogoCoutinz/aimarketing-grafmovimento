import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar Service Role Key para bypass de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Webhook VEO3 templates recebido!')
    const body = await request.json()
    console.log('📦 VEO3 webhook body:', JSON.stringify(body, null, 2))

    // Extrair dados do webhook VEO3
    const requestId = body.request_id
    const status = body.status
    const data = body.data

    console.log('🔍 Parsed VEO3 webhook:', { requestId, status })

    if (!requestId) {
      console.warn('⚠️ VEO3 webhook sem request_id')
      return NextResponse.json({ ok: true, message: 'No request_id provided' })
    }

    // Buscar projeto pelo VEO3 request_id
    const { data: projects, error: searchError } = await supabase
      .from('template_projects')
      .select('*')
      .eq('veo3_request_id', requestId)
      .limit(1)
    
    if (searchError) {
      console.error('❌ Erro ao buscar projeto template:', searchError)
      return NextResponse.json({ ok: false, error: 'Database search failed' }, { status: 500 })
    }

    const project = projects?.[0]
    if (!project) {
      console.warn('⚠️ Projeto template não encontrado para VEO3 request_id:', requestId)
      return NextResponse.json({ ok: true, message: 'Project not found' })
    }

    console.log('🎯 Projeto template encontrado:', project.id)

    if (status === 'COMPLETED' && data?.video?.url) {
      const videoUrl = data.video.url
      console.log('🎉 Vídeo VEO3 gerado com sucesso:', videoUrl)
      
      // Atualizar projeto com vídeo
      const { error: updateError } = await supabase
        .from('template_projects')
        .update({
          video_url: videoUrl,
          status: 'video_generated',
          error_message: null
        })
        .eq('id', project.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar projeto template:', updateError)
        return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 })
      }
      
      console.log('✅ Projeto template atualizado com vídeo VEO3!')
      
    } else if (status === 'FAILED') {
      console.error('❌ Geração VEO3 falhou:', body.error)
      
      // Atualizar projeto com erro
      const { error: updateError } = await supabase
        .from('template_projects')
        .update({ 
          status: 'error',
          error_message: body.error || 'Geração de vídeo falhou no VEO3'
        })
        .eq('id', project.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar erro VEO3:', updateError)
      }
      
    } else {
      console.log('⏳ Status intermediário VEO3:', status)
    }

    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('❌ Erro no webhook VEO3 templates:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

// Permitir GET para debug
export async function GET() {
  return NextResponse.json({ 
    message: 'VEO3 Templates Webhook Endpoint', 
    timestamp: new Date().toISOString() 
  })
}
