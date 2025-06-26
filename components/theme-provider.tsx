'use client'

import {
    ThemeProvider as NextThemesProvider,
    type ThemeProviderProps,
} from 'next-themes'
import * as React from 'react'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

// Wrapper para animaciones que evita problemas de hidratación
export function AnimationWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div style={{ opacity: 0 }}>{children}</div>
  }

  return <>{children}</>
}
