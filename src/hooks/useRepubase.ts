import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AlertTriangle, Boxes, Building2, LayoutDashboard, RefreshCw, UserRound, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { obtenerAlertasStockParado } from '../modulos/alertas/alertas'
import type { MiembroTaller, MovimientoStock, Perfil, Repuesto, RolTaller, Taller, TipoMovimiento, Vista } from '../tipos/dominio'
import type { MiembroFormulario, MovimientoFormulario, RepuestoFormulario, TallerFormulario } from '../tipos/formularios'
import { movimientoInicial, repuestoInicial } from '../tipos/formularios'
import type { VistaNavegacion } from '../tipos/navegacion'

const vistas: VistaNavegacion[] = [
  { id: 'dashboard', etiqueta: 'Dashboard', icono: LayoutDashboard },
  { id: 'inventario', etiqueta: 'Inventario', icono: Boxes },
  { id: 'movimientos', etiqueta: 'Movimientos', icono: RefreshCw },
  { id: 'alertas', etiqueta: 'Alertas', icono: AlertTriangle },
  { id: 'usuarios', etiqueta: 'Usuarios', icono: Users, requiereAdmin: true },
  { id: 'talleres', etiqueta: 'Talleres', icono: Building2 },
  { id: 'perfil', etiqueta: 'Perfil', icono: UserRound },
]

const DURACION_MENSAJE_MS = 4000
const AVATAR_BUCKET = 'avatares'
const AVATAR_TAMANIO_MAXIMO = 2 * 1024 * 1024
const AVATAR_TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const INVITACION_PENDIENTE_KEY = 'repubase:invitacion-pendiente'

const obtenerTextoMetadata = (valor: unknown) => (typeof valor === 'string' && valor.trim() ? valor.trim() : null)

const obtenerRedirectOAuth = () => {
  const url = new URL(import.meta.env.BASE_URL || '/', window.location.origin)
  url.search = ''
  url.hash = ''

  return url.toString()
}

const crearUrlInvitacion = (token: string) => {
  const url = new URL(import.meta.env.BASE_URL || '/', window.location.origin)
  url.search = ''
  url.hash = `/invitacion/${encodeURIComponent(token)}`

  return url.toString()
}

const obtenerMensajeErrorUsuario = (detalle: unknown) => {
  let mensajeOriginal = 'No se pudo completar'
  if (detalle instanceof Error) {
    mensajeOriginal = detalle.message
  } else if (typeof detalle === 'string') {
    mensajeOriginal = detalle
  } else if (detalle && typeof detalle === 'object' && 'message' in detalle) {
    mensajeOriginal = String((detalle as Record<string, unknown>).message)
  }
  const mensaje = mensajeOriginal.toLowerCase()

  if (mensaje.includes('invalid login credentials')) {
    return 'El correo o la contraseña no coinciden. Revisa los datos e intenta nuevamente.'
  }

  if (mensaje.includes('email not confirmed')) {
    return 'Tu correo todavía no está confirmado. Revisa tu bandeja de entrada antes de iniciar sesión.'
  }

  if (mensaje.includes('user already registered') || mensaje.includes('already registered')) {
    return 'Ya existe una cuenta con ese correo. Inicia sesión o usa otro correo para registrarte.'
  }

  if (mensaje.includes('invitacion invalida') || mensaje.includes('invitaciÃ³n invÃ¡lida')) {
    return 'El link de invitaciÃ³n ya no es vÃ¡lido. Pide al administrador que genere uno nuevo.'
  }

  if (mensaje.includes('password') && (mensaje.includes('weak') || mensaje.includes('at least'))) {
    return 'La contraseña no cumple con los requisitos mínimos. Usa una contraseña más segura.'
  }

  if (mensaje.includes('mime') || mensaje.includes('file size') || mensaje.includes('payload')) {
    return 'La imagen no cumple con el formato o tamaño permitido. Usa una foto JPG, PNG, WEBP o GIF de hasta 2 MB.'
  }

  if (mensaje.includes('duplicate key') || mensaje.includes('unique')) {
    return 'Ya existe un registro con esos datos. Revisa el código, correo o nombre antes de guardar.'
  }

  if (mensaje.includes('solo un administrador activo')) {
    return 'Solo un administrador activo del taller puede realizar esta acción.'
  }

  if (
    mensaje.includes('functions') ||
    mensaje.includes('edge function') ||
    mensaje.includes('non-2xx') ||
    mensaje.includes('eliminar-cuenta')
  ) {
    return 'No pudimos eliminar tu cuenta porque falta activar el servicio seguro de eliminación. Revisa que la función esté desplegada en Supabase e intenta nuevamente.'
  }

  if (
    mensaje.includes('row-level security') ||
    mensaje.includes('permission denied') ||
    mensaje.includes('policy') ||
    mensaje.includes('not authorized') ||
    mensaje.includes('eliminar_taller') ||
    mensaje.includes('function') ||
    mensaje.includes('rpc')
  ) {
    return 'No pudimos completar la acción porque tu usuario no tiene permisos suficientes o el taller requiere una configuración pendiente.'
  }

  if (mensaje.includes('foreign key') || mensaje.includes('restrict')) {
    return 'No se puede eliminar porque todavía existen datos asociados. Revisa los movimientos o registros vinculados.'
  }

  if (mensaje.includes('failed to fetch') || mensaje.includes('network') || mensaje.includes('fetch')) {
    return 'No pudimos conectar con el servicio. Revisa tu conexión e intenta nuevamente.'
  }

  return 'No pudimos completar la acción. Revisa los datos ingresados e intenta nuevamente.'
}

export function useRepubase(vistaInicial: Vista = 'dashboard', invitacionToken: string | null = null) {
  const [session, setSession] = useState<Session | null>(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [talleres, setTalleres] = useState<Taller[]>([])
  const [miembros, setMiembros] = useState<MiembroTaller[]>([])
  const [tallerActivoId, setTallerActivoId] = useState('')
  const [repuestos, setRepuestos] = useState<Repuesto[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([])
  const [vista, setVista] = useState<Vista>(vistaInicial)
  const [busqueda, setBusqueda] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [cargandoDatos, setCargandoDatos] = useState(false)
  const [formRepuesto, setFormRepuesto] = useState<RepuestoFormulario>(repuestoInicial)
  const [repuestoEditando, setRepuestoEditando] = useState<Repuesto | null>(null)
  const [formMovimiento, setFormMovimiento] = useState<MovimientoFormulario>(movimientoInicial)
  const [nuevoTaller, setNuevoTaller] = useState<TallerFormulario>({ nombre: '', direccion: '', telefono: '' })
  const [nuevoMiembro, setNuevoMiembro] = useState<MiembroFormulario>({
    email: '',
    rol: 'mecanico',
  })
  const [perfilNombre, setPerfilNombre] = useState('')
  const [subiendoAvatar, setSubiendoAvatar] = useState(false)
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false)
  const [rolInvitacionLink, setRolInvitacionLink] = useState<RolTaller>('mecanico')
  const [linkInvitacion, setLinkInvitacion] = useState('')
  const [generandoInvitacion, setGenerandoInvitacion] = useState(false)
  const [aceptandoInvitacion, setAceptandoInvitacion] = useState(false)

  const usuario = session?.user ?? null
  const usuarioId = usuario?.id ?? ''
  const tallerActivo = talleres.find((taller) => taller.id === tallerActivoId) ?? null
  const tieneTallerActivo = Boolean(tallerActivo)
  const membresiaActual = miembros.find(
    (miembro) =>
      miembro.taller_id === tallerActivoId &&
      miembro.estado === 'activo' &&
      (miembro.usuario_id === usuarioId || miembro.email === usuario?.email),
  )
  const esAdministrador = membresiaActual?.rol === 'administrador'
  const esAdministradorDeTaller = (tallerId: string) =>
    miembros.some(
      (miembro) =>
        miembro.taller_id === tallerId &&
        miembro.estado === 'activo' &&
        miembro.rol === 'administrador' &&
        (miembro.usuario_id === usuarioId || miembro.email === usuario?.email),
    )
  const alertas = useMemo(() => obtenerAlertasStockParado(repuestos), [repuestos])
  const vistaActual: Vista = vista === 'perfil' ? 'perfil' : tieneTallerActivo ? vista : 'talleres'
  const vistasDisponibles = useMemo(
    () =>
      vistas.filter((item) => {
        if (item.id === 'talleres') return true
        if (item.id === 'perfil') return true
        if (!tieneTallerActivo) return false
        return !item.requiereAdmin || esAdministrador
      }),
    [esAdministrador, tieneTallerActivo],
  )
  const repuestosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    if (!texto) return repuestos

    return repuestos.filter((repuesto) =>
      [repuesto.codigo, repuesto.nombre, repuesto.marca, repuesto.modelo, repuesto.categoria, repuesto.estado]
        .join(' ')
        .toLowerCase()
        .includes(texto),
    )
  }, [busqueda, repuestos])
  const valorInventario = repuestos.reduce((total, repuesto) => total + repuesto.precio * repuesto.stock, 0)
  const stockTotal = repuestos.reduce((total, repuesto) => total + repuesto.stock, 0)

  const limpiarDatos = () => {
    setPerfil(null)
    setTalleres([])
    setMiembros([])
    setTallerActivoId('')
    setRepuestos([])
    setMovimientos([])
  }

  const mostrarError = (detalle: unknown) => {
    const texto = obtenerMensajeErrorUsuario(detalle)
    setError(texto)
    setMensaje('')
  }

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto)
    setError('')
  }

  const actualizarPerfil = async (cambios: { nombre?: string | null; avatar_url?: string | null }) => {
    if (!usuario) return

    const { error: perfilError } = await supabase.from('perfiles').update(cambios).eq('id', usuario.id)

    if (perfilError) throw perfilError

    setPerfil((actual) => (actual ? { ...actual, ...cambios } : actual))
  }

  const cargarBase = async () => {
    if (!usuario) return

    setCargandoDatos(true)
    setError('')

    try {
      const email = usuario.email ?? ''
      const nombre =
        obtenerTextoMetadata(usuario.user_metadata.nombre) ??
        obtenerTextoMetadata(usuario.user_metadata.full_name) ??
        obtenerTextoMetadata(usuario.user_metadata.name) ??
        email.split('@')[0] ??
        null
      const avatarUrl =
        obtenerTextoMetadata(usuario.user_metadata.avatar_url) ??
        obtenerTextoMetadata(usuario.user_metadata.picture)

      await supabase.from('perfiles').upsert({
        id: usuario.id,
        email,
        nombre,
        avatar_url: avatarUrl,
      }, {
        onConflict: 'id',
        ignoreDuplicates: true,
      })

      const [{ data: perfilData, error: perfilError }, { data: propiaMembresiaData, error: propiaMembresiaError }] =
        await Promise.all([
          supabase.from('perfiles').select('*').eq('id', usuario.id).single(),
          supabase
            .from('miembros_taller')
            .select('*')
            .or(`usuario_id.eq.${usuario.id},email.eq.${email}`)
            .order('creado_en', { ascending: true }),
        ])

      if (perfilError) throw perfilError
      if (propiaMembresiaError) throw propiaMembresiaError

      setPerfil(perfilData)

      const tallerIds = [...new Set((propiaMembresiaData ?? []).map((miembro) => miembro.taller_id))]

      if (tallerIds.length === 0) {
        setMiembros([])
        setTalleres([])
        setTallerActivoId('')
        return
      }

      const { data: talleresData, error: talleresError } = await supabase
        .from('talleres')
        .select('*')
        .in('id', tallerIds)
        .order('creado_en', { ascending: true })

      if (talleresError) throw talleresError

      // Cargamos todos los miembros de los talleres a los que pertenece el usuario
      // (no solo los propios) para que el administrador pueda ver la lista completa
      const { data: todosMiembrosData, error: todosMiembrosError } = await supabase
        .from('miembros_taller')
        .select('*')
        .in('taller_id', tallerIds)
        .order('creado_en', { ascending: true })

      if (todosMiembrosError) throw todosMiembrosError

      const talleresDisponibles = talleresData ?? []

      setMiembros(todosMiembrosData ?? [])
      setTalleres(talleresDisponibles)
      setTallerActivoId((actual) =>
        talleresDisponibles.some((taller) => taller.id === actual) ? actual : talleresDisponibles[0]?.id || '',
      )
    } catch (detalle) {
      mostrarError(detalle)
    } finally {
      setCargandoDatos(false)
    }
  }

  const cargarDatosTaller = async (tallerId: string) => {
    setCargandoDatos(true)
    setError('')

    try {
      const [{ data: repuestosData, error: repuestosError }, { data: movimientosData, error: movimientosError }] =
        await Promise.all([
          supabase.from('repuestos').select('*').eq('taller_id', tallerId).order('nombre'),
          supabase
            .from('movimientos_stock')
            .select('*, repuesto:repuestos(codigo,nombre,marca,modelo)')
            .eq('taller_id', tallerId)
            .order('creado_en', { ascending: false })
            .limit(20),
        ])

      if (repuestosError) throw repuestosError
      if (movimientosError) throw movimientosError

      setRepuestos(repuestosData ?? [])
      setMovimientos((movimientosData ?? []) as unknown as MovimientoStock[])
    } catch (detalle) {
      mostrarError(detalle)
    } finally {
      setCargandoDatos(false)
    }
  }

  const iniciarSesion = async (email: string, password: string) => {
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      mostrarError(authError)
      return
    }

    mostrarMensaje('Sesion iniciada correctamente')
  }

  const registrarUsuario = async (email: string, password: string, nombre: string) => {
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })

    if (authError) {
      mostrarError(authError)
      return
    }

    mostrarMensaje('Registro creado. Revisa tu correo si se solicita confirmar la cuenta.')
  }

  const iniciarConGoogle = async () => {
    const redirectTo = obtenerRedirectOAuth()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    })

    if (authError) {
      mostrarError(authError)
    }
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    limpiarDatos()
  }

  const eliminarCuenta = async () => {
    if (!usuario) return

    setEliminandoCuenta(true)

    try {
      const { data: cuentaEliminada, error: deleteError } = await supabase.functions.invoke<{ ok: boolean }>(
        'eliminar-cuenta',
        {
          method: 'POST',
        },
      )

      if (deleteError) throw deleteError

      if (!cuentaEliminada?.ok) {
        throw new Error('eliminar-cuenta no confirmó la eliminación')
      }

      await supabase.auth.signOut()
      limpiarDatos()
      mostrarMensaje('Tu cuenta fue eliminada correctamente.')
    } catch (detalle) {
      mostrarError(detalle)
    } finally {
      setEliminandoCuenta(false)
    }
  }

  const crearTaller = async () => {
    if (!usuario || !nuevoTaller.nombre.trim()) return

    try {
      const { data: taller, error: tallerError } = await supabase
        .from('talleres')
        .insert({
          nombre: nuevoTaller.nombre.trim(),
          direccion: nuevoTaller.direccion.trim() || null,
          telefono: nuevoTaller.telefono.trim() || null,
          creado_por: usuario.id,
        })
        .select()
        .single()

      if (tallerError) throw tallerError

      const { error: miembroError } = await supabase.from('miembros_taller').insert({
        taller_id: taller.id,
        usuario_id: usuario.id,
        email: usuario.email ?? '',
        rol: 'administrador',
        estado: 'activo',
      })

      if (miembroError) throw miembroError

      setNuevoTaller({ nombre: '', direccion: '', telefono: '' })
      mostrarMensaje('Taller creado y seleccionado')
      await cargarBase()
      setTallerActivoId(taller.id)
      setVista('dashboard')
    } catch (detalle) {
      mostrarError(detalle)
    }
  }

  const guardarPerfil = async () => {
    if (!usuario) return

    const nombre = perfilNombre.trim()

    if (!nombre) {
      setError('Ingresa tu nombre para actualizar el perfil.')
      return
    }

    try {
      await actualizarPerfil({ nombre })
      mostrarMensaje('Perfil actualizado correctamente.')
    } catch (detalle) {
      mostrarError(detalle)
    }
  }

  const subirFotoPerfil = async (archivo: File) => {
    if (!usuario) return

    if (!AVATAR_TIPOS_PERMITIDOS.includes(archivo.type)) {
      setError('La foto debe ser JPG, PNG, WEBP o GIF.')
      return
    }

    if (archivo.size > AVATAR_TAMANIO_MAXIMO) {
      setError('La foto no puede superar los 2 MB.')
      return
    }

    const extension = archivo.name.split('.').pop()?.toLowerCase() || 'jpg'
    const ruta = `${usuario.id}/perfil.${extension}`

    setSubiendoAvatar(true)

    try {
      const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(ruta, archivo, {
        cacheControl: '3600',
        upsert: true,
      })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(ruta)
      const avatarUrl = `${data.publicUrl}?v=${Date.now()}`

      await actualizarPerfil({ avatar_url: avatarUrl })
      mostrarMensaje('Foto de perfil actualizada.')
    } catch (detalle) {
      mostrarError(detalle)
    } finally {
      setSubiendoAvatar(false)
    }
  }

  const eliminarTaller = async (taller: Taller) => {
    if (!usuario || !esAdministradorDeTaller(taller.id)) {
      setError('Solo un administrador activo del taller puede realizar esta acción.')
      return
    }

    try {
      const { data: tallerEliminado, error: deleteError } = await supabase.rpc('eliminar_taller', {
        p_taller_id: taller.id,
      })

      if (deleteError) throw deleteError

      if (!tallerEliminado) {
        throw new Error('No pudimos eliminar el taller porque falta una configuración de permisos o tu rol no está activo.')
      }

      if (tallerActivoId === taller.id) {
        setRepuestos([])
        setMovimientos([])
      }

      mostrarMensaje(`Taller "${taller.nombre}" eliminado correctamente.`)
      await cargarBase()
    } catch (detalle) {
      mostrarError(detalle)
    }
  }

  const registrarMovimientoDirecto = async (
    repuestoId: string,
    tipo: TipoMovimiento,
    cantidad: number,
    motivo: string,
  ) => {
    if (!usuario || !tallerActivoId) return

    const { error: movimientoError } = await supabase.from('movimientos_stock').insert({
      taller_id: tallerActivoId,
      repuesto_id: repuestoId,
      usuario_id: usuario.id,
      tipo,
      cantidad,
      motivo,
    })

    if (movimientoError) throw movimientoError
  }

  const guardarRepuesto = async () => {
    if (!usuario || !tallerActivoId || !esAdministrador) return

    const anio = Number(formRepuesto.anio)
    const precio = Number(formRepuesto.precio || 0)
    const stockInicial = Number(formRepuesto.stockInicial || 0)

    if (
      !formRepuesto.codigo.trim() ||
      !formRepuesto.nombre.trim() ||
      !formRepuesto.marca.trim() ||
      !formRepuesto.modelo.trim() ||
      !formRepuesto.categoria.trim() ||
      !Number.isInteger(anio)
    ) {
      setError('Completa código, nombre, marca, modelo, año y categoría antes de guardar el repuesto.')
      return
    }

    try {
      if (repuestoEditando) {
        const { error: updateError } = await supabase
          .from('repuestos')
          .update({
            codigo: formRepuesto.codigo.trim(),
            nombre: formRepuesto.nombre.trim(),
            marca: formRepuesto.marca.trim(),
            modelo: formRepuesto.modelo.trim(),
            anio,
            categoria: formRepuesto.categoria.trim(),
            estado: formRepuesto.estado,
            precio,
            ubicacion: formRepuesto.ubicacion.trim() || null,
            descripcion: formRepuesto.descripcion.trim() || null,
            actualizado_por: usuario.id,
          })
          .eq('id', repuestoEditando.id)

        if (updateError) throw updateError
        mostrarMensaje('Repuesto actualizado')
      } else {
        const { data: creado, error: insertError } = await supabase
          .from('repuestos')
          .insert({
            taller_id: tallerActivoId,
            codigo: formRepuesto.codigo.trim(),
            nombre: formRepuesto.nombre.trim(),
            marca: formRepuesto.marca.trim(),
            modelo: formRepuesto.modelo.trim(),
            anio,
            categoria: formRepuesto.categoria.trim(),
            estado: formRepuesto.estado,
            precio,
            stock: 0,
            ubicacion: formRepuesto.ubicacion.trim() || null,
            descripcion: formRepuesto.descripcion.trim() || null,
            creado_por: usuario.id,
          })
          .select()
          .single()

        if (insertError) throw insertError

        if (stockInicial > 0) {
          await registrarMovimientoDirecto(creado.id, 'entrada', stockInicial, 'Stock inicial')
        }

        mostrarMensaje('Repuesto creado')
      }

      setFormRepuesto(repuestoInicial)
      setRepuestoEditando(null)
      await cargarDatosTaller(tallerActivoId)
    } catch (detalle) {
      mostrarError(detalle)
    }
  }

  const editarRepuesto = (repuesto: Repuesto) => {
    setRepuestoEditando(repuesto)
    setFormRepuesto({
      codigo: repuesto.codigo,
      nombre: repuesto.nombre,
      marca: repuesto.marca,
      modelo: repuesto.modelo,
      anio: String(repuesto.anio),
      categoria: repuesto.categoria,
      estado: repuesto.estado,
      precio: String(repuesto.precio),
      stockInicial: '0',
      ubicacion: repuesto.ubicacion ?? '',
      descripcion: repuesto.descripcion ?? '',
    })
  }

  const eliminarRepuesto = async (repuesto: Repuesto) => {
    if (!esAdministrador || !tallerActivoId) return

    try {
      const { error: deleteError } = await supabase.from('repuestos').delete().eq('id', repuesto.id)

      if (deleteError) throw deleteError

      mostrarMensaje('Repuesto eliminado')
      await cargarDatosTaller(tallerActivoId)
    } catch (detalle) {
      mostrarError(detalle)
    }
  }

  const registrarMovimiento = async () => {
    const cantidad = Number(formMovimiento.cantidad)

    if (!formMovimiento.repuestoId || cantidad <= 0 || !formMovimiento.motivo.trim()) {
      setError('Selecciona un repuesto, ingresa una cantidad válida y escribe el motivo del movimiento.')
      return
    }

    try {
      await registrarMovimientoDirecto(
        formMovimiento.repuestoId,
        formMovimiento.tipo,
        cantidad,
        formMovimiento.motivo.trim(),
      )
      setFormMovimiento(movimientoInicial)
      mostrarMensaje('Movimiento registrado')

      if (tallerActivoId) await cargarDatosTaller(tallerActivoId)
    } catch (detalle) {
      mostrarError(detalle)
    }
  }

  const agregarMiembro = async () => {
    if (!tallerActivoId || !esAdministrador || !nuevoMiembro.email.trim()) return

    try {
      const { error: miembroError } = await supabase.from('miembros_taller').insert({
        taller_id: tallerActivoId,
        email: nuevoMiembro.email.trim().toLowerCase(),
        rol: nuevoMiembro.rol,
        estado: 'invitado',
      })

      if (miembroError) throw miembroError

      setNuevoMiembro({ email: '', rol: 'mecanico' })
      mostrarMensaje('Miembro agregado por email')
      await cargarBase()
    } catch (detalle) {
      mostrarError(detalle)
    }
  }

  const generarInvitacionLink = async () => {
    if (!tallerActivoId || !esAdministrador) return

    setGenerandoInvitacion(true)

    try {
      const { data: token, error: invitacionError } = await supabase.rpc('generar_invitacion_taller', {
        p_taller_id: tallerActivoId,
        p_rol: rolInvitacionLink,
      })

      if (invitacionError) throw invitacionError
      if (!token) throw new Error('No se pudo generar el token de invitacion')

      setLinkInvitacion(crearUrlInvitacion(token))
      mostrarMensaje('Link de invitacion generado. Copialo antes de salir de esta pantalla.')
    } catch (detalle) {
      mostrarError(detalle)
    } finally {
      setGenerandoInvitacion(false)
    }
  }

  const copiarInvitacionLink = async () => {
    if (!linkInvitacion) return

    try {
      await navigator.clipboard.writeText(linkInvitacion)
      mostrarMensaje('Link de invitacion copiado.')
    } catch (detalle) {
      mostrarError(detalle)
    }
  }

  const aceptarInvitacionLink = async (token: string) => {
    if (!usuario || aceptandoInvitacion) return

    setAceptandoInvitacion(true)

    try {
      const { data: invitacionAceptada, error: invitacionError } = await supabase.rpc('aceptar_invitacion_taller', {
        p_token: token,
      })

      if (invitacionError) throw invitacionError

      const tallerInvitado = invitacionAceptada?.[0]

      if (!tallerInvitado) throw new Error('Invitacion invalida o regenerada')

      window.localStorage.removeItem(INVITACION_PENDIENTE_KEY)
      await cargarBase()
      setTallerActivoId(tallerInvitado.taller_id)
      setVista('dashboard')
      window.location.hash = '/dashboard'
      mostrarMensaje(`Te uniste al taller "${tallerInvitado.taller_nombre}".`)
    } catch (detalle) {
      window.localStorage.removeItem(INVITACION_PENDIENTE_KEY)
      window.location.hash = '/talleres'
      mostrarError(detalle)
    } finally {
      setAceptandoInvitacion(false)
    }
  }

  const reclamarInvitacion = async () => {
    if (!usuario?.email) return

    try {
      const { error: updateError } = await supabase
        .from('miembros_taller')
        .update({ usuario_id: usuario.id, estado: 'activo' })
        .eq('email', usuario.email)
        .is('usuario_id', null)

      if (updateError) throw updateError

      mostrarMensaje('Invitaciones activadas')
      await cargarBase()
    } catch (detalle) {
      mostrarError(detalle)
    }
  }

  const cancelarEdicionRepuesto = () => {
    setRepuestoEditando(null)
    setFormRepuesto(repuestoInicial)
  }

  useEffect(() => {
    const iniciar = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setCargandoSesion(false)
    }

    void iniciar()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nuevaSesion) => {
      setSession(nuevaSesion)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!usuario) {
      limpiarDatos()
      return
    }

    void cargarBase()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.id])

  useEffect(() => {
    if (invitacionToken) {
      window.localStorage.setItem(INVITACION_PENDIENTE_KEY, invitacionToken)
    }

    const tokenPendiente = invitacionToken || window.localStorage.getItem(INVITACION_PENDIENTE_KEY)

    if (!usuario || !tokenPendiente || aceptandoInvitacion) return

    void aceptarInvitacionLink(tokenPendiente)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aceptandoInvitacion, invitacionToken, usuario?.id])

  useEffect(() => {
    if (!tallerActivoId) return

    void cargarDatosTaller(tallerActivoId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tallerActivoId])

  useEffect(() => {
    setLinkInvitacion('')
  }, [rolInvitacionLink, tallerActivoId])

  useEffect(() => {
    if (!usuarioId) return

    if (!tieneTallerActivo && vista !== 'talleres' && vista !== 'perfil') {
      setVista('talleres')
      return
    }

    if (tieneTallerActivo && vista === 'usuarios' && !esAdministrador) {
      setVista('dashboard')
    }
  }, [esAdministrador, tieneTallerActivo, usuarioId, vista])

  useEffect(() => {
    setPerfilNombre(perfil?.nombre ?? '')
  }, [perfil?.nombre])

  useEffect(() => {
    if (!mensaje && !error) return undefined

    const temporizador = window.setTimeout(() => {
      setMensaje('')
      setError('')
    }, DURACION_MENSAJE_MS)

    return () => window.clearTimeout(temporizador)
  }, [error, mensaje])

  return {
    alertas,
    busqueda,
    cargandoDatos,
    cargandoSesion,
    error,
    esAdministrador,
    aceptandoInvitacion,
    eliminandoCuenta,
    formMovimiento,
    formRepuesto,
    generandoInvitacion,
    linkInvitacion,
    membresiaActual,
    mensaje,
    miembros,
    movimientos,
    nuevoMiembro,
    nuevoTaller,
    perfil,
    perfilNombre,
    repuestoEditando,
    repuestos,
    repuestosFiltrados,
    rolInvitacionLink,
    session,
    stockTotal,
    subiendoAvatar,
    tallerActivo,
    tallerActivoId,
    talleres,
    tieneTallerActivo,
    usuario,
    valorInventario,
    vistaActual,
    vistasDisponibles,
    agregarMiembro,
    aceptarInvitacionLink,
    cancelarEdicionRepuesto,
    cerrarSesion,
    crearTaller,
    editarRepuesto,
    eliminarCuenta,
    eliminarTaller,
    eliminarRepuesto,
    esAdministradorDeTaller,
    guardarRepuesto,
    guardarPerfil,
    iniciarConGoogle,
    iniciarSesion,
    copiarInvitacionLink,
    generarInvitacionLink,
    reclamarInvitacion,
    registrarMovimiento,
    registrarUsuario,
    setBusqueda,
    setFormMovimiento,
    setFormRepuesto,
    setNuevoMiembro,
    setNuevoTaller,
    setPerfilNombre,
    setRolInvitacionLink,
    setTallerActivoId,
    setVista,
    subirFotoPerfil,
  }
}
