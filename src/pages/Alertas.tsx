import {
  HiOutlineBellAlert,
  HiOutlineCheckCircle,
} from 'react-icons/hi2'
import { formatearGs } from '../lib/fechas'
import type { AlertaStockParado } from '../tipos/dominio'
import { Panel } from '../components/ui/Panel'

export function Alertas({ alertas }: { alertas: AlertaStockParado[] }) {
  return (
    <Panel
      titulo="Repuestos con stock parado"
      icon={
        <div className="module-section-icon" aria-hidden="true">
          <HiOutlineBellAlert size={23} />
        </div>
      }
    >
      {alertas.length === 0 ? (
        <div className="empty-state module-empty-state grid min-h-[18rem] place-items-center p-10 text-center">
          <span className="module-empty-icon" aria-hidden="true">
            <HiOutlineCheckCircle size={24} />
          </span>
          <p className="section-copy">No hay repuestos con stock mayor a 0 y mas de 90 dias sin movimiento.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {alertas.map((alerta) => (
            <article key={alerta.id} className="panel-soft p-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-extrabold text-[var(--verde-profundo)]">
                    {alerta.codigo ? `${alerta.codigo} - ` : ''}{alerta.nombre}
                  </p>
                  <p className="text-sm font-semibold text-[var(--tinta-suave)]">
                    {[alerta.marca, alerta.modelo].filter(Boolean).join(' ') || alerta.categoria} - stock {alerta.stock} - valor {formatearGs(alerta.precio * alerta.stock)}
                  </p>
                </div>
                <span className="status-pill bg-white">
                  {alerta.dias_sin_movimiento} dias sin movimiento
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </Panel>
  )
}
