import {
  HiOutlineArchiveBox,
  HiOutlineClipboardDocumentList,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2'
import type { Repuesto } from '../tipos/dominio'
import type { RepuestoFormulario } from '../tipos/formularios'
import { FormularioRepuesto } from '../components/inventario/FormularioRepuesto'
import { TablaRepuestos } from '../components/tablas/TablaRepuestos'
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
  guardarRepuesto: (mantenerCargaRapida?: boolean) => Promise<void>
  editarRepuesto: (repuesto: Repuesto) => void
  eliminarRepuesto: (repuesto: Repuesto) => Promise<void>
  esAdministrador: boolean
  cancelarEdicion: () => void
}) {
  return (
    <div className="module-grid inventory-module-grid">
      {esAdministrador ? (
        <Panel titulo="">
          <FormularioRepuesto
            formRepuesto={formRepuesto}
            setFormRepuesto={setFormRepuesto}
            repuestoEditando={repuestoEditando}
            guardarRepuesto={guardarRepuesto}
            cancelarEdicion={cancelarEdicion}
          />
        </Panel>
      ) : (
        <Panel
          titulo="Inventario en consulta"
          icon={
            <div className="module-section-icon" aria-hidden="true">
              <HiOutlineArchiveBox size={23} />
            </div>
          }
        >
          <p className="section-copy">
            Tu rol permite consultar repuestos, pero no editar fichas de inventario.
          </p>
        </Panel>
      )}

      <Panel
        titulo="Listado de repuestos"
        icon={
          <div className="module-section-icon" aria-hidden="true">
            <HiOutlineClipboardDocumentList size={23} />
          </div>
        }
      >
        <div className="control mb-6 flex items-center gap-3 px-4 py-2">
          <HiOutlineMagnifyingGlass size={18} className="text-[var(--verde-taller)]" />
          <input
            className="w-full bg-transparent font-semibold outline-none"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar por nombre, codigo, marca, modelo, categoria, estado o detalle"
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
