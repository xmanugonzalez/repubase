import type { AlertaStockParado, Repuesto } from '../../tipos/dominio'
import { calcularDias } from '../../lib/fechas'

export const obtenerAlertasStockParado = (repuestos: Repuesto[]): AlertaStockParado[] =>
  repuestos
    .map((repuesto) => ({
      ...repuesto,
      dias_sin_movimiento: calcularDias(repuesto.ultimo_movimiento),
    }))
    .filter((repuesto) => repuesto.stock > 0 && repuesto.dias_sin_movimiento > 90)
    .sort((a, b) => b.dias_sin_movimiento - a.dias_sin_movimiento)
