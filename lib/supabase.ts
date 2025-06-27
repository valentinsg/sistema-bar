import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Verificar configuración de Supabase
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variables de Supabase no configuradas:")
  console.error("- NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅" : "❌")
  console.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseKey ? "✅" : "❌")
  console.error("📖 Consulta SETUP.md para configurar estas variables")
  console.error("📁 Crea un archivo .env.local en la raíz del proyecto")
}

// Crear cliente con configuración por defecto si no hay variables
const defaultUrl = supabaseUrl || 'https://ejemplo.supabase.co'
const defaultKey = supabaseKey || 'ejemplo-clave-anonima'

export const supabase = createClient(defaultUrl, defaultKey, {
  // Deshabilitar realtime si no hay configuración válida
  realtime: {
    params: {
      eventsPerSecond: supabaseUrl && supabaseKey ? 10 : 0
    }
  },
  // Configuración para desarrollo
  auth: {
    persistSession: false
  }
})
