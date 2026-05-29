import { useEffect } from 'react'
import { PantallaLogin } from './components/auth/PantallaLogin'
import { AppLayout } from './components/layout/AppLayout'
import { Alerta } from './components/ui/Alerta'
import { AvisoConfiguracion, PantallaCarga } from './components/ui/PantallasBase'
import { useRepubase } from './hooks/useRepubase'
import { useRutaHash } from './hooks/useRutaHash'
import { supabaseConfigurado } from './lib/supabase'
import { Alertas } from './pages/Alertas'
import { Dashboard } from './pages/Dashboard'
import { Inventario } from './pages/Inventario'
import { Movimientos } from './pages/Movimientos'
import { Perfil } from './pages/Perfil'
import { Talleres } from './pages/Talleres'
import { Usuarios } from './pages/Usuarios'
import type { Vista } from './tipos/dominio'

function App() {
  const { invitacionToken, vistaDesdeRuta, navegar } = useRutaHash()
  const repubase = useRepubase(vistaDesdeRuta, invitacionToken)
  const { setVista } = repubase

  useEffect(() => {
    setVista(vistaDesdeRuta)
  }, [setVista, vistaDesdeRuta])

  const seleccionarVista = (vista: Vista) => {
    repubase.setVista(vista)
    navegar(vista)
  }

  if (repubase.cargandoSesion) return <PantallaCarga texto="Preparando Repubase" />

  if (!supabaseConfigurado) {
    return (
      <AvisoConfiguracion>
        Crea un archivo <code>.env.local</code> usando <code>.env.example</code> y configura el acceso al servicio de
        datos del proyecto.
      </AvisoConfiguracion>
    )
  }

  if (!repubase.session) {
    return (
      <PantallaLogin
        mensaje={repubase.mensaje}
        error={repubase.error}
        onLogin={repubase.iniciarSesion}
        onRegistro={repubase.registrarUsuario}
        onGoogle={repubase.iniciarConGoogle}
      />
    )
  }

  return (
    <AppLayout
      perfil={repubase.perfil}
      usuarioEmail={repubase.usuario?.email}
      rolActivo={repubase.membresiaActual?.rol}
      talleres={repubase.talleres}
      tallerActivoId={repubase.tallerActivoId}
      tallerActivoNombre={repubase.tallerActivo?.nombre}
      vistaActual={repubase.vistaActual}
      vistasDisponibles={repubase.vistasDisponibles}
      alertasCantidad={repubase.alertas.length}
      onCerrarSesion={repubase.cerrarSesion}
      onSeleccionarTaller={repubase.setTallerActivoId}
      onSeleccionarVista={seleccionarVista}
    >
      {repubase.mensaje ? <Alerta tipo="ok" texto={repubase.mensaje} /> : null}
      {repubase.error ? <Alerta tipo="error" texto={repubase.error} /> : null}
      {repubase.cargandoDatos && !repubase.mensaje && !repubase.error ? (
        <Alerta tipo="info" texto="Actualizando datos..." />
      ) : null}
      {repubase.aceptandoInvitacion && !repubase.mensaje && !repubase.error ? (
        <Alerta tipo="info" texto="Activando invitacion..." />
      ) : null}

      <RutaActual repubase={repubase} />
    </AppLayout>
  )
}

function RutaActual({ repubase }: { repubase: ReturnType<typeof useRepubase> }) {
  if (!repubase.tieneTallerActivo || repubase.vistaActual === 'talleres') {
    if (repubase.vistaActual === 'perfil') {
      return <PerfilUsuario repubase={repubase} />
    }

    return (
      <Talleres
        talleres={repubase.talleres}
        nuevoTaller={repubase.nuevoTaller}
        setNuevoTaller={repubase.setNuevoTaller}
        crearTaller={repubase.crearTaller}
        actualizarTaller={repubase.actualizarTaller}
        eliminarTaller={repubase.eliminarTaller}
        seleccionarTaller={repubase.setTallerActivoId}
        puedeEditarTaller={(tallerId) => repubase.tienePermisoEnTaller(tallerId, 'gestionar_taller')}
        puedeEliminarTaller={(tallerId) => repubase.tienePermisoEnTaller(tallerId, 'transferir_propiedad')}
      />
    )
  }

  if (repubase.vistaActual === 'perfil') {
    return <PerfilUsuario repubase={repubase} />
  }

  if (repubase.vistaActual === 'dashboard') {
    return (
      <Dashboard
        valorInventario={repubase.valorInventario}
        cantidadRepuestos={repubase.repuestos.length}
        stockTotal={repubase.stockTotal}
        alertasActivas={repubase.alertas.length}
        movimientos={repubase.movimientos}
      />
    )
  }

  if (repubase.vistaActual === 'inventario') {
    return (
      <Inventario
        repuestos={repubase.repuestosFiltrados}
        busqueda={repubase.busqueda}
        setBusqueda={repubase.setBusqueda}
        formRepuesto={repubase.formRepuesto}
        setFormRepuesto={repubase.setFormRepuesto}
        repuestoEditando={repubase.repuestoEditando}
        guardarRepuesto={repubase.guardarRepuesto}
        editarRepuesto={repubase.editarRepuesto}
        eliminarRepuesto={repubase.eliminarRepuesto}
        esAdministrador={repubase.puedeGestionarInventario}
        cancelarEdicion={repubase.cancelarEdicionRepuesto}
      />
    )
  }

  if (repubase.vistaActual === 'movimientos') {
    return (
      <Movimientos
        repuestos={repubase.repuestos}
        movimientos={repubase.movimientos}
        formMovimiento={repubase.formMovimiento}
        setFormMovimiento={repubase.setFormMovimiento}
        registrarMovimiento={repubase.registrarMovimiento}
        puedeRegistrarMovimientos={repubase.puedeRegistrarMovimientos}
      />
    )
  }

  if (repubase.vistaActual === 'alertas') {
    return <Alertas alertas={repubase.alertas} />
  }

  if (repubase.vistaActual === 'usuarios' && repubase.puedeGestionarUsuarios) {
    return (
      <Usuarios
        miembros={repubase.miembros.filter((miembro) => miembro.taller_id === repubase.tallerActivoId)}
        membresiaActual={repubase.membresiaActual}
        nuevoMiembro={repubase.nuevoMiembro}
        setNuevoMiembro={repubase.setNuevoMiembro}
        agregarMiembro={repubase.agregarMiembro}
        cambiarRolMiembro={repubase.cambiarRolMiembro}
        eliminarMiembroTaller={repubase.eliminarMiembroTaller}
        transferirPropiedadTaller={repubase.transferirPropiedadTaller}
        copiarInvitacionLink={repubase.copiarInvitacionLink}
        generarInvitacionLink={repubase.generarInvitacionLink}
        generandoInvitacion={repubase.generandoInvitacion}
        linkInvitacion={repubase.linkInvitacion}
        rolInvitacionLink={repubase.rolInvitacionLink}
        setRolInvitacionLink={repubase.setRolInvitacionLink}
      />
    )
  }

  return null
}

function PerfilUsuario({ repubase }: { repubase: ReturnType<typeof useRepubase> }) {
  return (
    <Perfil
      perfil={repubase.perfil}
      usuarioEmail={repubase.usuario?.email}
      perfilNombre={repubase.perfilNombre}
      setPerfilNombre={repubase.setPerfilNombre}
      guardarPerfil={repubase.guardarPerfil}
      subirFotoPerfil={repubase.subirFotoPerfil}
      subiendoAvatar={repubase.subiendoAvatar}
      eliminarCuenta={repubase.eliminarCuenta}
      eliminandoCuenta={repubase.eliminandoCuenta}
      miembros={repubase.miembros}
      talleres={repubase.talleres}
      tallerActivoId={repubase.tallerActivoId}
    />
  )
}

export default App
