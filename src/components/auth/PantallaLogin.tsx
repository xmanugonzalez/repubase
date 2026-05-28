import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent, Ref } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { Alerta } from '../ui/Alerta'
import { LogoRepubase } from '../ui/LogoRepubase'

export function PantallaLogin({
  mensaje,
  error,
  onLogin,
  onRegistro,
  onGoogle,
}: {
  mensaje: string
  error: string
  onLogin: (email: string, password: string) => Promise<void>
  onRegistro: (email: string, password: string, nombre: string) => Promise<void>
  onGoogle: () => Promise<void>
}) {
  const [modo, setModo] = useState<'login' | 'registro'>('registro')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [errorLocal, setErrorLocal] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const nombreRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const confirmarPasswordRef = useRef<HTMLInputElement>(null)
  const esRegistro = modo === 'registro'
  const titulo = esRegistro ? 'Crear cuenta' : 'Iniciar sesión'
  const textoAccion = esRegistro ? 'Registrarse' : 'Entrar'
  const textoGoogle = esRegistro ? 'Registrarse con Google' : 'Entrar con Google'
  const textoAlternativo = esRegistro ? '¿Ya tiene una cuenta?' : '¿Todavía no tiene cuenta?'
  const accionAlternativa = esRegistro ? 'Iniciar sesión' : 'Crear cuenta'

  const enviarFormulario = () => {
    setErrorLocal('')

    if (esRegistro) {
      if (password !== confirmarPassword) {
        setErrorLocal('Las contraseñas no coinciden. Revisa ambos campos antes de continuar.')
        return
      }

      void onRegistro(email, password, nombre)
      return
    }

    void onLogin(email, password)
  }

  const enfocarSiguiente = (input: HTMLInputElement | null) => {
    input?.focus()
  }

  const enviarDesdeUltimoCampo = () => {
    formRef.current?.requestSubmit()
  }

  const alternarModo = () => {
    setModo(esRegistro ? 'login' : 'registro')
    setErrorLocal('')
  }

  useEffect(() => {
    if (!errorLocal) return undefined

    const temporizador = window.setTimeout(() => setErrorLocal(''), 4000)

    return () => window.clearTimeout(temporizador)
  }, [errorLocal])

  return (
    <main className="auth-page">
      <section className="auth-card" aria-label="Acceso a Repubase">
        <aside className="auth-showcase">
          <div className="auth-showcase-brand">
            <LogoRepubase />
          </div>

          <div className="auth-showcase-copy">
            <p className="auth-kicker">Gestión de inventario para talleres</p>
            <h1>
              Controle repuestos,
              <span> libere espacio</span>
              <strong> y compre con datos.</strong>
            </h1>
          </div>

          <button type="button" className="auth-back-button" onClick={alternarModo}>
            <ChevronLeft size={17} />
            {accionAlternativa}
          </button>
        </aside>

        <form
          ref={formRef}
          className="auth-form"
          onSubmit={(event) => {
            event.preventDefault()
            enviarFormulario()
          }}
        >
          <div className="auth-form-inner">
            <div className="auth-form-heading">
              <h2>{titulo}</h2>
            </div>

            <div className="auth-alerts">
              {mensaje ? <Alerta tipo="ok" texto={mensaje} /> : null}
              {error || errorLocal ? <Alerta tipo="error" texto={error || errorLocal} /> : null}
            </div>

            <div className="auth-fields">
              {esRegistro ? (
                <CampoAuth
                  icono={UserRound}
                  label="Nombre"
                  value={nombre}
                  onChange={setNombre}
                  placeholder="Ingrese el nombre"
                  autoComplete="name"
                  inputRef={nombreRef}
                  onEnter={() => enfocarSiguiente(emailRef.current)}
                />
              ) : null}
              <CampoAuth
                icono={Mail}
                label="Correo electrónico"
                value={email}
                onChange={setEmail}
                placeholder="correo@taller.com"
                type="email"
                autoComplete="email"
                inputRef={emailRef}
                onEnter={() => enfocarSiguiente(passwordRef.current)}
              />
              <CampoAuth
                icono={LockKeyhole}
                label="Contraseña"
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                type={mostrarPassword ? 'text' : 'password'}
                autoComplete={esRegistro ? 'new-password' : 'current-password'}
                inputRef={passwordRef}
                onEnter={() => {
                  if (esRegistro) {
                    enfocarSiguiente(confirmarPasswordRef.current)
                    return
                  }

                  enviarDesdeUltimoCampo()
                }}
                accion={{
                  icono: mostrarPassword ? EyeOff : Eye,
                  etiqueta: mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña',
                  onClick: () => setMostrarPassword((actual) => !actual),
                }}
              />
              {esRegistro ? (
                <CampoAuth
                  icono={LockKeyhole}
                  label="Confirmar contraseña"
                  value={confirmarPassword}
                  onChange={setConfirmarPassword}
                  placeholder="••••••••"
                  type={mostrarPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  inputRef={confirmarPasswordRef}
                  onEnter={enviarDesdeUltimoCampo}
                />
              ) : null}
            </div>

            <button className="auth-submit" type="submit">
              {textoAccion}
              <ArrowRight size={18} />
            </button>

            <div className="auth-divider">
              <span>O</span>
            </div>

            <button
              className="auth-google"
              type="button"
              onClick={() => {
                void onGoogle()
              }}
            >
              <FcGoogle aria-hidden="true" size={20} />
              {textoGoogle}
            </button>

            {!esRegistro ? (
              <button className="auth-forgot" type="button">
                ¿Olvidaste la contraseña?
              </button>
            ) : null}

            <div className="auth-mode-switch">
              <span>{textoAlternativo}</span>
              <button type="button" onClick={alternarModo}>
                {accionAlternativa}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}

function CampoAuth({
  icono: Icono,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  inputRef,
  onEnter,
  accion,
}: {
  icono: LucideIcon
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  autoComplete?: string
  inputRef?: Ref<HTMLInputElement>
  onEnter?: () => void
  accion?: {
    icono: LucideIcon
    etiqueta: string
    onClick: () => void
  }
}) {
  const IconoAccion = accion?.icono
  const manejarTecla = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || !onEnter) {
      return
    }

    event.preventDefault()
    onEnter()
  }

  return (
    <label className="auth-field">
      <span className="auth-field-label">{label}</span>
      <span className="auth-field-row">
        <Icono size={18} />
        <input
          className="auth-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          ref={inputRef}
          onKeyDown={manejarTecla}
        />
        {accion && IconoAccion ? (
          <button type="button" aria-label={accion.etiqueta} onClick={accion.onClick}>
            <IconoAccion size={18} />
          </button>
        ) : null}
      </span>
    </label>
  )
}
