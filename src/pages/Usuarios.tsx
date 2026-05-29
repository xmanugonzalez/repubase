import { useState, type ReactNode } from 'react'
import {
  HiOutlineArrowPath,
  HiOutlineClipboardDocument,
  HiOutlineEnvelope,
  HiOutlineLink,
  HiOutlineTrash,
  HiOutlineShieldCheck,
  HiOutlineUserGroup,
  HiOutlineUserPlus,
  HiOutlineWrenchScrewdriver,
  HiOutlineXMark,
} from 'react-icons/hi2'
import type { MiembroTaller, RolTaller } from '../tipos/dominio'
import type { MiembroFormulario } from '../tipos/formularios'
import { obtenerDescripcionRol, obtenerRolLegible, puedeAsignarRol, puedeGestionarMiembro, ROLES_TALLER } from '../modulos/talleres/permisos'
import { Input } from '../components/ui/Input'
import { Panel } from '../components/ui/Panel'

const defaultUserAvatarSrc = `${import.meta.env.BASE_URL}default-user-avatar.svg`

type ConfirmacionUsuarios = {
  titulo: string
  descripcion: ReactNode
  confirmarTexto: string
  variante: 'normal' | 'danger'
  icono: ReactNode
  accion: () => Promise<void>
} | null

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
  membresiaActual,
  cambiarRolMiembro,
  eliminarMiembroTaller,
  transferirPropiedadTaller,
}: {
  miembros: MiembroTaller[]
  membresiaActual: MiembroTaller | undefined
  nuevoMiembro: MiembroFormulario
  setNuevoMiembro: (value: MiembroFormulario) => void
  agregarMiembro: () => Promise<void>
  cambiarRolMiembro: (miembro: MiembroTaller, rol: RolTaller) => Promise<void>
  eliminarMiembroTaller: (miembro: MiembroTaller) => Promise<void>
  transferirPropiedadTaller: (miembro: MiembroTaller) => Promise<void>
  copiarInvitacionLink: () => Promise<void>
  generarInvitacionLink: () => Promise<void>
  generandoInvitacion: boolean
  linkInvitacion: string
  rolInvitacionLink: RolTaller
  setRolInvitacionLink: (value: RolTaller) => void
}) {
  const administradores = miembros.filter((miembro) => miembro.rol === 'administrador').length
  const activos = miembros.filter((miembro) => miembro.estado === 'activo').length
  const invitados = miembros.filter((miembro) => miembro.estado === 'invitado').length
  const rolActor = membresiaActual?.rol
  const rolesInvitables = ROLES_TALLER.filter((rol) => rol.valor !== 'propietario' && puedeAsignarRol(rolActor, rol.valor))
  const rolesEditables = ROLES_TALLER.filter((rol) => rol.valor !== 'propietario' && puedeAsignarRol(rolActor, rol.valor))
  const [confirmacion, setConfirmacion] = useState<ConfirmacionUsuarios>(null)
  const [confirmando, setConfirmando] = useState(false)

  const cerrarConfirmacion = () => {
    if (confirmando) return
    setConfirmacion(null)
  }

  const ejecutarConfirmacion = async () => {
    if (!confirmacion || confirmando) return

    setConfirmando(true)

    try {
      await confirmacion.accion()
      setConfirmacion(null)
    } finally {
      setConfirmando(false)
    }
  }

  const confirmarCambioRol = (miembro: MiembroTaller, rol: RolTaller) => {
    if (miembro.rol === rol) return

    const nombre = miembro.perfil?.nombre || miembro.email
    const esAdministrador = rol === 'administrador'

    setConfirmacion({
      titulo: esAdministrador ? 'Convertir en administrador' : 'Cambiar rol',
      descripcion: esAdministrador ? (
        <>
          Vas a convertir a <strong>{nombre}</strong> en administrador. Esta persona podra gestionar miembros y operar el
          taller con permisos altos.
        </>
      ) : (
        <>
          Vas a cambiar el rol de <strong>{nombre}</strong> a <strong>{obtenerRolLegible(rol)}</strong>.
        </>
      ),
      confirmarTexto: esAdministrador ? 'Confirmar administrador' : 'Cambiar rol',
      variante: 'normal',
      icono: <HiOutlineShieldCheck size={24} />,
      accion: () => cambiarRolMiembro(miembro, rol),
    })

  }

  const confirmarEliminacion = (miembro: MiembroTaller) => {
    const nombre = miembro.perfil?.nombre || miembro.email

    setConfirmacion({
      titulo: 'Eliminar miembro',
      descripcion: (
        <>
          Vas a quitar a <strong>{nombre}</strong> de este taller. Si necesita volver a entrar, tendras que invitarlo de
          nuevo.
        </>
      ),
      confirmarTexto: 'Eliminar miembro',
      variante: 'danger',
      icono: <HiOutlineTrash size={24} />,
      accion: () => eliminarMiembroTaller(miembro),
    })

  }

  const confirmarTransferencia = (miembro: MiembroTaller) => {
    const nombre = miembro.perfil?.nombre || miembro.email

    setConfirmacion({
      titulo: 'Transferir propiedad',
      descripcion: (
        <>
          Vas a transferir la propiedad del taller a <strong>{nombre}</strong>. Despues de confirmar, esa persona tendra
          el control principal del taller.
        </>
      ),
      confirmarTexto: 'Transferir propiedad',
      variante: 'normal',
      icono: <HiOutlineArrowPath size={24} />,
      accion: () => transferirPropiedadTaller(miembro),
    })

  }

  return (
    <div className="surface-grid">
      <div className="users-summary-grid">
        <article className="users-summary-card">
          <span className="users-summary-icon" aria-hidden="true">
            <HiOutlineUserGroup size={23} />
          </span>
          <div>
            <span>Equipo</span>
            <strong>{miembros.length}</strong>
          </div>
        </article>
        <article className="users-summary-card">
          <span className="users-summary-icon" aria-hidden="true">
            <HiOutlineShieldCheck size={23} />
          </span>
          <div>
            <span>Admins</span>
            <strong>{administradores}</strong>
          </div>
        </article>
        <article className="users-summary-card">
          <span className="users-summary-icon" aria-hidden="true">
            <HiOutlineWrenchScrewdriver size={23} />
          </span>
          <div>
            <span>Activos</span>
            <strong>{activos}</strong>
          </div>
        </article>
        <article className="users-summary-card">
          <span className="users-summary-icon" aria-hidden="true">
            <HiOutlineEnvelope size={23} />
          </span>
          <div>
            <span>Invitados</span>
            <strong>{invitados}</strong>
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-[1.875rem] lg:grid-cols-2">
        <Panel
          titulo="Agregar miembro"
          icon={
            <div className="users-section-icon" aria-hidden="true">
              <HiOutlineUserPlus size={23} />
            </div>
          }
        >
          <div className="grid gap-5">
            <p className="section-copy">
              Invita a una persona puntual con su email y asignale el rol correcto desde el inicio.
            </p>
            <Input
              value={nuevoMiembro.email}
              onChange={(email) => setNuevoMiembro({ ...nuevoMiembro, email })}
              label="Email"
              type="email"
              placeholder="mecanico@taller.com"
            />
            <label>
              <span className="field-label">Rol</span>
              <select
                className="control"
                value={nuevoMiembro.rol}
                onChange={(event) => setNuevoMiembro({ ...nuevoMiembro, rol: event.target.value as RolTaller })}
              >
                {rolesInvitables.map((rol) => (
                  <option key={rol.valor} value={rol.valor}>
                    {rol.etiqueta} - {rol.descripcion}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" onClick={() => void agregarMiembro()}>
              <HiOutlineEnvelope size={19} />
              Agregar por email
            </button>
          </div>
        </Panel>

        <Panel
          titulo="Link de invitacion"
          icon={
            <div className="users-section-icon" aria-hidden="true">
              <HiOutlineLink size={23} />
            </div>
          }
        >
          <div className="grid gap-5">
            <p className="section-copy">
              Crea un link compartible para sumar gente al taller sin cargar cada email manualmente.
            </p>
            <label>
              <span className="field-label">Rol del enlace</span>
              <select
                className="control"
                value={rolInvitacionLink}
                onChange={(event) => setRolInvitacionLink(event.target.value as RolTaller)}
              >
                {rolesInvitables.map((rol) => (
                  <option key={rol.valor} value={rol.valor}>
                    {rol.etiqueta} - {rol.descripcion}
                  </option>
                ))}
              </select>
            </label>
            <button className="primary-button" disabled={generandoInvitacion} onClick={() => void generarInvitacionLink()}>
              <HiOutlineArrowPath size={18} />
              {linkInvitacion ? 'Regenerar link' : 'Generar link'}
            </button>
            {linkInvitacion ? (
              <div className="invite-link-result">
                <input className="control" value={linkInvitacion} readOnly aria-label="Link de invitacion generado" />
                <button className="secondary-button" onClick={() => void copiarInvitacionLink()}>
                  <HiOutlineClipboardDocument size={18} />
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

      <Panel
        titulo="Miembros del taller"
        icon={
          <div className="users-section-icon" aria-hidden="true">
            <HiOutlineUserGroup size={23} />
          </div>
        }
      >
        <div className="members-list">
          {miembros.map((miembro) => {
            const nombre = miembro.perfil?.nombre?.trim() || 'Usuario sin nombre'
            const correo = miembro.perfil?.email || miembro.email
            const avatar = miembro.perfil?.avatar_url || defaultUserAvatarSrc
            const puedeEditarMiembro = puedeGestionarMiembro(rolActor, miembro.rol)
            const puedeTransferir = rolActor === 'propietario' && miembro.estado === 'activo' && miembro.rol !== 'propietario'

            return (
              <article key={miembro.id} className="member-card">
                <img
                  className="member-avatar"
                  src={avatar}
                  alt={miembro.perfil?.avatar_url ? `Foto de ${nombre}` : ''}
                  aria-hidden={miembro.perfil?.avatar_url ? undefined : true}
                />
                <div className="member-copy">
                  <p>{nombre}</p>
                  <span>{correo}</span>
                </div>
                <div className="member-controls">
                  <div className="member-badges" aria-label={`Rol: ${obtenerRolLegible(miembro.rol)}`}>
                    <span className={miembro.rol === 'administrador' ? 'member-pill member-pill-admin' : 'member-pill'}>
                      {obtenerRolLegible(miembro.rol)}
                    </span>
                    {miembro.estado === 'invitado' ? <span className="member-pill member-pill-muted">Invitado</span> : null}
                  </div>
                  {puedeEditarMiembro || puedeTransferir ? (
                    <div className="member-actions">
                      {puedeEditarMiembro ? (
                        <select
                          className="control member-role-select"
                          value={miembro.rol}
                          aria-label={`Cambiar rol de ${nombre}`}
                          title={obtenerDescripcionRol(miembro.rol)}
                          onChange={(event) => void confirmarCambioRol(miembro, event.target.value as RolTaller)}
                        >
                          <option value={miembro.rol}>{obtenerRolLegible(miembro.rol)}</option>
                          {rolesEditables
                            .filter((rol) => rol.valor !== miembro.rol)
                            .map((rol) => (
                              <option key={rol.valor} value={rol.valor}>
                                {rol.etiqueta}
                              </option>
                            ))}
                        </select>
                      ) : null}
                      {puedeTransferir ? (
                        <button className="secondary-button member-action-button" type="button" onClick={() => void confirmarTransferencia(miembro)}>
                          Transferir
                        </button>
                      ) : null}
                      {puedeEditarMiembro ? (
                        <button
                          className="danger-icon-button member-delete-button"
                          type="button"
                          aria-label={`Eliminar a ${nombre}`}
                          title="Eliminar del taller"
                          onClick={() => void confirmarEliminacion(miembro)}
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </article>
            )
          })}
          {miembros.length === 0 ? (
            <div className="empty-state users-empty-state grid min-h-[18rem] place-items-center p-10 text-center">
              <span className="users-empty-icon" aria-hidden="true">
                <HiOutlineUserPlus size={24} />
              </span>
              <p className="section-copy">Todavia no hay miembros registrados para este taller.</p>
            </div>
          ) : null}
        </div>
      </Panel>

      {confirmacion ? (
        <div
          className={`modal-backdrop confirm-modal-backdrop ${confirmacion.variante === 'danger' ? 'confirm-modal-backdrop-danger' : ''}`}
          role="presentation"
        >
          <section
            className={`confirm-modal ${confirmacion.variante === 'danger' ? 'confirm-modal-danger' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="usuarios-confirmacion-titulo"
          >
            <div className="confirm-modal-header">
              <div className="confirm-modal-title">
                <span className="confirm-modal-icon" aria-hidden="true">
                  {confirmacion.icono}
                </span>
                <h3 id="usuarios-confirmacion-titulo">{confirmacion.titulo}</h3>
              </div>
              <button type="button" className="modal-close-button" aria-label="Cerrar modal" onClick={cerrarConfirmacion}>
                <HiOutlineXMark size={20} />
              </button>
            </div>
            <p>{confirmacion.descripcion}</p>
            <div className="confirm-modal-actions">
              <button className="secondary-button" type="button" disabled={confirmando} onClick={cerrarConfirmacion}>
                Cancelar
              </button>
              <button
                className={confirmacion.variante === 'danger' ? 'danger-button' : 'primary-button'}
                type="button"
                disabled={confirmando}
                onClick={() => void ejecutarConfirmacion()}
              >
                {confirmando ? 'Procesando...' : confirmacion.confirmarTexto}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}
