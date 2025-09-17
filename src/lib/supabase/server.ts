import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function createClient() {
  // Usar cliente simples com service role key para operações de servidor
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
  
  return supabase
}
