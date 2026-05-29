import {
  HiOutlineArchiveBox,
  HiOutlineBellAlert,
  HiOutlineChartBarSquare,
  HiOutlineClipboardDocumentList,
  HiOutlineCube,
  HiOutlineCurrencyDollar,
} from 'react-icons/hi2'
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
  const tieneMovimientos = movimientos.length > 0
  const promedioStock = cantidadRepuestos > 0 ? Math.round(stockTotal / cantidadRepuestos) : 0
  const estadoAlertas = alertasActivas === 0 ? 'Al dia' : 'Revisar'

  return (
    <div className="surface-grid">
      <div className="dashboard-metric-grid">
        <article className="metric-card dashboard-primary-metric">
          <div className="metric-card-top">
            <span className="metric-icon">
              <HiOutlineArchiveBox size={26} />
            </span>
            <span className="metric-chip">Inventario</span>
          </div>
          <div>
            <p className="metric-label">Repuestos cargados</p>
            <strong className="metric-value block">{cantidadRepuestos}</strong>
          </div>
          <div className="dashboard-primary-facts">
            <span>
              <HiOutlineCube size={18} />
              Stock total: {stockTotal}
            </span>
            <span>
              <HiOutlineCurrencyDollar size={18} />
              Valor: {formatearGs(valorInventario)}
            </span>
          </div>
        </article>

        <article className="metric-card dashboard-small-metric">
          <div className="metric-card-top">
            <span className="metric-icon">
              <HiOutlineClipboardDocumentList size={24} />
            </span>
          </div>
          <p className="metric-label">Movimientos</p>
          <strong>{movimientos.length}</strong>
          <span>{tieneMovimientos ? 'Actividad reciente registrada' : 'Sin actividad todavia'}</span>
        </article>

        <article className="metric-card dashboard-small-metric">
          <div className="metric-card-top">
            <span className="metric-icon">
              <HiOutlineBellAlert size={24} />
            </span>
            <span className={alertasActivas === 0 ? 'metric-chip metric-chip-ok' : 'metric-chip metric-chip-alert'}>
              {estadoAlertas}
            </span>
          </div>
          <p className="metric-label">Alertas</p>
          <strong>{alertasActivas}</strong>
          <span>{alertasActivas === 0 ? 'No hay urgencias activas' : 'Repuestos requieren revision'}</span>
        </article>

        <article className="metric-card dashboard-small-metric">
          <div className="metric-card-top">
            <span className="metric-icon">
              <HiOutlineChartBarSquare size={24} />
            </span>
          </div>
          <p className="metric-label">Promedio</p>
          <strong>{promedioStock}</strong>
          <span>Unidades por repuesto</span>
        </article>
      </div>

      <Panel
        titulo="Actividad reciente"
        icon={
          <div className="module-section-icon" aria-hidden="true">
            <HiOutlineClipboardDocumentList size={23} />
          </div>
        }
      >
        <TablaMovimientos movimientos={movimientos} />
      </Panel>
    </div>
  )
}
