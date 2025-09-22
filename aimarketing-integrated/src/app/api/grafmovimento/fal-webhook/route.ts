import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar Service Role Key para bypass de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Webhook fal.ai recebido!')
    const body = await request.json()
    console.log('📦 Webhook body:', JSON.stringify(body, null, 2))

    // Extrair dados do webhook fal.ai
    const requestId = body.request_id
    const status = body.status
    const data = body.data

    console.log('🔍 Parsed webhook:', { requestId, status })

    if (!requestId) {
      console.warn('⚠️ Webhook sem request_id')
      return NextResponse.json({ ok: true, message: 'No request_id provided' })
    }

    // Buscar projeto pelo request_id
    const { data: projects, error: searchError } = await supabase
      .from('grafmovimento_projects')
      .select('*')
      .eq('kie_task_id', requestId)
      .limit(1)
    
    if (searchError) {
      console.error('❌ Erro ao buscar projeto:', searchError)
      return NextResponse.json({ ok: false, error: 'Database search failed' }, { status: 500 })
    }

    const project = projects?.[0]
    if (!project) {
      console.warn('⚠️ Projeto não encontrado para request_id:', requestId)
      return NextResponse.json({ ok: true, message: 'Project not found' })
    }

    console.log('🎯 Projeto encontrado:', project.id)

    if (status === 'COMPLETED' && data?.images?.[0]?.url) {
      const imageUrl = data.images[0].url
      console.log('🎉 Imagem gerada com sucesso:', imageUrl)
      
      // Atualizar projeto com sucesso
      const { error: updateError } = await supabase
        .from('grafmovimento_projects')
        .update({
          image_b_url: imageUrl,
          status: 'image_b_generated',
          error_message: null
        })
        .eq('id', project.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar projeto:', updateError)
        return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 })
      }
      
      console.log('✅ Projeto atualizado com sucesso!')
      
    } else if (status === 'FAILED') {
      console.error('❌ Geração falhou:', body.error)
      
      // Atualizar projeto com erro
      const { error: updateError } = await supabase
        .from('grafmovimento_projects')
        .update({ 
          status: 'error',
          error_message: body.error || 'Geração falhou no fal.ai'
        })
        .eq('id', project.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar erro:', updateError)
      }
      
    } else {
      console.log('⏳ Status intermediário:', status)
    }

    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('❌ Erro no webhook fal.ai:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

// Permitir GET para debug
export async function GET() {
  return NextResponse.json({ 
    message: 'fal.ai Webhook Endpoint', 
    timestamp: new Date().toISOString() 
  })
}
