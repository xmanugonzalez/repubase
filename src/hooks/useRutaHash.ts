import { useEffect, useState } from 'react'
import type { Vista } from '../tipos/dominio'

const rutas: Record<string, Vista> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/inventario': 'inventario',
  '/movimientos': 'movimientos',
  '/alertas': 'alertas',
  '/usuarios': 'usuarios',
  '/talleres': 'talleres',
  '/perfil': 'perfil',
}

const rutasPorVista: Record<Vista, string> = {
  dashboard: '/dashboard',
  inventario: '/inventario',
  movimientos: '/movimientos',
  alertas: '/alertas',
  usuarios: '/usuarios',
  talleres: '/talleres',
  perfil: '/perfil',
}

function leerRutaActual() {
  const hash = window.location.hash.replace(/^#/, '')

  return hash.startsWith('/') ? hash : '/'
}

export function useRutaHash() {
  const [ruta, setRuta] = useState(() => leerRutaActual())

  useEffect(() => {
    const manejarCambio = () => setRuta(leerRutaActual())

    window.addEventListener('hashchange', manejarCambio)

    return () => window.removeEventListener('hashchange', manejarCambio)
  }, [])

  const vistaDesdeRuta = rutas[ruta] ?? 'dashboard'
  const navegar = (vista: Vista) => {
    const proximaRuta = rutasPorVista[vista]

    if (leerRutaActual() === proximaRuta) {
      setRuta(proximaRuta)
      return
    }

    window.location.hash = proximaRuta
  }

  return {
    ruta,
    vistaDesdeRuta,
    navegar,
  }
}
