import type { ReactNode } from 'react'

export function Panel({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="panel p-7 lg:p-10">
      <h3 className="headline-title mb-8">{titulo}</h3>
      {children}
    </section>
  )
}
