import { HiOutlineClipboardDocumentList } from 'react-icons/hi2'
import { formatearFecha } from '../../lib/fechas'
import type { MovimientoStock } from '../../tipos/dominio'

export function TablaMovimientos({ movimientos }: { movimientos: MovimientoStock[] }) {
  if (movimientos.length === 0) {
    return (
      <div className="empty-state module-empty-state grid min-h-[14rem] place-items-center p-10 text-center">
        <span className="module-empty-icon" aria-hidden="true">
          <HiOutlineClipboardDocumentList size={24} />
        </span>
        <p className="section-copy">Sin movimientos registrados.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr>
            <th className="py-3">Fecha</th>
            <th>Repuesto</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Stock</th>
            <th>Motivo</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((movimiento) => (
            <tr key={movimiento.id}>
              <td>{formatearFecha(movimiento.creado_en)}</td>
              <td>
                {movimiento.repuesto?.codigo ? `${movimiento.repuesto.codigo} - ` : ''}
                {movimiento.repuesto?.nombre ?? movimiento.repuesto_id}
              </td>
              <td>{movimiento.tipo}</td>
              <td>{movimiento.cantidad}</td>
              <td>
                {movimiento.stock_anterior} - {movimiento.stock_nuevo}
              </td>
              <td>{movimiento.motivo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
