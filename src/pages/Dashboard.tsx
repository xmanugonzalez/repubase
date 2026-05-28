import { formatearGs } from '../lib/fechas'
import type { MovimientoStock } from '../tipos/dominio'
import { TablaMovimientos } from '../components/tablas/TablaMovimientos'
import { Panel } from '../components/ui/Panel'

export function Dashboard({
  valorInventario,
  cantidadRepuestos,
  stockTotal,
  alertasActivas,
  movimientos,
}: {
  valorInventario: number
  cantidadRepuestos: number
  stockTotal: number
  alertasActivas: number
  movimientos: MovimientoStock[]
}) {
  return (
    <div className="surface-grid">
      <div className="grid gap-8 md:grid-cols-3">
        <article className="metric-card md:col-span-1">
          <h3 className="headline-title mb-10">Inventario</h3>
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="font-bold text-[var(--verde-profundo)]">Total</p>
              <strong className="metric-value block">{cantidadRepuestos}</strong>
            </div>
            <div className="pb-4 text-right font-bold text-[var(--verde-profundo)]">
              <p>Stock total: {stockTotal}</p>
              <p>Valor: {formatearGs(valorInventario)}</p>
            </div>
          </div>
        </article>
        <article className="metric-card flex flex-col justify-center">
          <h3 className="headline-title mb-8">Movimientos recientes</h3>
          <p className="section-copy">
            {movimientos.length === 0
              ? 'Aun no hay movimientos registrados.'
              : `${movimientos.length} movimientos cargados recientemente.`}
          </p>
        </article>
        <article className="metric-card flex flex-col justify-center">
          <h3 className="headline-title mb-8">Alertas</h3>
          <p className="section-copy">
            {alertasActivas === 0 ? 'No tienes alertas activas.' : `${alertasActivas} repuestos requieren revision.`}
          </p>
        </article>
      </div>
      <Panel titulo="Actividad reciente">
        <TablaMovimientos movimientos={movimientos} />
      </Panel>
    </div>
  )
}
