import type { ReactNode } from 'react'

export function PantallaCarga({ texto }: { texto: string }) {
  return (
    <div className="app-shell grid min-h-screen place-items-center">
      <div className="panel px-8 py-6 text-lg font-extrabold text-[var(--verde-profundo)]">{texto}</div>
    </div>
  )
}

export function AvisoConfiguracion({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell grid min-h-screen place-items-center p-6">
      <div className="panel max-w-xl p-7 text-[var(--verde-profundo)]">
        <h1 className="headline-title mb-3 text-4xl text-[var(--verde-taller)]">Falta configurar el servicio de datos</h1>
        <p>{children}</p>
      </div>
    </div>
  )
}
