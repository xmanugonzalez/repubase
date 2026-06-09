import { useState, type KeyboardEvent } from 'react'
import {
  HiOutlineArchiveBox,
  HiOutlineCalendarDays,
  HiOutlineCube,
  HiOutlineMapPin,
  HiOutlinePencilSquare,
  HiOutlineTag,
  HiOutlineTruck,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { calcularDias, formatearFecha, formatearGs } from '../../lib/fechas'
import type { Repuesto } from '../../tipos/dominio'

const obtenerDetalleVehiculo = (repuesto: Repuesto) =>
  [repuesto.marca, repuesto.modelo, repuesto.anio].filter(Boolean).join(' ') || 'Sin vehiculo asignado'

const obtenerAtributosVisibles = (repuesto: Repuesto) =>
  Object.entries(repuesto.atributos ?? {})
    .filter(([, valor]) => valor)
    .slice(0, 2)

const obtenerAtributosCompletos = (repuesto: Repuesto) =>
  Object.entries(repuesto.atributos ?? {}).filter(([, valor]) => valor)

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
  const [repuestoSeleccionado, setRepuestoSeleccionado] = useState<Repuesto | null>(null)

  const abrirDetalleConTeclado = (event: KeyboardEvent<HTMLTableRowElement>, repuesto: Repuesto) => {
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    setRepuestoSeleccionado(repuesto)
  }

  const editarDesdeModal = (repuesto: Repuesto) => {
    setRepuestoSeleccionado(null)
    editarRepuesto(repuesto)
  }

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
              <tr
                key={repuesto.id}
                className="inventory-table-row"
                role="button"
                tabIndex={0}
                onClick={() => setRepuestoSeleccionado(repuesto)}
                onKeyDown={(event) => abrirDetalleConTeclado(event, repuesto)}
                aria-label={`Ver detalle de ${repuesto.nombre}`}
              >
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
                      <button
                        className="table-action text-[var(--verde-taller)]"
                        onClick={(event) => {
                          event.stopPropagation()
                          editarRepuesto(repuesto)
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="table-action text-red-700"
                        onClick={(event) => {
                          event.stopPropagation()
                          void eliminarRepuesto(repuesto)
                        }}
                      >
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

      {repuestoSeleccionado ? (
        <DetalleRepuestoModal
          repuesto={repuestoSeleccionado}
          esAdministrador={esAdministrador}
          onCerrar={() => setRepuestoSeleccionado(null)}
          onEditar={editarDesdeModal}
        />
      ) : null}
    </div>
  )
}

function DetalleRepuestoModal({
  repuesto,
  esAdministrador,
  onCerrar,
  onEditar,
}: {
  repuesto: Repuesto
  esAdministrador: boolean
  onCerrar: () => void
  onEditar: (repuesto: Repuesto) => void
}) {
  const atributos = obtenerAtributosCompletos(repuesto)
  const vehiculo = obtenerDetalleVehiculo(repuesto)
  const valorTotal = repuesto.precio * repuesto.stock

  return (
    <div className="modal-backdrop part-detail-backdrop" role="presentation" onClick={onCerrar}>
      <section
        className="part-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-repuesto-titulo"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close-button" aria-label="Cerrar modal" onClick={onCerrar}>
          <HiOutlineXMark size={22} />
        </button>

        <div className="part-detail-hero">
          <div className="part-detail-photo">
            {repuesto.foto_url ? <img src={repuesto.foto_url} alt={repuesto.nombre} /> : <span>{repuesto.nombre.charAt(0)}</span>}
          </div>

          <div className="part-detail-heading">
            <span className="label-caps">{repuesto.categoria}</span>
            <h3 id="detalle-repuesto-titulo" className="headline-title">
              {repuesto.nombre}
            </h3>
            <p>{repuesto.descripcion || 'Ficha completa del repuesto con datos de inventario, valor y compatibilidad.'}</p>

            <div className="part-detail-tags">
              <span>
                <HiOutlineTag size={17} />
                {repuesto.codigo || 'Sin codigo'}
              </span>
              <span>
                <HiOutlineTruck size={17} />
                {vehiculo}
              </span>
              <span>
                <HiOutlineMapPin size={17} />
                {repuesto.ubicacion || 'Sin ubicacion'}
              </span>
            </div>
          </div>
        </div>

        <div className="part-detail-metrics">
          <DetalleMetrica etiqueta="Stock" valor={String(repuesto.stock)} ayuda={`Estado: ${repuesto.estado}`} />
          <DetalleMetrica etiqueta="Precio unitario" valor={formatearGs(repuesto.precio)} ayuda="Valor por unidad" />
          <DetalleMetrica etiqueta="Valor total" valor={formatearGs(valorTotal)} ayuda="Stock x precio" />
          <DetalleMetrica etiqueta="Ultimo mov." valor={`${calcularDias(repuesto.ultimo_movimiento)} dias`} ayuda={formatearFecha(repuesto.ultimo_movimiento)} />
        </div>

        <div className="part-detail-grid">
          <section className="part-detail-section">
            <h4>
              <HiOutlineCube size={19} />
              Datos principales
            </h4>
            <dl className="part-detail-list">
              <DetalleDato etiqueta="Marca" valor={repuesto.marca || 'Sin marca'} />
              <DetalleDato etiqueta="Modelo" valor={repuesto.modelo || 'Sin modelo'} />
              <DetalleDato etiqueta="Año" valor={repuesto.anio ? String(repuesto.anio) : 'Sin año'} />
              <DetalleDato etiqueta="Categoria" valor={repuesto.categoria} />
              <DetalleDato etiqueta="Estado" valor={repuesto.estado} />
              <DetalleDato etiqueta="Ubicacion" valor={repuesto.ubicacion || 'Sin ubicacion'} />
            </dl>
          </section>

          <section className="part-detail-section">
            <h4>
              <HiOutlineCalendarDays size={19} />
              Registro
            </h4>
            <dl className="part-detail-list">
              <DetalleDato etiqueta="Creado" valor={formatearFecha(repuesto.creado_en)} />
              <DetalleDato etiqueta="Actualizado" valor={formatearFecha(repuesto.actualizado_en)} />
              <DetalleDato etiqueta="Ultimo movimiento" valor={formatearFecha(repuesto.ultimo_movimiento)} />
            </dl>
          </section>
        </div>

        <section className="part-detail-section">
          <h4>
            <HiOutlineArchiveBox size={19} />
            Detalles especificos
          </h4>
          {atributos.length > 0 ? (
            <div className="part-detail-attributes">
              {atributos.map(([clave, valor]) => (
                <span key={clave}>
                  <strong>{clave.replaceAll('_', ' ')}</strong>
                  {valor}
                </span>
              ))}
            </div>
          ) : (
            <p className="section-copy">Este repuesto no tiene atributos adicionales cargados.</p>
          )}
        </section>

        <div className="part-detail-actions">
          {esAdministrador ? (
            <button className="primary-button" type="button" onClick={() => onEditar(repuesto)}>
              <HiOutlinePencilSquare size={20} />
              Editar repuesto
            </button>
          ) : null}
          <button className="secondary-button" type="button" onClick={onCerrar}>
            Cerrar detalle
          </button>
        </div>
      </section>
    </div>
  )
}

function DetalleMetrica({ etiqueta, valor, ayuda }: { etiqueta: string; valor: string; ayuda: string }) {
  return (
    <article className="part-detail-metric">
      <span>{etiqueta}</span>
      <strong>{valor}</strong>
      <p>{ayuda}</p>
    </article>
  )
}

function DetalleDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt>{etiqueta}</dt>
      <dd>{valor}</dd>
    </div>
  )
}
