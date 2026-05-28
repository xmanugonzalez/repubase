import { Search } from 'lucide-react'
import type { EstadoRepuesto, Repuesto } from '../tipos/dominio'
import type { RepuestoFormulario } from '../tipos/formularios'
import { TablaRepuestos } from '../components/tablas/TablaRepuestos'
import { Input } from '../components/ui/Input'
import { Panel } from '../components/ui/Panel'

export function Inventario({
  repuestos,
  busqueda,
  setBusqueda,
  formRepuesto,
  setFormRepuesto,
  repuestoEditando,
  guardarRepuesto,
  editarRepuesto,
  eliminarRepuesto,
  esAdministrador,
  cancelarEdicion,
}: {
  repuestos: Repuesto[]
  busqueda: string
  setBusqueda: (value: string) => void
  formRepuesto: RepuestoFormulario
  setFormRepuesto: (value: RepuestoFormulario) => void
  repuestoEditando: Repuesto | null
  guardarRepuesto: () => Promise<void>
  editarRepuesto: (repuesto: Repuesto) => void
  eliminarRepuesto: (repuesto: Repuesto) => Promise<void>
  esAdministrador: boolean
  cancelarEdicion: () => void
}) {
  return (
    <div className="module-grid">
      {esAdministrador ? (
        <Panel titulo={repuestoEditando ? 'Editar repuesto' : 'Nuevo repuesto'}>
          <div className="grid gap-5">
            <Input value={formRepuesto.codigo} onChange={(codigo) => setFormRepuesto({ ...formRepuesto, codigo })} label="Codigo" />
            <Input value={formRepuesto.nombre} onChange={(nombre) => setFormRepuesto({ ...formRepuesto, nombre })} label="Nombre" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={formRepuesto.marca} onChange={(marca) => setFormRepuesto({ ...formRepuesto, marca })} label="Marca" />
              <Input value={formRepuesto.modelo} onChange={(modelo) => setFormRepuesto({ ...formRepuesto, modelo })} label="Modelo" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={formRepuesto.anio} onChange={(anio) => setFormRepuesto({ ...formRepuesto, anio })} label="Anio" type="number" />
              <Input value={formRepuesto.categoria} onChange={(categoria) => setFormRepuesto({ ...formRepuesto, categoria })} label="Categoria" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={formRepuesto.precio} onChange={(precio) => setFormRepuesto({ ...formRepuesto, precio })} label="Precio" type="number" />
              <Input
                value={formRepuesto.stockInicial}
                onChange={(stockInicial) => setFormRepuesto({ ...formRepuesto, stockInicial })}
                label="Stock inicial"
                type="number"
                disabled={Boolean(repuestoEditando)}
              />
            </div>
            <label className="block">
              <span className="field-label">Estado</span>
              <select
                className="control"
                value={formRepuesto.estado}
                onChange={(event) => setFormRepuesto({ ...formRepuesto, estado: event.target.value as EstadoRepuesto })}
              >
                <option value="disponible">Disponible</option>
                <option value="reservado">Reservado</option>
                <option value="usado">Usado</option>
                <option value="descartado">Descartado</option>
              </select>
            </label>
            <Input value={formRepuesto.ubicacion} onChange={(ubicacion) => setFormRepuesto({ ...formRepuesto, ubicacion })} label="Ubicacion" />
            <Input
              value={formRepuesto.descripcion}
              onChange={(descripcion) => setFormRepuesto({ ...formRepuesto, descripcion })}
              label="Descripcion"
            />
            <div className="flex flex-wrap gap-3 pt-2">
              <button className="primary-button" onClick={() => void guardarRepuesto()}>
                Guardar
              </button>
              {repuestoEditando ? (
                <button className="secondary-button" onClick={cancelarEdicion}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </div>
        </Panel>
      ) : (
        <Panel titulo="Inventario en consulta">
          <p className="section-copy">
            Tu rol permite consultar repuestos y registrar movimientos, pero no editar fichas de inventario.
          </p>
        </Panel>
      )}

      <Panel titulo="Listado de repuestos">
        <div className="control mb-6 flex items-center gap-3 px-4 py-2">
          <Search size={18} className="text-[var(--verde-taller)]" />
          <input
            className="w-full bg-transparent font-semibold outline-none"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por codigo, marca, modelo, categoria o estado"
          />
        </div>
        <TablaRepuestos
          repuestos={repuestos}
          esAdministrador={esAdministrador}
          editarRepuesto={editarRepuesto}
          eliminarRepuesto={eliminarRepuesto}
        />
      </Panel>
    </div>
  )
}
