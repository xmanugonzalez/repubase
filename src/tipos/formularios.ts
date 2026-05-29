import type { EstadoRepuesto, RolTaller, TipoMovimiento } from './dominio'

export type RepuestoFormulario = {
  codigo: string
  nombre: string
  marca: string
  modelo: string
  anio: string
  categoria: string
  estado: EstadoRepuesto
  precio: string
  stockInicial: string
  ubicacion: string
  descripcion: string
  fotoUrl: string
  fotoArchivo: File | null
  atributos: Record<string, string>
}

export type MovimientoFormulario = {
  repuestoId: string
  tipo: TipoMovimiento
  cantidad: string
  motivo: string
}

export type TallerFormulario = {
  nombre: string
  direccion: string
  telefono: string
  whatsapp: string
  email: string
  ciudad: string
  horario: string
  servicios: string
  notas: string
  logoUrl: string
  logoArchivo: File | null
}

export type MiembroFormulario = {
  email: string
  rol: RolTaller
}

export const repuestoInicial: RepuestoFormulario = {
  codigo: '',
  nombre: '',
  marca: '',
  modelo: '',
  anio: String(new Date().getFullYear()),
  categoria: '',
  estado: 'disponible',
  precio: '0',
  stockInicial: '0',
  ubicacion: '',
  descripcion: '',
  fotoUrl: '',
  fotoArchivo: null,
  atributos: {},
}

export const movimientoInicial: MovimientoFormulario = {
  repuestoId: '',
  tipo: 'entrada',
  cantidad: '1',
  motivo: '',
}

export const tallerInicial: TallerFormulario = {
  nombre: '',
  direccion: '',
  telefono: '',
  whatsapp: '',
  email: '',
  ciudad: '',
  horario: '',
  servicios: '',
  notas: '',
  logoUrl: '',
  logoArchivo: null,
}
