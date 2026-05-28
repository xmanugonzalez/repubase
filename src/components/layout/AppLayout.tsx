import type { ReactNode } from 'react'
import { LogOut, UserRound } from 'lucide-react'
import type { MiembroTaller, Perfil, Taller, Vista } from '../../tipos/dominio'
import type { VistaNavegacion } from '../../tipos/navegacion'
import { LogoRepubase } from '../ui/LogoRepubase'

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
  return (
    <div className="app-shell">
      <aside className="app-sidebar fixed inset-y-0 left-0 hidden w-[325px] flex-col lg:flex">
        <div className="sidebar-brand">
          <LogoRepubase />
          <p className="sidebar-subtitle">Gestión de inventario</p>
        </div>

        <SelectorTaller talleres={talleres} tallerActivoId={tallerActivoId} onChange={onSeleccionarTaller} />

        <nav className="sidebar-nav">
          {vistasDisponibles.map((item) => (
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
          <p className="label-caps mb-5">{rolActivo ?? 'sin rol activo'}</p>
          <button type="button" className="sidebar-user-row sidebar-user-button" onClick={() => onSeleccionarVista('perfil')}>
            {perfil?.avatar_url ? (
              <img className="sidebar-avatar" src={perfil.avatar_url} alt="" />
            ) : (
              <span className="sidebar-avatar sidebar-avatar-empty">
                <UserRound size={15} />
              </span>
            )}
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
            <div className="flex flex-wrap gap-2 lg:hidden">
              {vistasDisponibles.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                    vistaActual === item.id
                      ? 'bg-[var(--verde-taller)] text-white'
                      : 'bg-white text-[var(--verde-profundo)] shadow-sm'
                  }`}
                  onClick={() => onSeleccionarVista(item.id)}
                >
                  {item.etiqueta}
                </button>
              ))}
            </div>
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
