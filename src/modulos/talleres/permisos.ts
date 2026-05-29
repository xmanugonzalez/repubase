import {
  HiOutlineArchiveBox,
  HiOutlineClipboardDocumentList,
  HiOutlineEye,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2'
import type { IconType } from 'react-icons'
import type { MiembroTaller, RolTaller } from '../../tipos/dominio'

export type PermisoTaller =
  | 'ver_dashboard'
  | 'ver_inventario'
  | 'gestionar_inventario'
  | 'registrar_movimientos'
  | 'ver_usuarios'
  | 'gestionar_miembros'
  | 'gestionar_admins'
  | 'transferir_propiedad'
  | 'gestionar_taller'

export type RolTallerConfig = {
  valor: RolTaller
  etiqueta: string
  descripcion: string
  icono: IconType
}

export const ROLES_TALLER: RolTallerConfig[] = [
  {
    valor: 'propietario',
    etiqueta: 'Propietario',
    descripcion: 'Control total del taller, admins y transferencia de propiedad.',
    icono: HiOutlineShieldCheck,
  },
  {
    valor: 'administrador',
    etiqueta: 'Administrador',
    descripcion: 'Gestiona operacion y equipo, excepto propietario y otros admins.',
    icono: HiOutlineUserGroup,
  },
  {
    valor: 'encargado',
    etiqueta: 'Encargado',
    descripcion: 'Opera inventario, movimientos y alertas sin gestionar usuarios.',
    icono: HiOutlineClipboardDocumentList,
  },
  {
    valor: 'mecanico',
    etiqueta: 'Mecánico',
    descripcion: 'Consulta repuestos y registra movimientos de stock.',
    icono: HiOutlineWrenchScrewdriver,
  },
  {
    valor: 'inventario',
    etiqueta: 'Inventario',
    descripcion: 'Carga y mantiene repuestos, stock y movimientos.',
    icono: HiOutlineArchiveBox,
  },
  {
    valor: 'visualizador',
    etiqueta: 'Visualizador',
    descripcion: 'Solo lectura para consultar datos del taller.',
    icono: HiOutlineEye,
  },
]

export const PERMISOS_POR_ROL: Record<RolTaller, PermisoTaller[]> = {
  propietario: [
    'ver_dashboard',
    'ver_inventario',
    'gestionar_inventario',
    'registrar_movimientos',
    'ver_usuarios',
    'gestionar_miembros',
    'gestionar_admins',
    'transferir_propiedad',
    'gestionar_taller',
  ],
  administrador: [
    'ver_dashboard',
    'ver_inventario',
    'gestionar_inventario',
    'registrar_movimientos',
    'ver_usuarios',
    'gestionar_miembros',
    'gestionar_taller',
  ],
  encargado: ['ver_dashboard', 'ver_inventario', 'gestionar_inventario', 'registrar_movimientos'],
  mecanico: ['ver_dashboard', 'ver_inventario', 'registrar_movimientos'],
  inventario: ['ver_dashboard', 'ver_inventario', 'gestionar_inventario', 'registrar_movimientos'],
  visualizador: ['ver_dashboard', 'ver_inventario'],
}

export const obtenerRolLegible = (rol: RolTaller) =>
  ROLES_TALLER.find((item) => item.valor === rol)?.etiqueta ?? rol

export const obtenerDescripcionRol = (rol: RolTaller) =>
  ROLES_TALLER.find((item) => item.valor === rol)?.descripcion ?? ''

export const tienePermiso = (membresia: Pick<MiembroTaller, 'rol' | 'estado'> | null | undefined, permiso: PermisoTaller) =>
  Boolean(membresia?.estado === 'activo' && PERMISOS_POR_ROL[membresia.rol]?.includes(permiso))

export const puedeAsignarRol = (rolActor: RolTaller | undefined, rolObjetivo: RolTaller) => {
  if (rolActor === 'propietario') return rolObjetivo !== 'propietario'
  if (rolActor === 'administrador') {
    return ['encargado', 'mecanico', 'inventario', 'visualizador'].includes(rolObjetivo)
  }

  return false
}

export const puedeGestionarMiembro = (rolActor: RolTaller | undefined, rolObjetivo: RolTaller) => {
  if (rolActor === 'propietario') return rolObjetivo !== 'propietario'
  if (rolActor === 'administrador') {
    return ['encargado', 'mecanico', 'inventario', 'visualizador'].includes(rolObjetivo)
  }

  return false
}
