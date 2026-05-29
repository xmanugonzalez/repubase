import type { LucideIcon } from 'lucide-react'
import type { Vista } from './dominio'
import type { PermisoTaller } from '../modulos/talleres/permisos'

export type VistaNavegacion = {
  id: Vista
  etiqueta: string
  icono: LucideIcon
  permiso?: PermisoTaller
}
