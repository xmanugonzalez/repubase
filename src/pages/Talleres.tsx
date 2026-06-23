import { useEffect, useMemo, useState } from 'react'
import {
  HiOutlineBuildingStorefront,
  HiOutlineCamera,
  HiOutlineCheckBadge,
  HiOutlineClock,
  HiOutlineEnvelope,
  HiOutlineMapPin,
  HiOutlinePencilSquare,
  HiOutlinePhone,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineXMark,
} from 'react-icons/hi2'
import { PiFloppyDiskBackBold, PiWarningDiamondBold } from 'react-icons/pi'
import type { Taller } from '../tipos/dominio'
import type { TallerFormulario } from '../tipos/formularios'
import { tallerInicial } from '../tipos/formularios'
import { Input } from '../components/ui/Input'
import { Panel } from '../components/ui/Panel'

const defaultWorkshopAvatarSrc = `${import.meta.env.BASE_URL}default-workshop-avatar.svg`

const crearFormularioDesdeTaller = (taller: Taller): TallerFormulario => ({
  nombre: taller.nombre,
  direccion: taller.direccion ?? '',
  telefono: taller.telefono ?? '',
  whatsapp: taller.whatsapp ?? '',
  email: taller.email ?? '',
  ciudad: taller.ciudad ?? '',
  horario: taller.horario ?? '',
  servicios: taller.servicios ?? '',
  notas: taller.notas ?? '',
  logoUrl: taller.logo_url ?? '',
  logoArchivo: null,
})

function LogoTaller({ taller, previewUrl }: { taller?: Taller; previewUrl?: string }) {
  const url = previewUrl || taller?.logo_url

  return (
    <div className="workshop-logo">
      <img src={url || defaultWorkshopAvatarSrc} alt={url ? (taller ? `Foto de ${taller.nombre}` : 'Foto del taller') : ''} aria-hidden={url ? undefined : true} />
    </div>
  )
}

function CampoTextoLargo({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <textarea
        id={id}
        className="control min-h-28 resize-y"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  )
}

function FormularioTaller({
  titulo,
  descripcion,
  formulario,
  setFormulario,
  tallerEditando,
  onGuardar,
  onCancelar,
}: {
  titulo: string
  descripcion: string
  formulario: TallerFormulario
  setFormulario: (value: TallerFormulario) => void
  tallerEditando?: Taller | null
  onGuardar: () => Promise<void>
  onCancelar?: () => void
}) {
  const previewUrl = useMemo(
    () => (formulario.logoArchivo ? URL.createObjectURL(formulario.logoArchivo) : ''),
    [formulario.logoArchivo],
  )

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const cambiarCampo = (campo: keyof TallerFormulario, valor: string) => {
    setFormulario({ ...formulario, [campo]: valor })
  }

  const puedeGuardar = Boolean(formulario.nombre.trim())

  return (
    <Panel titulo="">
      <div className="workshop-form">
        <div className="workshop-form-heading">
          <div>
            <p className="label-caps">Taller</p>
            <div className="workshop-heading-title">
              <span className="module-section-icon" aria-hidden="true">
                <HiOutlineSparkles size={23} />
              </span>
              <h3>{titulo}</h3>
            </div>
            <p>{descripcion}</p>
          </div>
        </div>

        <label className="workshop-photo-dropzone">
          <LogoTaller taller={tallerEditando ?? undefined} previewUrl={previewUrl || formulario.logoUrl} />
          <span>
            <strong>Foto o logo</strong>
            <small>{formulario.logoArchivo?.name || 'JPG, PNG o WEBP hasta 3 MB'}</small>
          </span>
          <HiOutlineCamera size={20} />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) =>
              setFormulario({ ...formulario, logoArchivo: event.target.files?.[0] ?? null })
            }
          />
        </label>

        <div className="workshop-form-section">
          <div className="workshop-section-title">
            <HiOutlineCheckBadge size={18} />
            <span>Datos principales</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              value={formulario.nombre}
              onChange={(nombre) => cambiarCampo('nombre', nombre)}
              label="Nombre del taller"
              placeholder="Ej. Unida Motors"
            />
            <Input
              value={formulario.ciudad}
              onChange={(ciudad) => cambiarCampo('ciudad', ciudad)}
              label="Ciudad"
              placeholder="Ej. Asuncion"
            />
            <Input
              value={formulario.direccion}
              onChange={(direccion) => cambiarCampo('direccion', direccion)}
              label="Direccion"
              placeholder="Avda., barrio o referencia"
            />
            <Input
              value={formulario.horario}
              onChange={(horario) => cambiarCampo('horario', horario)}
              label="Horario"
              placeholder="Lun a Vie 08:00 - 18:00"
            />
          </div>
        </div>

        <div className="workshop-form-section">
          <div className="workshop-section-title">
            <HiOutlinePhone size={18} />
            <span>Contacto</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              value={formulario.telefono}
              onChange={(telefono) => cambiarCampo('telefono', telefono)}
              label="Telefono"
              type="tel"
              placeholder="021 000 000"
            />
            <Input
              value={formulario.whatsapp}
              onChange={(whatsapp) => cambiarCampo('whatsapp', whatsapp)}
              label="WhatsApp"
              type="tel"
              placeholder="+595 981 000000"
            />
            <Input
              value={formulario.email}
              onChange={(email) => cambiarCampo('email', email)}
              label="Email"
              type="email"
              placeholder="contacto@taller.com"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <CampoTextoLargo
            id="servicios-taller"
            label="Servicios principales"
            value={formulario.servicios}
            onChange={(servicios) => cambiarCampo('servicios', servicios)}
            placeholder="Mecanica general, electricidad, diagnostico, frenos..."
          />
          <CampoTextoLargo
            id="notas-taller"
            label="Notas internas"
            value={formulario.notas}
            onChange={(notas) => cambiarCampo('notas', notas)}
            placeholder="Datos utiles para el equipo, referencias de ubicacion o forma de trabajo."
          />
        </div>

        <div className="workshop-form-actions">
          {onCancelar ? (
            <button className="secondary-button" type="button" onClick={onCancelar}>
              Cancelar
            </button>
          ) : null}
          <button className="primary-button" type="button" disabled={!puedeGuardar} onClick={() => void onGuardar()}>
            {tallerEditando ? <PiFloppyDiskBackBold size={18} /> : <HiOutlineBuildingStorefront size={18} />}
            {tallerEditando ? 'Guardar cambios' : 'Crear taller'}
          </button>
        </div>
      </div>
    </Panel>
  )
}

export function Talleres({
  talleres,
  nuevoTaller,
  setNuevoTaller,
  crearTaller,
  actualizarTaller,
  desactivarTaller,
  seleccionarTaller,
  puedeEditarTaller,
  puedeDesactivarTaller,
}: {
  talleres: Taller[]
  nuevoTaller: TallerFormulario
  setNuevoTaller: (value: TallerFormulario) => void
  crearTaller: () => Promise<void>
  actualizarTaller: (tallerId: string, formulario: TallerFormulario) => Promise<void>
  desactivarTaller: (taller: Taller) => Promise<void>
  seleccionarTaller: (id: string) => void
  puedeEditarTaller: (tallerId: string) => boolean
  puedeDesactivarTaller: (tallerId: string) => boolean
}) {
  const [tallerParaDesactivar, setTallerParaDesactivar] = useState<Taller | null>(null)
  const [tallerEditando, setTallerEditando] = useState<Taller | null>(null)
  const [formEdicion, setFormEdicion] = useState<TallerFormulario>(tallerInicial)
  const [confirmacion, setConfirmacion] = useState('')
  const nombreConfirmado = Boolean(tallerParaDesactivar && confirmacion.trim() === tallerParaDesactivar.nombre)

  const cerrarModal = () => {
    setTallerParaDesactivar(null)
    setConfirmacion('')
  }

  const iniciarEdicion = (taller: Taller) => {
    setTallerEditando(taller)
    setFormEdicion(crearFormularioDesdeTaller(taller))
  }

  const cancelarEdicion = () => {
    setTallerEditando(null)
    setFormEdicion(tallerInicial)
  }

  const confirmarDesactivacion = async () => {
    if (!tallerParaDesactivar || !nombreConfirmado) return

    await desactivarTaller(tallerParaDesactivar)
    cerrarModal()
  }

  const guardarEdicion = async () => {
    if (!tallerEditando) return

    await actualizarTaller(tallerEditando.id, formEdicion)
    cancelarEdicion()
  }

  return (
    <div className="workshops-page">
      <div className="workshops-grid">
        {tallerEditando ? (
          <FormularioTaller
            titulo={`Editar ${tallerEditando.nombre}`}
            descripcion="Actualiza la informacion visible para tu equipo."
            formulario={formEdicion}
            setFormulario={setFormEdicion}
            tallerEditando={tallerEditando}
            onGuardar={guardarEdicion}
            onCancelar={cancelarEdicion}
          />
        ) : (
          <FormularioTaller
            titulo="Crear taller"
            descripcion="Solo el nombre es obligatorio. El resto ayuda a que el taller quede listo para operar."
            formulario={nuevoTaller}
            setFormulario={setNuevoTaller}
            onGuardar={crearTaller}
          />
        )}

        <Panel titulo="">
          <div className="workshop-list-heading">
            <div>
              <p className="label-caps">Mis talleres</p>
              <div className="workshop-heading-title">
                <span className="module-section-icon" aria-hidden="true">
                  <HiOutlineBuildingStorefront size={23} />
                </span>
                <h3>{talleres.length} registrados</h3>
              </div>
            </div>
          </div>

          <div className="workshop-list">
            {talleres.map((taller) => {
              const servicios = taller.servicios
                ?.split(',')
                .map((servicio) => servicio.trim())
                .filter(Boolean)
                .slice(0, 3)

              return (
                <article key={taller.id} className="workshop-card">
                  <button className="workshop-card-main" type="button" onClick={() => seleccionarTaller(taller.id)}>
                    <LogoTaller taller={taller} />
                    <span className="workshop-card-copy">
                      <strong>{taller.nombre}</strong>
                      <small>
                        {taller.ciudad || taller.direccion || taller.telefono || taller.email || 'Sin datos adicionales'}
                      </small>
                    </span>
                  </button>

                  <div className="workshop-card-facts">
                    {taller.direccion ? (
                      <span>
                        <HiOutlineMapPin size={15} />
                        {taller.direccion}
                      </span>
                    ) : null}
                    {taller.horario ? (
                      <span>
                        <HiOutlineClock size={15} />
                        {taller.horario}
                      </span>
                    ) : null}
                    {taller.telefono || taller.whatsapp ? (
                      <span>
                        <HiOutlinePhone size={15} />
                        {taller.whatsapp || taller.telefono}
                      </span>
                    ) : null}
                    {taller.email ? (
                      <span>
                        <HiOutlineEnvelope size={15} />
                        {taller.email}
                      </span>
                    ) : null}
                  </div>

                  {servicios?.length ? (
                    <div className="workshop-service-pills">
                      {servicios.map((servicio) => (
                        <span key={servicio}>{servicio}</span>
                      ))}
                    </div>
                  ) : null}

                  <div className="workshop-card-actions">
                    <button className="secondary-button" type="button" onClick={() => seleccionarTaller(taller.id)}>
                      Usar taller
                    </button>
                    {puedeEditarTaller(taller.id) ? (
                      <>
                        <button className="icon-action-button" type="button" aria-label={`Editar ${taller.nombre}`} onClick={() => iniciarEdicion(taller)}>
                          <HiOutlinePencilSquare size={18} />
                        </button>
                      </>
                    ) : null}
                    {puedeDesactivarTaller(taller.id) ? (
                      <>
                        <button
                          type="button"
                          className="danger-icon-button"
                          aria-label={`Desactivar taller ${taller.nombre}`}
                          onClick={() => {
                            setTallerParaDesactivar(taller)
                            setConfirmacion('')
                          }}
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </>
                    ) : null}
                  </div>
                </article>
              )
            })}

            {talleres.length === 0 ? (
              <div className="empty-state module-empty-state grid place-items-center p-10 text-center text-xl font-semibold">
                <span className="module-empty-icon" aria-hidden="true">
                  <HiOutlineBuildingStorefront size={24} />
                </span>
                <p className="max-w-lg">Todavia no tienes talleres. Crea uno para empezar el inventario.</p>
              </div>
            ) : null}
          </div>
        </Panel>
      </div>

      {tallerParaDesactivar ? (
        <div className="modal-backdrop" role="presentation">
          <section className="delete-modal" role="dialog" aria-modal="true" aria-labelledby="desactivar-taller-titulo">
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <PiWarningDiamondBold size={24} />
              </div>
              <button type="button" className="modal-close-button" aria-label="Cerrar modal" onClick={cerrarModal}>
                <HiOutlineXMark size={20} />
              </button>
            </div>

            <h3 id="desactivar-taller-titulo">Desactivar taller</h3>
            <p>
              Esta accion desactivara el taller <strong>{tallerParaDesactivar.nombre}</strong>. Sus datos, inventario y
              movimientos quedaran conservados para historial. Para reactivarlo, contacta con un administrador.
            </p>

            <form
              className="delete-confirm-form"
              onSubmit={(event) => {
                event.preventDefault()
                void confirmarDesactivacion()
              }}
            >
              <label htmlFor="confirmar-desactivar-taller">
                Para confirmar, escribe <strong>"{tallerParaDesactivar.nombre}"</strong> en el campo de abajo.
              </label>
              <input
                id="confirmar-desactivar-taller"
                value={confirmacion}
                onChange={(event) => setConfirmacion(event.target.value)}
                autoFocus
                autoComplete="off"
              />
              <button className="danger-button" type="submit" disabled={!nombreConfirmado}>
                Desactivar este taller
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  )
}
