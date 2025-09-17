import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Usar Service Role Key para bypass de RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('📞 Callback recebido do KIE.ai')
    const rawBody = await request.text()
    console.log('📦 Raw body:', rawBody)

    let body: unknown = null
    try { 
      body = JSON.parse(rawBody) 
    } catch (e) { 
      console.error('❌ Erro ao parse JSON:', e)
      body = rawBody 
    }

    // Estrutura defensiva: KIE.ai costuma enviar { code:200, data: {...} } mas há variações
    const bodyObj = body as Record<string, unknown>
    const code = bodyObj?.code ?? bodyObj?.statusCode
    const data = bodyObj?.data ?? bodyObj?.response ?? bodyObj

    // Possíveis lugares para taskId / urls
    const dataObj = data as Record<string, unknown>
    const taskId = dataObj?.taskId ?? dataObj?.task_id ?? dataObj?.taskIdStr ?? bodyObj?.taskId
    const responseObj = dataObj?.response as Record<string, unknown> | undefined
    const infoObj = dataObj?.info as Record<string, unknown> | undefined
    const imageUrl =
      (responseObj?.resultUrls as string[])?.[0] ??
      (infoObj?.result_urls as string[])?.[0] ??
      (dataObj?.resultJson ? (() => { 
        try { 
          return JSON.parse(dataObj.resultJson as string).resultUrls?.[0] 
        } catch{ 
          return null 
        } 
      })() : null)

    console.log('🔍 Parsed data:', { code, taskId, imageUrl })

    // 1) Tenta encontrar projeto por taskId (recomendado)
    let project = null
    if (taskId) {
      const { data: projects, error } = await supabase
        .from('grafmovimento_projects')
        .select('*')
        .eq('kie_task_id', taskId)
        .limit(1)
      
      if (error) {
        console.error('❌ Erro ao buscar por taskId:', error)
      } else {
        project = projects?.[0]
        console.log('🎯 Projeto encontrado por taskId:', project?.id)
      }
    }

    // 2) Fallback: procura por status (hack original)
    if (!project) {
      console.log('⚠️ Fallback: buscando por status...')
      const { data: projects, error } = await supabase
        .from('grafmovimento_projects')
        .select('*')
        .eq('status', 'generating_image_b_waiting')
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (error) {
        console.error('❌ Erro ao buscar por status:', error)
      } else {
        project = projects?.[0]
        console.log('🎯 Projeto encontrado por status:', project?.id)
      }
    }

    if (!project) {
      console.warn('⚠️ Projeto não encontrado - guardando payload para análise')
      // Guardar callback para debug (opcional - criar tabela webhook_events se quiseres)
      console.log('🔍 Debug info:', { taskId, code, rawBody: rawBody.substring(0, 500) })
      return NextResponse.json({ ok: true, message: 'Project not found but callback logged' })
    }

    if (code === 200 && imageUrl) {
      console.log('🎉 Sucesso! Atualizando projeto com imageUrl:', imageUrl)
      
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
      
    } else {
      console.warn('⚠️ Callback não contém imageUrl - guardando raw callback')
      
      const { error: updateError } = await supabase
        .from('grafmovimento_projects')
        .update({ 
          status: 'error',
          error_message: `Callback sem imageUrl - code: ${code}, data: ${JSON.stringify(data).substring(0, 200)}`
        })
        .eq('id', project.id)
      
      if (updateError) {
        console.error('❌ Erro ao atualizar erro:', updateError)
      }
    }

    return NextResponse.json({ ok: true })
    
  } catch (error) {
    console.error('❌ Erro no callback:', error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

// Permitir GET para debug
export async function GET() {
  return NextResponse.json({ 
    message: 'KIE.ai Callback Endpoint', 
    timestamp: new Date().toISOString() 
  })
}
