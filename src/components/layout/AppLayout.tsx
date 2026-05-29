import { useEffect, useState, type ReactNode } from 'react'
import { LogOut, Menu, X } from 'lucide-react'
import type { MiembroTaller, Perfil, Taller, Vista } from '../../tipos/dominio'
import type { VistaNavegacion } from '../../tipos/navegacion'
import { obtenerRolLegible } from '../../modulos/talleres/permisos'
import { LogoRepubase } from '../ui/LogoRepubase'

const defaultUserAvatarSrc = `${import.meta.env.BASE_URL}default-user-avatar.svg`

export function AppLayout({
  children,
  perfil,
  usuarioEmail,
  rolActivo,
  talleres,
  tallerActivoId,
  tallerActivoNombre,
  vistaActual,
  vistasDisponibles,
  alertasCantidad,
  onCerrarSesion,
  onSeleccionarTaller,
  onSeleccionarVista,
}: {
  children: ReactNode
  perfil: Perfil | null
  usuarioEmail?: string
  rolActivo?: MiembroTaller['rol']
  talleres: Taller[]
  tallerActivoId: string
  tallerActivoNombre?: string
  vistaActual: Vista
  vistasDisponibles: VistaNavegacion[]
  alertasCantidad: number
  onCerrarSesion: () => Promise<void>
  onSeleccionarTaller: (id: string) => void
  onSeleccionarVista: (vista: Vista) => void
}) {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)

  useEffect(() => {
    if (!menuMovilAbierto) return

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuMovilAbierto(false)
    }

    window.addEventListener('keydown', cerrarConEscape)
    return () => window.removeEventListener('keydown', cerrarConEscape)
  }, [menuMovilAbierto])

  const seleccionarVistaMovil = (vista: Vista) => {
    onSeleccionarVista(vista)
    setMenuMovilAbierto(false)
  }

  const seleccionarTallerMovil = (id: string) => {
    onSeleccionarTaller(id)
    setMenuMovilAbierto(false)
  }

  const avatarUsuario = perfil?.avatar_url ? (
    <img className="sidebar-avatar" src={perfil.avatar_url} alt="" />
  ) : (
    <img className="sidebar-avatar sidebar-avatar-empty" src={defaultUserAvatarSrc} alt="" />
  )
  const rolActivoTexto = rolActivo ? obtenerRolLegible(rolActivo) : 'sin rol activo'

  return (
    <div className="app-shell">
      <header className="mobile-topbar lg:hidden">
        <button
          type="button"
          className="mobile-icon-button"
          aria-label="Abrir menu de navegacion"
          aria-controls="mobile-drawer"
          aria-expanded={menuMovilAbierto}
          onClick={() => setMenuMovilAbierto(true)}
        >
          <Menu size={22} />
        </button>

        <LogoRepubase />

        <button
          type="button"
          className="mobile-avatar-button"
          aria-label="Ir a mi perfil"
          onClick={() => onSeleccionarVista('perfil')}
        >
          {avatarUsuario}
        </button>
      </header>

      <div className={`mobile-drawer-layer lg:hidden ${menuMovilAbierto ? 'mobile-drawer-layer-open' : ''}`}>
        <button
          type="button"
          className="mobile-drawer-overlay"
          aria-label="Cerrar menu"
          onClick={() => setMenuMovilAbierto(false)}
        />

        <aside
          id="mobile-drawer"
          className="mobile-drawer"
          aria-hidden={!menuMovilAbierto}
        >
          <div className="mobile-drawer-header">
            <LogoRepubase />
            <button
              type="button"
              className="mobile-icon-button"
              aria-label="Cerrar menu de navegacion"
              onClick={() => setMenuMovilAbierto(false)}
            >
              <X size={21} />
            </button>
          </div>

          <SelectorTaller talleres={talleres} tallerActivoId={tallerActivoId} onChange={seleccionarTallerMovil} />

          <nav className="sidebar-nav mobile-drawer-nav" aria-label="Navegacion principal">
            {vistasDisponibles.filter(item => item.id !== 'perfil').map((item) => (
              <BotonVista
                key={item.id}
                item={item}
                activa={vistaActual === item.id}
                contador={item.id === 'alertas' ? alertasCantidad : 0}
                onClick={() => seleccionarVistaMovil(item.id)}
              />
            ))}
          </nav>

          <div className="mobile-drawer-user">
            <button type="button" className="sidebar-user-row sidebar-user-button text-left w-full" onClick={() => seleccionarVistaMovil('perfil')}>
              {avatarUsuario}
              <span className="min-w-0">
                <span className="block truncate">{perfil?.nombre ?? usuarioEmail ?? 'Usuario'}</span>
                <span className="block truncate text-sm font-bold text-[var(--tinta-suave)]">{usuarioEmail}</span>
              </span>
            </button>
            <p className="label-caps mt-3">{rolActivoTexto}</p>
            <button
              type="button"
              className="sidebar-logout"
              onClick={() => {
                setMenuMovilAbierto(false)
                void onCerrarSesion()
              }}
            >
              <LogOut size={17} />
              Salir
            </button>
          </div>
        </aside>
      </div>

      <aside className="app-sidebar fixed inset-y-0 left-0 hidden w-[325px] flex-col lg:flex">
        <div className="sidebar-brand">
          <LogoRepubase />
          <p className="sidebar-subtitle">Gestión de inventario</p>
        </div>

        <SelectorTaller talleres={talleres} tallerActivoId={tallerActivoId} onChange={onSeleccionarTaller} />

        <nav className="sidebar-nav">
          {vistasDisponibles.filter(item => item.id !== 'perfil').map((item) => (
            <BotonVista
              key={item.id}
              item={item}
              activa={vistaActual === item.id}
              contador={item.id === 'alertas' ? alertasCantidad : 0}
              onClick={() => onSeleccionarVista(item.id)}
            />
          ))}
        </nav>

        <div className="sidebar-user">
          <p className="label-caps mb-5">{rolActivoTexto}</p>
          <button type="button" className="sidebar-user-row sidebar-user-button" onClick={() => onSeleccionarVista('perfil')}>
            {avatarUsuario}
            <p className="truncate">{perfil?.nombre ?? usuarioEmail}</p>
          </button>
          <button
            type="button"
            className="sidebar-logout"
            onClick={() => void onCerrarSesion()}
          >
            <LogOut size={17} />
            Salir
          </button>
        </div>
      </aside>

      <main className="app-main lg:pl-[325px]">
        <header className="app-header px-5 pb-8 pt-12 lg:px-[60px] lg:pb-10 lg:pt-16">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xl font-extrabold text-[var(--verde-profundo)]">
                {vistaActual === 'perfil' ? 'Cuenta personal' : tallerActivoNombre ?? 'Configura un taller'}
              </p>
              <h2 className="display-title">{tituloVista(vistaActual)}</h2>
            </div>
            {/* mobile-view-tabs eliminados para evitar duplicidad */}
          </div>
        </header>

        <section className="app-content surface-grid px-5 pb-14 lg:px-[60px]">
          {children}
        </section>
      </main>
    </div>
  )
}

function SelectorTaller({
  talleres,
  tallerActivoId,
  onChange,
}: {
  talleres: Taller[]
  tallerActivoId: string
  onChange: (id: string) => void
}) {
  return (
    <div className="sidebar-selector">
      <label className="label-caps mb-3 block">
        Taller activo
      </label>
      <select
        className="control bg-white text-base font-semibold shadow-sm"
        value={tallerActivoId}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Sin taller</option>
        {talleres.map((taller) => (
          <option key={taller.id} value={taller.id}>
            {taller.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}

function BotonVista({
  item,
  activa,
  contador,
  onClick,
}: {
  item: VistaNavegacion
  activa: boolean
  contador: number
  onClick: () => void
}) {
  const Icono = item.icono

  return (
    <button
      type="button"
      className={`nav-button ${activa ? 'nav-button-active' : ''}`}
      onClick={onClick}
    >
      <span className="flex items-center gap-3">
        <Icono size={18} />
        {item.etiqueta}
      </span>
      {contador > 0 ? (
        <span className="rounded-full bg-[var(--verde-claro)] px-2.5 py-1 text-xs font-extrabold text-[var(--verde-profundo)]">{contador}</span>
      ) : null}
    </button>
  )
}

function tituloVista(vista: Vista) {
  const titulos: Record<Vista, string> = {
    dashboard: 'Dashboard operativo',
    inventario: 'Inventario de repuestos',
    movimientos: 'Movimientos de stock',
    alertas: 'Alertas de stock parado',
    usuarios: 'Usuarios del taller',
    talleres: 'Talleres',
    perfil: 'Perfil',
  }

  return titulos[vista]
}
