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

const prefijosInvitacion = ['/invite/', '/invitacion/']

function leerRutaActual() {
  const hash = window.location.hash.replace(/^#/, '')

  return hash.startsWith('/') ? hash : '/'
}

function obtenerTokenInvitacion(ruta: string) {
  const prefijo = prefijosInvitacion.find((item) => ruta.startsWith(item))

  if (!prefijo) return null

  const token = ruta.slice(prefijo.length).trim()

  if (!token) return null

  try {
    return decodeURIComponent(token)
  } catch {
    return token
  }
}

export function useRutaHash() {
  const [ruta, setRuta] = useState(() => leerRutaActual())

  useEffect(() => {
    const manejarCambio = () => setRuta(leerRutaActual())

    window.addEventListener('hashchange', manejarCambio)

    return () => window.removeEventListener('hashchange', manejarCambio)
  }, [])

  const invitacionToken = obtenerTokenInvitacion(ruta)
  const rutaEncontrada = Boolean(invitacionToken) || Boolean(rutas[ruta])
  const vistaDesdeRuta = invitacionToken ? 'talleres' : rutas[ruta] ?? 'dashboard'
  const navegar = (vista: Vista) => {
    const proximaRuta = rutasPorVista[vista]

    if (leerRutaActual() === proximaRuta) {
      setRuta(proximaRuta)
      return
    }

    window.location.hash = proximaRuta
  }

  return {
    invitacionToken,
    rutaEncontrada,
    ruta,
    vistaDesdeRuta,
    navegar,
  }
}
