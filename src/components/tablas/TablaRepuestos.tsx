import { calcularDias, formatearGs } from '../../lib/fechas'
import type { Repuesto } from '../../tipos/dominio'

export function TablaRepuestos({
  repuestos,
  esAdministrador,
  editarRepuesto,
  eliminarRepuesto,
}: {
  repuestos: Repuesto[]
  esAdministrador: boolean
  editarRepuesto: (repuesto: Repuesto) => void
  eliminarRepuesto: (repuesto: Repuesto) => Promise<void>
}) {
  if (repuestos.length === 0) {
    return (
      <div className="empty-state grid min-h-[18rem] place-items-center p-10 text-center">
        <p className="section-copy">Todavia no hay repuestos cargados para este taller.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full min-w-[760px] text-left text-sm">
        <thead>
          <tr>
            <th className="py-3">Codigo</th>
            <th>Repuesto</th>
            <th>Vehiculo</th>
            <th>Categoria</th>
            <th>Stock</th>
            <th>Valor</th>
            <th>Ultimo mov.</th>
            {esAdministrador ? <th>Acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {repuestos.map((repuesto) => (
            <tr key={repuesto.id}>
              <td className="font-extrabold text-[var(--verde-profundo)]">{repuesto.codigo}</td>
              <td>
                <span className="block font-bold">{repuesto.nombre}</span>
                <span className="text-[var(--tinta-suave)]">{repuesto.estado}</span>
              </td>
              <td>
                {repuesto.marca} {repuesto.modelo} - {repuesto.anio}
              </td>
              <td>{repuesto.categoria}</td>
              <td>{repuesto.stock}</td>
              <td>{formatearGs(repuesto.precio * repuesto.stock)}</td>
              <td>{calcularDias(repuesto.ultimo_movimiento)} dias</td>
              {esAdministrador ? (
                <td>
                  <div className="flex gap-2">
                    <button className="table-action text-[var(--verde-taller)]" onClick={() => editarRepuesto(repuesto)}>
                      Editar
                    </button>
                    <button className="table-action text-red-700" onClick={() => void eliminarRepuesto(repuesto)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
