import { Clipboard, Link2, RefreshCw } from 'lucide-react'
import type { MiembroTaller, RolTaller } from '../tipos/dominio'
import type { MiembroFormulario } from '../tipos/formularios'
import { Input } from '../components/ui/Input'
import { Panel } from '../components/ui/Panel'

export function Usuarios({
  miembros,
  nuevoMiembro,
  setNuevoMiembro,
  agregarMiembro,
  copiarInvitacionLink,
  generarInvitacionLink,
  generandoInvitacion,
  linkInvitacion,
  rolInvitacionLink,
  setRolInvitacionLink,
}: {
  miembros: MiembroTaller[]
  nuevoMiembro: MiembroFormulario
  setNuevoMiembro: (value: MiembroFormulario) => void
  agregarMiembro: () => Promise<void>
  copiarInvitacionLink: () => Promise<void>
  generarInvitacionLink: () => Promise<void>
  generandoInvitacion: boolean
  linkInvitacion: string
  rolInvitacionLink: RolTaller
  setRolInvitacionLink: (value: RolTaller) => void
}) {
  return (
    <div className="surface-grid">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1.875rem]">
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
        </div>
      </Panel>
      <Panel
        titulo="Link de invitación"
        icon={
          <div className="invite-link-icon" aria-hidden="true">
            <Link2 size={22} />
          </div>
        }
      >
        <div className="grid gap-5">
          <p className="section-copy">
            Comparte este enlace para que otros usuarios puedan unirse a este taller.
          </p>
            <label>
              <span className="field-label">Rol del enlace</span>
              <select
                className="control"
                value={rolInvitacionLink}
                onChange={(event) => setRolInvitacionLink(event.target.value as RolTaller)}
              >
                <option value="mecanico">Mecanico</option>
                <option value="administrador">Administrador</option>
              </select>
            </label>
            <button className="primary-button" disabled={generandoInvitacion} onClick={() => void generarInvitacionLink()}>
              <RefreshCw size={18} />
              {linkInvitacion ? 'Regenerar link' : 'Generar link'}
            </button>
            {linkInvitacion ? (
              <div className="invite-link-result">
                <input className="control" value={linkInvitacion} readOnly aria-label="Link de invitacion generado" />
                <button className="secondary-button" onClick={() => void copiarInvitacionLink()}>
                  <Clipboard size={18} />
                  Copiar link
                </button>
              </div>
            ) : (
              <p className="invite-link-note">
                Por seguridad, el link completo solo se muestra al generarlo o regenerarlo.
              </p>
            )}
          </div>
        </Panel>
      </div>
      <Panel titulo="Miembros del taller">
        <div className="grid gap-3">
          {miembros.map((miembro) => (
            <article key={miembro.id} className="panel-soft flex flex-col justify-between gap-3 p-5 md:flex-row md:items-center">
              <div className="min-w-0">
                <p className="truncate font-extrabold text-[var(--verde-profundo)]">{miembro.email}</p>
                <p className="truncate text-sm font-semibold text-[var(--tinta-suave)]">{miembro.usuario_id ? 'Cuenta vinculada' : 'Pendiente de registro'}</p>
              </div>
              <div className="flex shrink-0 gap-2">
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
