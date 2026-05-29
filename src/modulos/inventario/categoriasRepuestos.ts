export type AtributoCategoriaRepuesto = {
  clave: string
  etiqueta: string
  placeholder: string
}

export type CategoriaRepuesto = {
  nombre: string
  grupo: string
  ayuda: string
  atributos: AtributoCategoriaRepuesto[]
}

export const categoriasRepuestos: CategoriaRepuesto[] = [
  {
    nombre: 'Aceites y lubricantes',
    grupo: 'Fluidos',
    ayuda: 'Ideal para aceites de motor, caja, direccion, grasa y lubricantes generales.',
    atributos: [
      { clave: 'viscosidad', etiqueta: 'Viscosidad', placeholder: '10W-40, 5W-30' },
      { clave: 'litros', etiqueta: 'Litros', placeholder: '1L, 4L, 20L' },
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Mineral, sintetico, hidraulico' },
      { clave: 'norma', etiqueta: 'Norma', placeholder: 'API SN, DOT 4' },
    ],
  },
  {
    nombre: 'Filtros',
    grupo: 'Mantenimiento',
    ayuda: 'Usa esta categoria para filtros de aceite, aire, combustible o cabina.',
    atributos: [
      { clave: 'tipo_filtro', etiqueta: 'Tipo de filtro', placeholder: 'Aceite, aire, combustible' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'Alto, diametro o rosca' },
      { clave: 'codigo_equivalente', etiqueta: 'Codigo equivalente', placeholder: 'Referencia alternativa' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Toyota Hilux 2018' },
    ],
  },
  {
    nombre: 'Frenos',
    grupo: 'Tren y seguridad',
    ayuda: 'Para pastillas, discos, campanas, zapatas y liquidos relacionados al freno.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Pastilla, disco, zapata' },
      { clave: 'eje', etiqueta: 'Eje', placeholder: 'Delantero, trasero' },
      { clave: 'lado', etiqueta: 'Lado', placeholder: 'Izquierdo, derecho, par' },
      { clave: 'material', etiqueta: 'Material', placeholder: 'Ceramico, metalico' },
    ],
  },
  {
    nombre: 'Suspension',
    grupo: 'Tren y seguridad',
    ayuda: 'Para amortiguadores, espirales, parrillas, bieletas y componentes de suspension.',
    atributos: [
      { clave: 'posicion', etiqueta: 'Posicion', placeholder: 'Delantero, trasero' },
      { clave: 'lado', etiqueta: 'Lado', placeholder: 'Izquierdo, derecho' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'Largo, diametro o referencia' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca, modelo o linea' },
    ],
  },
  {
    nombre: 'Direccion',
    grupo: 'Tren y seguridad',
    ayuda: 'Para extremos, rotulas, cremalleras, bombas y piezas de direccion.',
    atributos: [
      { clave: 'lado', etiqueta: 'Lado', placeholder: 'Izquierdo, derecho' },
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Extremo, rotula, bomba' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'Rosca, largo o referencia' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
    ],
  },
  {
    nombre: 'Motor',
    grupo: 'Mecanica',
    ayuda: 'Para sensores, juntas, soportes, bombas, tapas y piezas internas o externas del motor.',
    atributos: [
      { clave: 'tipo_pieza', etiqueta: 'Tipo de pieza', placeholder: 'Junta, bomba, soporte' },
      { clave: 'cilindrada', etiqueta: 'Cilindrada compatible', placeholder: '1.6, 2.0, 2.8' },
      { clave: 'codigo_equivalente', etiqueta: 'Codigo equivalente', placeholder: 'OEM o alternativo' },
      { clave: 'observacion', etiqueta: 'Observacion', placeholder: 'Detalle importante' },
    ],
  },
  {
    nombre: 'Transmision y embrague',
    grupo: 'Mecanica',
    ayuda: 'Para kits de embrague, rulemanes, cajas, homocineticas y piezas de transmision.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Kit, disco, placa, ruleman' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'Diametro, dientes o estrias' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
      { clave: 'codigo_equivalente', etiqueta: 'Codigo equivalente', placeholder: 'Referencia alternativa' },
    ],
  },
  {
    nombre: 'Sistema electrico',
    grupo: 'Electrico',
    ayuda: 'Para alternadores, arranques, relay, fusibles, modulos y conectores.',
    atributos: [
      { clave: 'voltaje', etiqueta: 'Voltaje', placeholder: '12V, 24V' },
      { clave: 'amperaje', etiqueta: 'Amperaje', placeholder: '60A, 90A' },
      { clave: 'conector', etiqueta: 'Conector', placeholder: '2 pines, 4 pines' },
      { clave: 'compatibilidad', etiqueta: 'Compatibilidad', placeholder: 'Vehiculo o sistema' },
    ],
  },
  {
    nombre: 'Baterias',
    grupo: 'Electrico',
    ayuda: 'Para baterias de auto, camioneta, moto o equipos del taller.',
    atributos: [
      { clave: 'amperaje', etiqueta: 'Amperaje', placeholder: '45Ah, 75Ah' },
      { clave: 'voltaje', etiqueta: 'Voltaje', placeholder: '12V' },
      { clave: 'borne', etiqueta: 'Borne', placeholder: 'Positivo derecho, izquierdo' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'Largo x ancho x alto' },
    ],
  },
  {
    nombre: 'Luces y faros',
    grupo: 'Carroceria',
    ayuda: 'Para faros, focos, farolines, opticas, guiños y luces auxiliares.',
    atributos: [
      { clave: 'posicion', etiqueta: 'Posicion', placeholder: 'Delantero, trasero' },
      { clave: 'lado', etiqueta: 'Lado', placeholder: 'Izquierdo, derecho' },
      { clave: 'tipo_lampara', etiqueta: 'Tipo de lampara', placeholder: 'H4, H7, LED' },
      { clave: 'color', etiqueta: 'Color', placeholder: 'Blanco, ambar, rojo' },
    ],
  },
  {
    nombre: 'Carroceria',
    grupo: 'Carroceria',
    ayuda: 'Para paragolpes, guardabarros, puertas, capot, parrillas y molduras.',
    atributos: [
      { clave: 'lado', etiqueta: 'Lado', placeholder: 'Izquierdo, derecho' },
      { clave: 'posicion', etiqueta: 'Posicion', placeholder: 'Delantero, trasero' },
      { clave: 'color', etiqueta: 'Color', placeholder: 'Negro, plata, imprimado' },
      { clave: 'material', etiqueta: 'Material', placeholder: 'Plastico, chapa, fibra' },
    ],
  },
  {
    nombre: 'Neumaticos',
    grupo: 'Ruedas',
    ayuda: 'Para cubiertas nuevas, usadas, de auxilio o por medida.',
    atributos: [
      { clave: 'medida', etiqueta: 'Medida', placeholder: '195/55 R15' },
      { clave: 'rin', etiqueta: 'Rin', placeholder: 'R15, R16' },
      { clave: 'indice_carga', etiqueta: 'Indice de carga', placeholder: '91V, 102H' },
      { clave: 'estado_neumatico', etiqueta: 'Estado', placeholder: 'Nuevo, usado, recapado' },
    ],
  },
  {
    nombre: 'Llantas',
    grupo: 'Ruedas',
    ayuda: 'Para llantas de chapa, aleacion, originales o alternativas.',
    atributos: [
      { clave: 'medida', etiqueta: 'Medida', placeholder: '15, 16, 17' },
      { clave: 'rin', etiqueta: 'Rin', placeholder: 'R15, R16' },
      { clave: 'agujeros', etiqueta: 'Agujeros', placeholder: '4x100, 5x114' },
      { clave: 'material', etiqueta: 'Material', placeholder: 'Chapa, aleacion' },
    ],
  },
  {
    nombre: 'Escape',
    grupo: 'Mecanica',
    ayuda: 'Para silenciadores, catalizadores, tramos, flexibles y abrazaderas.',
    atributos: [
      { clave: 'tramo', etiqueta: 'Tramo', placeholder: 'Delantero, medio, final' },
      { clave: 'diametro', etiqueta: 'Diametro', placeholder: '2 pulgadas, 55 mm' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
      { clave: 'material', etiqueta: 'Material', placeholder: 'Acero, inoxidable' },
    ],
  },
  {
    nombre: 'Refrigeracion',
    grupo: 'Fluidos',
    ayuda: 'Para radiadores, electroventiladores, termostatos, agua y refrigerantes.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Radiador, termostato, refrigerante' },
      { clave: 'capacidad', etiqueta: 'Capacidad', placeholder: '1L, 5L, 30L' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'Alto x ancho o diametro' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
    ],
  },
  {
    nombre: 'Aire acondicionado',
    grupo: 'Climatizacion',
    ayuda: 'Para compresores, filtros, valvulas, gas y piezas del sistema de aire.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Compresor, valvula, filtro' },
      { clave: 'gas_compatible', etiqueta: 'Gas compatible', placeholder: 'R134a, R1234yf' },
      { clave: 'conector', etiqueta: 'Conector', placeholder: 'Tipo o cantidad de pines' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
    ],
  },
  {
    nombre: 'Combustible',
    grupo: 'Mecanica',
    ayuda: 'Para bombas, inyectores, reguladores, filtros y piezas de combustible.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Bomba, inyector, regulador' },
      { clave: 'presion_caudal', etiqueta: 'Presion/caudal', placeholder: '3 bar, 90 l/h' },
      { clave: 'conector', etiqueta: 'Conector', placeholder: 'Cantidad de pines o ficha' },
      { clave: 'compatibilidad', etiqueta: 'Compatibilidad', placeholder: 'Nafta, diesel, flex' },
    ],
  },
  {
    nombre: 'Encendido',
    grupo: 'Electrico',
    ayuda: 'Para bujias, bobinas, cables, modulos y piezas de encendido.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Bujia, bobina, cable' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'Rosca, largo o rango termico' },
      { clave: 'codigo_equivalente', etiqueta: 'Codigo equivalente', placeholder: 'OEM o marca alternativa' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
    ],
  },
  {
    nombre: 'Sensores',
    grupo: 'Electrico',
    ayuda: 'Para sensores ABS, oxigeno, temperatura, posicion, presion y similares.',
    atributos: [
      { clave: 'tipo_sensor', etiqueta: 'Tipo de sensor', placeholder: 'ABS, oxigeno, temperatura' },
      { clave: 'conector', etiqueta: 'Conector', placeholder: '2 pines, 4 pines' },
      { clave: 'ubicacion_sensor', etiqueta: 'Ubicacion', placeholder: 'Rueda delantera, motor' },
      { clave: 'codigo_equivalente', etiqueta: 'Codigo equivalente', placeholder: 'Referencia OEM' },
    ],
  },
  {
    nombre: 'Correas y cadenas',
    grupo: 'Mantenimiento',
    ayuda: 'Para correas dentadas, poli-v, cadenas, tensores y kits.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Dentada, poli-v, cadena' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: '6PK1200, largo' },
      { clave: 'dientes', etiqueta: 'Dientes', placeholder: '123 dientes' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
    ],
  },
  {
    nombre: 'Mangueras',
    grupo: 'Mantenimiento',
    ayuda: 'Para mangueras de agua, combustible, aire, vacio o hidraulicas.',
    atributos: [
      { clave: 'diametro', etiqueta: 'Diametro', placeholder: '8 mm, 1/2' },
      { clave: 'largo', etiqueta: 'Largo', placeholder: '1 m, 50 cm' },
      { clave: 'material', etiqueta: 'Material', placeholder: 'Goma, silicona, hidraulica' },
      { clave: 'uso', etiqueta: 'Uso', placeholder: 'Agua, combustible, aire' },
    ],
  },
  {
    nombre: 'Rodamientos y retenes',
    grupo: 'Tren y seguridad',
    ayuda: 'Para rulemanes, rodamientos, retenes y sellos por medida.',
    atributos: [
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'Referencia o medida completa' },
      { clave: 'diametro_interno', etiqueta: 'Diametro interno', placeholder: '25 mm' },
      { clave: 'diametro_externo', etiqueta: 'Diametro externo', placeholder: '52 mm' },
      { clave: 'espesor', etiqueta: 'Espesor', placeholder: '15 mm' },
    ],
  },
  {
    nombre: 'Tornilleria y fijaciones',
    grupo: 'Insumos',
    ayuda: 'Para bulones, tuercas, arandelas, clips, grampas y fijaciones.',
    atributos: [
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'M8, M10' },
      { clave: 'rosca', etiqueta: 'Rosca', placeholder: '1.25, fina, gruesa' },
      { clave: 'largo', etiqueta: 'Largo', placeholder: '30 mm, 50 mm' },
      { clave: 'material', etiqueta: 'Material', placeholder: 'Acero, inoxidable' },
    ],
  },
  {
    nombre: 'Herramientas e insumos',
    grupo: 'Insumos',
    ayuda: 'Para herramientas, consumibles del taller y materiales de uso diario.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Herramienta, consumible' },
      { clave: 'presentacion', etiqueta: 'Presentacion', placeholder: 'Unidad, caja, rollo' },
      { clave: 'unidad', etiqueta: 'Unidad', placeholder: 'Unid., metro, litro' },
      { clave: 'uso', etiqueta: 'Uso', placeholder: 'Mecanica, pintura, limpieza' },
    ],
  },
  {
    nombre: 'Accesorios',
    grupo: 'General',
    ayuda: 'Para accesorios universales, esteticos o complementos del vehiculo.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Moldura, soporte, aplique' },
      { clave: 'color', etiqueta: 'Color', placeholder: 'Negro, cromado' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'Talle, largo o diametro' },
      { clave: 'compatibilidad', etiqueta: 'Compatibilidad', placeholder: 'Universal o vehiculo' },
    ],
  },
  {
    nombre: 'Interior',
    grupo: 'Carroceria',
    ayuda: 'Para manijas, tapizados, comandos, paneles, alfombras y piezas internas.',
    atributos: [
      { clave: 'lado', etiqueta: 'Lado', placeholder: 'Izquierdo, derecho' },
      { clave: 'color', etiqueta: 'Color', placeholder: 'Negro, gris, beige' },
      { clave: 'material', etiqueta: 'Material', placeholder: 'Tela, plastico, cuero' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
    ],
  },
  {
    nombre: 'Cristales y espejos',
    grupo: 'Carroceria',
    ayuda: 'Para parabrisas, lunetas, vidrios laterales, espejos y lunas.',
    atributos: [
      { clave: 'lado', etiqueta: 'Lado', placeholder: 'Izquierdo, derecho' },
      { clave: 'posicion', etiqueta: 'Posicion', placeholder: 'Delantero, trasero, lateral' },
      { clave: 'color_tinte', etiqueta: 'Color/tinte', placeholder: 'Claro, verde, polarizado' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
    ],
  },
  {
    nombre: 'Limpieza y detailing',
    grupo: 'Insumos',
    ayuda: 'Para shampoo, ceras, desengrasantes, paños y productos de limpieza.',
    atributos: [
      { clave: 'presentacion', etiqueta: 'Presentacion', placeholder: 'Botella, bidon, aerosol' },
      { clave: 'litros', etiqueta: 'Litros', placeholder: '500 ml, 1L, 5L' },
      { clave: 'uso', etiqueta: 'Uso', placeholder: 'Interior, motor, carroceria' },
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Shampoo, cera, desengrasante' },
    ],
  },
  {
    nombre: 'Pintura y quimicos',
    grupo: 'Insumos',
    ayuda: 'Para pinturas, solventes, masillas, primer, adhesivos y selladores.',
    atributos: [
      { clave: 'color_codigo', etiqueta: 'Color/codigo', placeholder: 'Blanco, 040, negro' },
      { clave: 'presentacion', etiqueta: 'Presentacion', placeholder: 'Aerosol, lata, pomo' },
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Primer, base, barniz' },
      { clave: 'aplicacion', etiqueta: 'Aplicacion', placeholder: 'Chapa, plastico, vidrio' },
    ],
  },
  {
    nombre: 'Seguridad',
    grupo: 'Tren y seguridad',
    ayuda: 'Para cinturones, airbags, balizas, matafuegos, trabas y seguridad vehicular.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Cinturon, airbag, matafuego' },
      { clave: 'posicion', etiqueta: 'Posicion', placeholder: 'Conductor, pasajero, trasero' },
      { clave: 'homologacion', etiqueta: 'Homologacion', placeholder: 'Norma o vencimiento' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
    ],
  },
  {
    nombre: 'Audio y multimedia',
    grupo: 'Electrico',
    ayuda: 'Para radios, parlantes, pantallas, camaras, antenas y accesorios multimedia.',
    atributos: [
      { clave: 'tipo', etiqueta: 'Tipo', placeholder: 'Radio, parlante, camara' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: '1 DIN, 6 pulgadas' },
      { clave: 'conector', etiqueta: 'Conector', placeholder: 'ISO, RCA, USB' },
      { clave: 'compatibilidad', etiqueta: 'Compatibilidad', placeholder: 'Universal o vehiculo' },
    ],
  },
  {
    nombre: 'Gomas y bujes',
    grupo: 'Tren y seguridad',
    ayuda: 'Para bujes, soportes de goma, tacos, cazoletas y piezas elasticas.',
    atributos: [
      { clave: 'posicion', etiqueta: 'Posicion', placeholder: 'Delantero, trasero, motor' },
      { clave: 'medida', etiqueta: 'Medida', placeholder: 'Diametro o referencia' },
      { clave: 'material', etiqueta: 'Material', placeholder: 'Goma, poliuretano' },
      { clave: 'vehiculo_compatible', etiqueta: 'Vehiculo compatible', placeholder: 'Marca y modelo' },
    ],
  },
  {
    nombre: 'Otros',
    grupo: 'General',
    ayuda: 'Para cualquier repuesto que no encaje todavia en otra categoria.',
    atributos: [
      { clave: 'marca', etiqueta: 'Marca', placeholder: 'Marca si se conoce' },
      { clave: 'modelo', etiqueta: 'Modelo', placeholder: 'Modelo o linea' },
      { clave: 'descripcion', etiqueta: 'Descripcion', placeholder: 'Detalle util para encontrarlo despues' },
      { clave: 'observacion', etiqueta: 'Observacion', placeholder: 'Estado, compatibilidad o nota' },
    ],
  },
]

export const categoriasPorGrupo = categoriasRepuestos.reduce<Record<string, CategoriaRepuesto[]>>((grupos, categoria) => {
  grupos[categoria.grupo] = [...(grupos[categoria.grupo] ?? []), categoria]
  return grupos
}, {})

export const obtenerCategoriaRepuesto = (nombre: string) =>
  categoriasRepuestos.find((categoria) => categoria.nombre === nombre) ?? categoriasRepuestos[categoriasRepuestos.length - 1]
