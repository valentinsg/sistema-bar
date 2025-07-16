import { NextResponse } from 'next/server'

// OPTIMIZACIÓN: Usar edge runtime para mejor performance
export const runtime = 'edge'
export const maxDuration = 5

export async function GET() {
  try {
    // CRÍTICO: Respuesta mínima para evitar procesamiento innecesario
    return NextResponse.json({
      status: 'ok',
      timestamp: Date.now(), // Usar timestamp numérico es más eficiente
      env: process.env.VERCEL_ENV || 'development'
    }, {
      headers: {
        'Cache-Control': 'no-cache, max-age=0',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: Date.now()
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, max-age=0'
      }
    })
  }
}

export async function HEAD() {
  // OPTIMIZACIÓN: HEAD request más eficiente para health checks
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, max-age=0',
      'Content-Length': '0'
    }
  })
}
