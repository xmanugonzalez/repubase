import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react'

export type TipoAlerta = 'ok' | 'advertencia' | 'error' | 'info'

export function Alerta({ tipo, texto }: { tipo: TipoAlerta; texto: string }) {
  const clases = {
    ok: 'bg-[var(--aviso-ok-fondo)] text-[var(--aviso-ok-texto)]',
    advertencia: 'bg-[var(--aviso-advertencia-fondo)] text-[var(--aviso-advertencia-texto)]',
    error: 'bg-[var(--aviso-error-fondo)] text-[var(--aviso-error-texto)]',
    info: 'bg-[var(--aviso-info-fondo)] text-[var(--aviso-info-texto)]',
  }
  const iconos = {
    ok: CheckCircle2,
    advertencia: AlertCircle,
    error: AlertCircle,
    info: LoaderCircle,
  }
  const Icono = iconos[tipo]
  const esError = tipo === 'error'
  const esCarga = tipo === 'info'

  return (
    <div
      className={`fixed right-5 top-5 z-50 flex max-w-[min(28rem,calc(100vw-2.5rem))] items-center gap-4 rounded-xl px-5 py-5 text-base font-bold shadow-[0_18px_48px_rgb(7_90_48_/_16%)] ${clases[tipo]}`}
      role={esError ? 'alert' : 'status'}
      aria-live={esError ? 'assertive' : 'polite'}
    >
      {esCarga ? <Icono className="animate-spin" size={24} /> : <Icono size={24} />}
      <span>{texto}</span>
    </div>
  )
}
