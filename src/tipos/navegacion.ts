import type { LucideIcon } from 'lucide-react'
import type { Vista } from './dominio'

export type VistaNavegacion = {
  id: Vista
  etiqueta: string
  icono: LucideIcon
  requiereAdmin?: boolean
}
