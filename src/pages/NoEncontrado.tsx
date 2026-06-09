import { ArrowRight, Home, MapPinned, PackageSearch } from 'lucide-react'

export function NoEncontrado({
  ruta,
  tieneTallerActivo,
  onIrPrincipal,
  onIrTalleres,
}: {
  ruta: string
  tieneTallerActivo: boolean
  onIrPrincipal: () => void
  onIrTalleres: () => void
}) {
  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-panel">
        <div className="not-found-copy">
          <span className="not-found-kicker">Ruta no encontrada</span>
          <h2 id="not-found-title" className="headline-title">
            No encontramos esta ruta
          </h2>
          <p>
            La seccion puede haber cambiado o el enlace no pertenece a este taller. Volve a una vista segura para seguir
            trabajando con tu inventario.
          </p>

          <div className="not-found-route" aria-label="Ruta solicitada">
            <MapPinned size={18} />
            <span>{ruta}</span>
          </div>

          <div className="not-found-actions">
            <button className="primary-button" type="button" onClick={onIrPrincipal}>
              <Home size={20} />
              {tieneTallerActivo ? 'Ir al dashboard' : 'Ir a talleres'}
            </button>
            <button className="secondary-button" type="button" onClick={onIrTalleres}>
              Ver talleres
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className="not-found-visual" aria-hidden="true">
          <span className="not-found-code">404</span>
          <span className="not-found-icon">
            <PackageSearch size={42} />
          </span>
        </div>
      </div>
    </section>
  )
}
