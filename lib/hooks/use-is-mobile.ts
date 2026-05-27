"use client"

import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 640 // Tailwind 'sm' breakpoint

/**
 * Hook que retorna true quando a viewport é menor que o breakpoint mobile.
 * Reativo a resize. Inicializa como false no SSR e atualiza no primeiro render do cliente.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const update = () => setIsMobile(mediaQuery.matches)

    update()
    mediaQuery.addEventListener("change", update)
    return () => mediaQuery.removeEventListener("change", update)
  }, [])

  return isMobile
}
