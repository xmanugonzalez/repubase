import type { MiembroTaller, RolTaller } from '../tipos/dominio'
import type { MiembroFormulario } from '../tipos/formularios'
import { Input } from '../components/ui/Input'
import { Panel } from '../components/ui/Panel'

export function Usuarios({
  miembros,
  nuevoMiembro,
  setNuevoMiembro,
  agregarMiembro,
  reclamarInvitacion,
}: {
  miembros: MiembroTaller[]
  nuevoMiembro: MiembroFormulario
  setNuevoMiembro: (value: MiembroFormulario) => void
  agregarMiembro: () => Promise<void>
  reclamarInvitacion: () => Promise<void>
}) {
  return (
    <div className="module-grid">
      <Panel titulo="Agregar miembro">
        <div className="grid gap-5">
          <Input value={nuevoMiembro.email} onChange={(email) => setNuevoMiembro({ ...nuevoMiembro, email })} label="Email" type="email" />
          <label>
            <span className="field-label">Rol</span>
            <select
              className="control"
              value={nuevoMiembro.rol}
              onChange={(event) => setNuevoMiembro({ ...nuevoMiembro, rol: event.target.value as RolTaller })}
            >
              <option value="mecanico">Mecanico</option>
              <option value="administrador">Administrador</option>
            </select>
          </label>
          <button className="primary-button" onClick={() => void agregarMiembro()}>
            Agregar por email
          </button>
          <button className="secondary-button" onClick={() => void reclamarInvitacion()}>
            Activar mis invitaciones
          </button>
        </div>
      </Panel>
      <Panel titulo="Miembros del taller">
        <div className="grid gap-3">
          {miembros.map((miembro) => (
            <article key={miembro.id} className="panel-soft flex flex-col justify-between gap-3 p-5 md:flex-row md:items-center">
              <div>
                <p className="font-extrabold text-[var(--verde-profundo)]">{miembro.email}</p>
                <p className="text-sm font-semibold text-[var(--tinta-suave)]">{miembro.usuario_id ? 'Cuenta vinculada' : 'Pendiente de registro'}</p>
              </div>
              <div className="flex gap-2">
                <span className="status-pill">
                  {miembro.rol}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-[var(--tinta-suave)]">
                  {miembro.estado}
                </span>
              </div>
            </article>
          ))}
          {miembros.length === 0 ? (
            <div className="empty-state grid min-h-[18rem] place-items-center p-10 text-center">
              <p className="section-copy">Todavia no hay miembros registrados para este taller.</p>
            </div>
          ) : null}
        </div>
      </Panel>
    </div>
  )
}
