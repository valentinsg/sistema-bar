import { NextResponse } from 'next/server'

export async function GET() {
  const envInfo = {
    NEXT_PUBLIC_LOCAL_ID: process.env.NEXT_PUBLIC_LOCAL_ID ? 'Configurada' : 'No configurada',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'No configurada',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL: process.env.VERCEL === '1' ? 'Sí' : 'No',
    VERCEL_ENV: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(envInfo)
}
