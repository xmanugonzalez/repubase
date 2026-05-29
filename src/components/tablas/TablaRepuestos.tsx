import { HiOutlineArchiveBox } from 'react-icons/hi2'
import { calcularDias, formatearGs } from '../../lib/fechas'
import type { Repuesto } from '../../tipos/dominio'

const obtenerDetalleVehiculo = (repuesto: Repuesto) =>
  [repuesto.marca, repuesto.modelo, repuesto.anio].filter(Boolean).join(' ') || 'Sin vehiculo asignado'

const obtenerAtributosVisibles = (repuesto: Repuesto) =>
  Object.entries(repuesto.atributos ?? {})
    .filter(([, valor]) => valor)
    .slice(0, 2)

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
      <div className="empty-state module-empty-state grid min-h-[18rem] place-items-center p-10 text-center">
        <span className="module-empty-icon" aria-hidden="true">
          <HiOutlineArchiveBox size={24} />
        </span>
        <p className="section-copy">Todavia no hay repuestos cargados para este taller.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table inventory-table w-full min-w-[820px] text-left text-sm">
        <thead>
          <tr>
            <th className="py-3">Repuesto</th>
            <th>Categoria</th>
            <th>Vehiculo</th>
            <th>Detalles</th>
            <th>Stock</th>
            <th>Valor</th>
            <th>Ultimo mov.</th>
            {esAdministrador ? <th>Acciones</th> : null}
          </tr>
        </thead>
        <tbody>
          {repuestos.map((repuesto) => {
            const atributos = obtenerAtributosVisibles(repuesto)

            return (
              <tr key={repuesto.id}>
                <td>
                  <div className="table-part-cell">
                    {repuesto.foto_url ? <img src={repuesto.foto_url} alt="" /> : <span>{repuesto.nombre.charAt(0)}</span>}
                    <div>
                      <span className="block font-bold">{repuesto.nombre}</span>
                      <span className="text-[var(--tinta-suave)]">
                        {repuesto.codigo ? `Codigo ${repuesto.codigo}` : 'Sin codigo'} - {repuesto.estado}
                      </span>
                    </div>
                  </div>
                </td>
                <td>{repuesto.categoria}</td>
                <td>{obtenerDetalleVehiculo(repuesto)}</td>
                <td>
                  {atributos.length > 0 ? (
                    <div className="table-attribute-list">
                      {atributos.map(([clave, valor]) => (
                        <span key={clave}>{valor}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--tinta-suave)]">Sin detalles</span>
                  )}
                </td>
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
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
