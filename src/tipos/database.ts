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
          whatsapp: string | null
          email: string | null
          ciudad: string | null
          horario: string | null
          servicios: string | null
          notas: string | null
          logo_url: string | null
          creado_por: string | null
          creado_en: string
        },
        {
          id?: string
          nombre: string
          direccion?: string | null
          telefono?: string | null
          whatsapp?: string | null
          email?: string | null
          ciudad?: string | null
          horario?: string | null
          servicios?: string | null
          notas?: string | null
          logo_url?: string | null
          creado_por?: string
          creado_en?: string
        },
        {
          nombre?: string
          direccion?: string | null
          telefono?: string | null
          whatsapp?: string | null
          email?: string | null
          ciudad?: string | null
          horario?: string | null
          servicios?: string | null
          notas?: string | null
          logo_url?: string | null
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
      invitaciones_taller: Tabla<
        {
          id: string
          taller_id: string
          token_hash: string
          rol: RolTaller
          creado_por: string
          creado_en: string
          regenerado_en: string
          revocado_en: string | null
        },
        {
          id?: string
          taller_id: string
          token_hash: string
          rol?: RolTaller
          creado_por: string
          creado_en?: string
          regenerado_en?: string
          revocado_en?: string | null
        },
        {
          token_hash?: string
          rol?: RolTaller
          regenerado_en?: string
          revocado_en?: string | null
        }
      >
      repuestos: Tabla<
        {
          id: string
          taller_id: string
          codigo: string | null
          nombre: string
          marca: string | null
          modelo: string | null
          anio: number | null
          categoria: string
          estado: EstadoRepuesto
          precio: number
          stock: number
          ubicacion: string | null
          descripcion: string | null
          foto_url: string | null
          atributos: Record<string, string>
          ultimo_movimiento: string | null
          creado_por: string | null
          actualizado_por: string | null
          creado_en: string
          actualizado_en: string
        },
        {
          id?: string
          taller_id: string
          codigo?: string | null
          nombre: string
          marca?: string | null
          modelo?: string | null
          anio?: number | null
          categoria: string
          estado?: EstadoRepuesto
          precio?: number
          stock?: number
          ubicacion?: string | null
          descripcion?: string | null
          foto_url?: string | null
          atributos?: Record<string, string>
          ultimo_movimiento?: string | null
          creado_por?: string
          actualizado_por?: string | null
          creado_en?: string
          actualizado_en?: string
        },
        {
          codigo?: string | null
          nombre?: string
          marca?: string | null
          modelo?: string | null
          anio?: number | null
          categoria?: string
          estado?: EstadoRepuesto
          precio?: number
          ubicacion?: string | null
          descripcion?: string | null
          foto_url?: string | null
          atributos?: Record<string, string>
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
      cambiar_rol_miembro_taller: {
        Args: { p_miembro_id: string; p_rol: RolTaller }
        Returns: boolean
      }
      eliminar_miembro_taller: {
        Args: { p_miembro_id: string }
        Returns: boolean
      }
      transferir_propiedad_taller: {
        Args: { p_taller_id: string; p_nuevo_propietario_miembro_id: string }
        Returns: boolean
      }
      reclamar_invitaciones_pendientes: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      agregar_miembro_taller_por_email: {
        Args: { p_taller_id: string; p_email: string; p_rol: RolTaller }
        Returns: {
          resultado: 'miembro_activado' | 'invitacion_pendiente' | 'invitacion_pendiente_actualizada' | 'ya_miembro'
          miembro_id: string
          email: string
          usuario_id: string | null
          rol: RolTaller
          estado: EstadoMiembro
        }[]
      }
      generar_invitacion_taller: {
        Args: { p_taller_id: string; p_rol: RolTaller }
        Returns: string
      }
      validar_invitacion_taller: {
        Args: { p_token: string }
        Returns: {
          valida: boolean
          taller_id: string | null
          taller_nombre: string | null
          rol: RolTaller | null
        }[]
      }
      aceptar_invitacion_taller: {
        Args: { p_token: string }
        Returns: {
          taller_id: string
          taller_nombre: string
          rol: RolTaller
        }[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
