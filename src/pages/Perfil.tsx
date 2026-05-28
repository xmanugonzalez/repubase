import { useState } from 'react'
import { AlertTriangle, Camera, Mail, ShieldCheck, Trash2, UserRound, Wrench, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { MiembroTaller, Perfil as PerfilUsuario, Taller } from '../tipos/dominio'
import { Input } from '../components/ui/Input'
import { Panel } from '../components/ui/Panel'

export function Perfil({
  perfil,
  usuarioEmail,
  perfilNombre,
  setPerfilNombre,
  guardarPerfil,
  subirFotoPerfil,
  subiendoAvatar,
  eliminarCuenta,
  eliminandoCuenta,
  miembros,
  talleres,
  tallerActivoId,
}: {
  perfil: PerfilUsuario | null
  usuarioEmail?: string
  perfilNombre: string
  setPerfilNombre: (value: string) => void
  guardarPerfil: () => Promise<void>
  subirFotoPerfil: (archivo: File) => Promise<void>
  subiendoAvatar: boolean
  eliminarCuenta: () => Promise<void>
  eliminandoCuenta: boolean
  miembros: MiembroTaller[]
  talleres: Taller[]
  tallerActivoId: string
}) {
  const [modalEliminarAbierto, setModalEliminarAbierto] = useState(false)
  const [confirmacionEliminar, setConfirmacionEliminar] = useState('')
  const inicial = (perfil?.nombre || usuarioEmail || 'U').trim().charAt(0).toUpperCase()
  const talleresPorId = new Map(talleres.map((taller) => [taller.id, taller]))
  const membresiaActiva = miembros.find((miembro) => miembro.taller_id === tallerActivoId && miembro.estado === 'activo')
  const fraseConfirmacion = 'ELIMINAR MI CUENTA'
  const cuentaConfirmada = confirmacionEliminar.trim() === fraseConfirmacion

  const cerrarModalEliminar = () => {
    if (eliminandoCuenta) return

    setModalEliminarAbierto(false)
    setConfirmacionEliminar('')
  }

  const confirmarEliminacionCuenta = async () => {
    if (!cuentaConfirmada) return

    await eliminarCuenta()
  }

  return (
    <>
      <div className="profile-grid">
        <Panel titulo="Mi perfil">
          <div className="profile-hero">
            <div className="profile-avatar-wrap">
              {perfil?.avatar_url ? (
                <img className="profile-avatar" src={perfil.avatar_url} alt={`Foto de ${perfil.nombre ?? usuarioEmail}`} />
              ) : (
                <div className="profile-avatar profile-avatar-empty" aria-hidden="true">
                  {inicial}
                </div>
              )}
              <label className="profile-photo-button">
                <Camera size={18} />
                <span>{subiendoAvatar ? 'Subiendo...' : 'Cambiar foto'}</span>
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  disabled={subiendoAvatar}
                  onChange={(event) => {
                    const archivo = event.target.files?.[0]
                    if (archivo) void subirFotoPerfil(archivo)
                    event.target.value = ''
                  }}
                />
              </label>
            </div>

            <div className="min-w-0">
              <p className="label-caps mb-3">Cuenta personal</p>
              <h3 className="profile-name">{perfil?.nombre || 'Sin nombre registrado'}</h3>
              <p className="profile-email">{usuarioEmail}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-5">
            <Input label="Nombre visible" value={perfilNombre} onChange={setPerfilNombre} />
            <button className="primary-button w-full" type="button" onClick={() => void guardarPerfil()}>
              Guardar perfil
            </button>
          </div>
        </Panel>

          <Panel titulo="Información de cuenta">
            <div className="profile-facts">
              <DatoPerfil icono={Mail} etiqueta="Correo" valor={usuarioEmail ?? 'Sin correo registrado'} />
              <DatoPerfil icono={ShieldCheck} etiqueta="Rol activo" valor={membresiaActiva?.rol ?? 'Sin rol activo'} />
              <DatoPerfil
                icono={Wrench}
                etiqueta="Taller activo"
                valor={talleresPorId.get(tallerActivoId)?.nombre ?? 'Sin taller seleccionado'}
              />
              <DatoPerfil
                icono={UserRound}
                etiqueta="Miembro desde"
                valor={perfil?.creado_en ? new Date(perfil.creado_en).toLocaleDateString('es-PY') : 'Sin fecha'}
              />
            </div>
          </Panel>

          <Panel titulo="Talleres y roles">
            <div className="grid gap-3">
              {miembros.map((miembro) => {
                const taller = talleresPorId.get(miembro.taller_id)

                return (
                  <article key={miembro.id} className="profile-workshop-card">
                    <div>
                      <p className="font-extrabold text-[var(--verde-profundo)]">{taller?.nombre ?? miembro.email}</p>
                      <p className="text-sm font-semibold text-[var(--tinta-suave)]">
                        {taller?.direccion || 'Sin dirección registrada'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="status-pill">{miembro.rol}</span>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-[var(--tinta-suave)]">
                        {miembro.estado}
                      </span>
                    </div>
                  </article>
                )
              })}

              {miembros.length === 0 ? (
                <div className="empty-state grid min-h-[14rem] place-items-center p-10 text-center">
                  <p className="section-copy">Todavía no participas en ningún taller.</p>
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel titulo="Zona de peligro">
            <div className="account-danger-card">
              <div>
                <p className="font-extrabold text-[var(--error)]">Eliminar cuenta</p>
                <p>
                  Borra tu acceso personal a Repubase. Si tienes talleres donde eres el único miembro activo, también se
                  eliminarán junto con su inventario y movimientos.
                </p>
              </div>
              <button
                className="danger-button account-danger-button"
                type="button"
                onClick={() => setModalEliminarAbierto(true)}
              >
                <Trash2 size={18} />
                Eliminar cuenta
              </button>
            </div>
          </Panel>
      </div>

      {modalEliminarAbierto ? (
        <div className="modal-backdrop" role="presentation">
          <section className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="eliminar-cuenta-titulo">
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <AlertTriangle size={26} />
              </div>
              <button
                type="button"
                className="modal-close-button"
                aria-label="Cerrar modal"
                onClick={cerrarModalEliminar}
              >
                <X size={20} />
              </button>
            </div>

            <h3 id="eliminar-cuenta-titulo">Eliminar cuenta</h3>
            <p>
              Esta acción es irreversible. Se eliminará tu cuenta personal, tu perfil y tu foto. Los talleres donde seas
              el único miembro activo también se eliminarán con sus datos asociados.
            </p>
            <p>
              Para confirmar, escribe <strong>"{fraseConfirmacion}"</strong> en el campo de abajo.
            </p>

            <form
              className="delete-confirm-form"
              onSubmit={(event) => {
                event.preventDefault()
                void confirmarEliminacionCuenta()
              }}
            >
              <label htmlFor="confirmar-eliminar-cuenta">Confirmación requerida</label>
              <input
                id="confirmar-eliminar-cuenta"
                value={confirmacionEliminar}
                onChange={(event) => setConfirmacionEliminar(event.target.value)}
                placeholder={fraseConfirmacion}
                autoFocus
              />
              <button className="danger-button" type="submit" disabled={!cuentaConfirmada || eliminandoCuenta}>
                {eliminandoCuenta ? 'Eliminando cuenta...' : 'Eliminar mi cuenta definitivamente'}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  )
}

function DatoPerfil({
  icono: Icono,
  etiqueta,
  valor,
}: {
  icono: LucideIcon
  etiqueta: string
  valor: string
}) {
  return (
    <article className="profile-fact">
      <Icono size={20} />
      <div className="min-w-0">
        <p>{etiqueta}</p>
        <strong>{valor}</strong>
      </div>
    </article>
  )
}
