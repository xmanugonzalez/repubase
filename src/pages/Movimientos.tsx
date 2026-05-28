import type { MovimientoStock, Repuesto, TipoMovimiento } from '../tipos/dominio'
import type { MovimientoFormulario } from '../tipos/formularios'
import { TablaMovimientos } from '../components/tablas/TablaMovimientos'
import { Input } from '../components/ui/Input'
import { Panel } from '../components/ui/Panel'

export function Movimientos({
  repuestos,
  movimientos,
  formMovimiento,
  setFormMovimiento,
  registrarMovimiento,
}: {
  repuestos: Repuesto[]
  movimientos: MovimientoStock[]
  formMovimiento: MovimientoFormulario
  setFormMovimiento: (value: MovimientoFormulario) => void
  registrarMovimiento: () => Promise<void>
}) {
  return (
    <div className="module-grid">
      <Panel titulo="Registrar movimiento">
        <div className="grid gap-5">
          <label>
            <span className="field-label">Repuesto</span>
            <select
              className="control"
              value={formMovimiento.repuestoId}
              onChange={(event) => setFormMovimiento({ ...formMovimiento, repuestoId: event.target.value })}
            >
              <option value="">Seleccionar</option>
              {repuestos.map((repuesto) => (
                <option key={repuesto.id} value={repuesto.id}>
                  {repuesto.codigo} - {repuesto.nombre} - stock {repuesto.stock}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="field-label">Tipo</span>
            <select
              className="control"
              value={formMovimiento.tipo}
              onChange={(event) => setFormMovimiento({ ...formMovimiento, tipo: event.target.value as TipoMovimiento })}
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </label>
          <Input value={formMovimiento.cantidad} onChange={(cantidad) => setFormMovimiento({ ...formMovimiento, cantidad })} label="Cantidad" type="number" />
          <Input value={formMovimiento.motivo} onChange={(motivo) => setFormMovimiento({ ...formMovimiento, motivo })} label="Motivo" />
          <button className="primary-button" onClick={() => void registrarMovimiento()}>
            Registrar movimiento
          </button>
        </div>
      </Panel>
      <Panel titulo="Historial reciente">
        <TablaMovimientos movimientos={movimientos} />
      </Panel>
    </div>
  )
}
