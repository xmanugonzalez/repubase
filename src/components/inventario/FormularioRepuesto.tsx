import { Camera, ChevronDown, PackagePlus, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { EstadoRepuesto, Repuesto } from '../../tipos/dominio'
import type { RepuestoFormulario } from '../../tipos/formularios'
import { categoriasPorGrupo, obtenerCategoriaRepuesto } from '../../modulos/inventario/categoriasRepuestos'
import { Input } from '../ui/Input'

const estados: { valor: EstadoRepuesto; etiqueta: string; ayuda: string }[] = [
  { valor: 'disponible', etiqueta: 'Disponible', ayuda: 'Listo para usar o vender' },
  { valor: 'reservado', etiqueta: 'Reservado', ayuda: 'Apartado para un trabajo' },
  { valor: 'usado', etiqueta: 'Usado', ayuda: 'Recuperado o de segunda mano' },
  { valor: 'descartado', etiqueta: 'Descartado', ayuda: 'No usar en trabajos' },
]

export function FormularioRepuesto({
  formRepuesto,
  setFormRepuesto,
  repuestoEditando,
  guardarRepuesto,
  cancelarEdicion,
}: {
  formRepuesto: RepuestoFormulario
  setFormRepuesto: (value: RepuestoFormulario) => void
  repuestoEditando: Repuesto | null
  guardarRepuesto: (mantenerCargaRapida?: boolean) => Promise<void>
  cancelarEdicion: () => void
}) {
  const [busquedaCategoria, setBusquedaCategoria] = useState('')
  const categoriaActual = obtenerCategoriaRepuesto(formRepuesto.categoria)
  const textoBusqueda = busquedaCategoria.trim().toLowerCase()
  const gruposFiltrados = useMemo(
    () =>
      Object.entries(categoriasPorGrupo)
        .map(([grupo, categorias]) => ({
          grupo,
          categorias: categorias.filter((categoria) => categoria.nombre.toLowerCase().includes(textoBusqueda)),
        }))
        .filter(({ categorias }) => categorias.length > 0),
    [textoBusqueda],
  )
  const categoriaExacta = Object.values(categoriasPorGrupo)
    .flat()
    .some((categoria) => categoria.nombre.toLowerCase() === textoBusqueda)

  const seleccionarCategoria = (categoria: string) => {
    setFormRepuesto({ ...formRepuesto, categoria })
    setBusquedaCategoria('')
  }

  const actualizarAtributo = (clave: string, valor: string) => {
    setFormRepuesto({
      ...formRepuesto,
      atributos: {
        ...formRepuesto.atributos,
        [clave]: valor,
      },
    })
  }

  return (
    <div className="inventory-form">
      <div className="inventory-form-hero">
        <div>
          <p className="label-caps">Carga guiada</p>
          <h3 className="headline-title">{repuestoEditando ? 'Editar repuesto' : 'Nuevo repuesto'}</h3>
          <p>
            Carga lo minimo ahora y completa los detalles cuando los tengas. Repubase adapta los campos segun la pieza.
          </p>
        </div>
        <span className="inventory-form-hero-icon">
          <PackagePlus size={28} />
        </span>
      </div>

      <section className="inventory-form-section">
        <div className="inventory-section-heading">
          <span>1</span>
          <div>
            <h4>Datos basicos</h4>
            <p>Con esto ya podes guardar el repuesto.</p>
          </div>
        </div>

        <div className="grid gap-4">
          <Input
            value={formRepuesto.nombre}
            onChange={(nombre) => setFormRepuesto({ ...formRepuesto, nombre })}
            label="Nombre del repuesto"
            placeholder="Ej: Aceite 10W-40, Faro delantero derecho"
          />

          <label className="block">
            <span className="field-label">Categoria</span>
            <div className="control flex items-center gap-3 px-4 py-2">
              <Search size={18} className="text-[var(--verde-taller)]" />
              <input
                className="w-full bg-transparent font-semibold outline-none"
                value={busquedaCategoria}
                onChange={(event) => setBusquedaCategoria(event.target.value)}
                placeholder={formRepuesto.categoria || 'Buscar categoria'}
              />
            </div>
          </label>

          {textoBusqueda && !categoriaExacta ? (
            <button className="category-custom-button" onClick={() => seleccionarCategoria(busquedaCategoria.trim())}>
              Usar "{busquedaCategoria.trim()}"
            </button>
          ) : null}

          <div className="category-groups">
            {gruposFiltrados.map(({ grupo, categorias }) => (
              <div key={grupo} className="category-group">
                <p>{grupo}</p>
                <div className="category-chip-row">
                  {categorias.map((categoria) => (
                    <button
                      key={categoria.nombre}
                      className={formRepuesto.categoria === categoria.nombre ? 'category-chip category-chip-active' : 'category-chip'}
                      onClick={() => seleccionarCategoria(categoria.nombre)}
                    >
                      {categoria.nombre}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="inventory-state-grid">
            {estados.map((estado) => (
              <button
                key={estado.valor}
                className={formRepuesto.estado === estado.valor ? 'state-option state-option-active' : 'state-option'}
                onClick={() => setFormRepuesto({ ...formRepuesto, estado: estado.valor })}
              >
                <strong>{estado.etiqueta}</strong>
                <span>{estado.ayuda}</span>
              </button>
            ))}
          </div>

          <Input
            value={formRepuesto.stockInicial}
            onChange={(stockInicial) => setFormRepuesto({ ...formRepuesto, stockInicial })}
            label="Stock inicial"
            type="number"
            disabled={Boolean(repuestoEditando)}
          />

          <label className="photo-dropzone">
            {formRepuesto.fotoUrl ? <img src={formRepuesto.fotoUrl} alt="" /> : <Camera size={24} />}
            <span>{formRepuesto.fotoArchivo?.name || (formRepuesto.fotoUrl ? 'Cambiar foto' : 'Agregar foto')}</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(event) => setFormRepuesto({ ...formRepuesto, fotoArchivo: event.target.files?.[0] ?? null })}
            />
          </label>
        </div>
      </section>

      <section className="inventory-form-section inventory-dynamic-section">
        <div className="inventory-section-heading">
          <span>
            <Sparkles size={18} />
          </span>
          <div>
            <h4>Detalles para {formRepuesto.categoria || 'la categoria'}</h4>
            <p>{categoriaActual.ayuda}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {categoriaActual.atributos.map((atributo) => (
            <Input
              key={atributo.clave}
              value={formRepuesto.atributos[atributo.clave] ?? ''}
              onChange={(valor) => actualizarAtributo(atributo.clave, valor)}
              label={atributo.etiqueta}
              placeholder={atributo.placeholder}
            />
          ))}
        </div>
      </section>

      <details className="inventory-details">
        <summary>
          <span>Datos opcionales</span>
          <ChevronDown size={18} />
        </summary>
        <div className="grid gap-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={formRepuesto.precio} onChange={(precio) => setFormRepuesto({ ...formRepuesto, precio })} label="Precio" type="number" />
            <Input value={formRepuesto.ubicacion} onChange={(ubicacion) => setFormRepuesto({ ...formRepuesto, ubicacion })} label="Ubicacion" />
          </div>
          <Input
            value={formRepuesto.descripcion}
            onChange={(descripcion) => setFormRepuesto({ ...formRepuesto, descripcion })}
            label="Descripcion"
          />
        </div>
      </details>

      <details className="inventory-details">
        <summary>
          <span>Avanzado</span>
          <ChevronDown size={18} />
        </summary>
        <div className="grid gap-4 pt-4">
          <Input
            value={formRepuesto.codigo}
            onChange={(codigo) => setFormRepuesto({ ...formRepuesto, codigo })}
            label="Codigo interno"
            placeholder="Opcional"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input value={formRepuesto.marca} onChange={(marca) => setFormRepuesto({ ...formRepuesto, marca })} label="Marca" />
            <Input value={formRepuesto.modelo} onChange={(modelo) => setFormRepuesto({ ...formRepuesto, modelo })} label="Modelo" />
          </div>
          <Input value={formRepuesto.anio} onChange={(anio) => setFormRepuesto({ ...formRepuesto, anio })} label="Año" type="number" />
        </div>
      </details>

      <div className="inventory-actions">
        <button className="primary-button" onClick={() => void guardarRepuesto()}>
          {repuestoEditando ? 'Guardar cambios' : 'Guardar repuesto'}
        </button>
        {!repuestoEditando ? (
          <button className="secondary-button" onClick={() => void guardarRepuesto(true)}>
            Guardar y cargar otro
          </button>
        ) : null}
        {repuestoEditando ? (
          <button className="secondary-button" onClick={cancelarEdicion}>
            Cancelar
          </button>
        ) : null}
      </div>
    </div>
  )
}
