export type RolTaller = 'administrador' | 'mecanico'

export type EstadoMiembro = 'activo' | 'inactivo' | 'invitado'

export type EstadoRepuesto = 'disponible' | 'reservado' | 'usado' | 'descartado'

export type TipoMovimiento = 'entrada' | 'salida' | 'ajuste'

export type Vista = 'dashboard' | 'inventario' | 'movimientos' | 'alertas' | 'usuarios' | 'talleres' | 'perfil'

export type Perfil = {
  id: string
  nombre: string | null
  email: string
  avatar_url: string | null
  creado_en: string
}

export type Taller = {
  id: string
  nombre: string
  direccion: string | null
  telefono: string | null
  creado_por: string | null
  creado_en: string
}

export type MiembroTaller = {
  id: string
  taller_id: string
  usuario_id: string | null
  email: string
  rol: RolTaller
  estado: EstadoMiembro
  creado_en: string
}

export type Repuesto = {
  id: string
  taller_id: string
  codigo: string
  nombre: string
  marca: string
  modelo: string
  anio: number
  categoria: string
  estado: EstadoRepuesto
  precio: number
  stock: number
  ubicacion: string | null
  descripcion: string | null
  ultimo_movimiento: string | null
  creado_por: string | null
  actualizado_por: string | null
  creado_en: string
  actualizado_en: string
}

export type MovimientoStock = {
  id: string
  taller_id: string
  repuesto_id: string
  usuario_id: string | null
  tipo: TipoMovimiento
  cantidad: number
  stock_anterior: number
  stock_nuevo: number
  motivo: string
  creado_en: string
  repuesto?: Pick<Repuesto, 'codigo' | 'nombre' | 'marca' | 'modelo'>
}

export type AlertaStockParado = Repuesto & {
  dias_sin_movimiento: number
}
