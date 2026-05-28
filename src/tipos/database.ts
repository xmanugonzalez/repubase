import type {
  EstadoMiembro,
  EstadoRepuesto,
  RolTaller,
  TipoMovimiento,
} from './dominio'

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

type Tabla<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export type Database = {
  public: {
    Tables: {
      perfiles: Tabla<
        {
          id: string
          nombre: string | null
          email: string
          avatar_url: string | null
          creado_en: string
        },
        {
          id: string
          nombre?: string | null
          email: string
          avatar_url?: string | null
          creado_en?: string
        },
        {
          nombre?: string | null
          email?: string
          avatar_url?: string | null
        }
      >
      talleres: Tabla<
        {
          id: string
          nombre: string
          direccion: string | null
          telefono: string | null
          creado_por: string | null
          creado_en: string
        },
        {
          id?: string
          nombre: string
          direccion?: string | null
          telefono?: string | null
          creado_por?: string
          creado_en?: string
        },
        {
          nombre?: string
          direccion?: string | null
          telefono?: string | null
        }
      >
      miembros_taller: Tabla<
        {
          id: string
          taller_id: string
          usuario_id: string | null
          email: string
          rol: RolTaller
          estado: EstadoMiembro
          creado_en: string
        },
        {
          id?: string
          taller_id: string
          usuario_id?: string | null
          email: string
          rol: RolTaller
          estado?: EstadoMiembro
          creado_en?: string
        },
        {
          usuario_id?: string | null
          email?: string
          rol?: RolTaller
          estado?: EstadoMiembro
        }
      >
      repuestos: Tabla<
        {
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
        },
        {
          id?: string
          taller_id: string
          codigo: string
          nombre: string
          marca: string
          modelo: string
          anio: number
          categoria: string
          estado?: EstadoRepuesto
          precio?: number
          stock?: number
          ubicacion?: string | null
          descripcion?: string | null
          ultimo_movimiento?: string | null
          creado_por?: string
          actualizado_por?: string | null
          creado_en?: string
          actualizado_en?: string
        },
        {
          codigo?: string
          nombre?: string
          marca?: string
          modelo?: string
          anio?: number
          categoria?: string
          estado?: EstadoRepuesto
          precio?: number
          ubicacion?: string | null
          descripcion?: string | null
          actualizado_por?: string | null
        }
      >
      movimientos_stock: Tabla<
        {
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
        },
        {
          id?: string
          taller_id: string
          repuesto_id: string
          usuario_id?: string
          tipo: TipoMovimiento
          cantidad: number
          stock_anterior?: number
          stock_nuevo?: number
          motivo: string
          creado_en?: string
        },
        never
      >
      auditoria: Tabla<
        {
          id: string
          taller_id: string | null
          usuario_id: string | null
          tabla: string
          accion: string
          registro_id: string | null
          descripcion: string
          datos: Json | null
          creado_en: string
        },
        {
          id?: string
          taller_id?: string | null
          usuario_id?: string | null
          tabla: string
          accion: string
          registro_id?: string | null
          descripcion: string
          datos?: Json | null
          creado_en?: string
        },
        never
      >
    }
    Views: Record<string, never>
    Functions: {
      eliminar_taller: {
        Args: { p_taller_id: string }
        Returns: boolean
      }
      eliminar_cuenta_propia: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
