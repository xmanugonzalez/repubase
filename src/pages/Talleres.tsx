import { useState } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import type { Taller } from '../tipos/dominio'
import type { TallerFormulario } from '../tipos/formularios'
import { Input } from '../components/ui/Input'
import { Panel } from '../components/ui/Panel'

export function Talleres({
  talleres,
  nuevoTaller,
  setNuevoTaller,
  crearTaller,
  eliminarTaller,
  seleccionarTaller,
  esAdministradorDeTaller,
}: {
  talleres: Taller[]
  nuevoTaller: TallerFormulario
  setNuevoTaller: (value: TallerFormulario) => void
  crearTaller: () => Promise<void>
  eliminarTaller: (taller: Taller) => Promise<void>
  seleccionarTaller: (id: string) => void
  esAdministradorDeTaller: (tallerId: string) => boolean
}) {
  const [tallerParaEliminar, setTallerParaEliminar] = useState<Taller | null>(null)
  const [confirmacion, setConfirmacion] = useState('')
  const nombreConfirmado = Boolean(tallerParaEliminar && confirmacion.trim() === tallerParaEliminar.nombre)

  const cerrarModal = () => {
    setTallerParaEliminar(null)
    setConfirmacion('')
  }

  const confirmarEliminacion = async () => {
    if (!tallerParaEliminar || !nombreConfirmado) return

    await eliminarTaller(tallerParaEliminar)
    cerrarModal()
  }

  return (
    <div className="module-grid">
      <Panel titulo="Crear taller">
        <div className="grid gap-5">
          <Input value={nuevoTaller.nombre} onChange={(nombre) => setNuevoTaller({ ...nuevoTaller, nombre })} label="Nombre" />
          <Input value={nuevoTaller.direccion} onChange={(direccion) => setNuevoTaller({ ...nuevoTaller, direccion })} label="Direccion" />
          <Input value={nuevoTaller.telefono} onChange={(telefono) => setNuevoTaller({ ...nuevoTaller, telefono })} label="Telefono" />
          <button className="primary-button mt-8 w-full" onClick={() => void crearTaller()}>
            Crear taller
          </button>
        </div>
      </Panel>
      <Panel titulo="Mis talleres">
        <div className="grid gap-3">
          {talleres.map((taller) => (
            <article
              key={taller.id}
              className="panel-soft taller-card pressable p-5 transition hover:bg-white"
            >
              <button className="min-w-0 text-left" type="button" onClick={() => seleccionarTaller(taller.id)}>
                <span className="block truncate font-extrabold text-[var(--verde-profundo)]">{taller.nombre}</span>
                <span className="text-sm font-semibold text-[var(--tinta-suave)]">
                  {taller.direccion || 'Sin direccion registrada'}
                </span>
              </button>

              {esAdministradorDeTaller(taller.id) ? (
                <button
                  type="button"
                  className="danger-icon-button"
                  aria-label={`Eliminar taller ${taller.nombre}`}
                  onClick={() => {
                    setTallerParaEliminar(taller)
                    setConfirmacion('')
                  }}
                >
                  <Trash2 size={18} />
                </button>
              ) : null}
            </article>
          ))}
          {talleres.length === 0 ? (
            <div className="empty-state grid place-items-center p-10 text-center text-xl font-semibold">
              <p className="max-w-lg">Todavia no tienes talleres. Crea uno para empezar el inventario.</p>
            </div>
          ) : null}
        </div>
      </Panel>

      {tallerParaEliminar ? (
        <div className="modal-backdrop" role="presentation">
          <section className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="eliminar-taller-titulo">
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <AlertTriangle size={24} />
              </div>
              <button type="button" className="modal-close-button" aria-label="Cerrar modal" onClick={cerrarModal}>
                <X size={20} />
              </button>
            </div>

            <h3 id="eliminar-taller-titulo">Eliminar taller</h3>
            <p>
              Esta acción eliminará el taller <strong>{tallerParaEliminar.nombre}</strong> y sus datos asociados del
              sistema. No podrás deshacer este cambio desde Repubase.
            </p>

            <form
              className="delete-confirm-form"
              onSubmit={(event) => {
                event.preventDefault()
                void confirmarEliminacion()
              }}
            >
              <label htmlFor="confirmar-eliminar-taller">
                Para confirmar, escribe <strong>"{tallerParaEliminar.nombre}"</strong> en el campo de abajo.
              </label>
              <input
                id="confirmar-eliminar-taller"
                value={confirmacion}
                onChange={(event) => setConfirmacion(event.target.value)}
                autoFocus
                autoComplete="off"
              />
              <button className="danger-button" type="submit" disabled={!nombreConfirmado}>
                Eliminar este taller
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}
