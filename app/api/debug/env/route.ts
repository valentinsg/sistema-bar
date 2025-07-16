import { NextResponse } from 'next/server'

// OPTIMIZACIÓN: Usar nodejs runtime para respetar vercel.json
export const runtime = 'nodejs'
export const maxDuration = 5

export async function GET() {
  try {
    // CRÍTICO: Solo permitir en desarrollo para evitar ataques
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'production') {
      return NextResponse.json(
        { error: 'Debug endpoint disabled in production' },
        {
          status: 403,
          headers: { 'Connection': 'close' }
        }
      )
    }

    // OPTIMIZACIÓN: Respuesta mínima y eficiente
    const envInfo = {
      NEXT_PUBLIC_LOCAL_ID: process.env.NEXT_PUBLIC_LOCAL_ID ? 'Configurada' : 'No configurada',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'No configurada',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL === '1' ? 'Sí' : 'No',
      VERCEL_ENV: process.env.VERCEL_ENV,
      timestamp: Date.now()
    }

    return NextResponse.json(envInfo, {
      headers: {
        'Cache-Control': 'no-cache, max-age=0',
        'Content-Type': 'application/json',
        'Connection': 'close' // CRÍTICO: Cerrar conexión inmediatamente
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, max-age=0',
          'Connection': 'close'
        }
      }
    )
  }
}
