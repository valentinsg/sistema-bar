import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verificar configuración de Supabase
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables de Supabase no configuradas:")
  console.error("- NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌")
  console.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅" : "❌")
  console.error("📖 Consulta SETUP.md para configurar estas variables")
}

export const supabase = createClient(supabaseUrl, supabaseKey)
