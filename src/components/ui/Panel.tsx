import type { ReactNode } from 'react'

export function Panel({ titulo, icon, children }: { titulo: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="panel p-7 lg:p-10">
      {icon ? (
        <div className="mb-5 flex flex-wrap items-center gap-4">
          {icon}
          <h3 className="headline-title">{titulo}</h3>
        </div>
      ) : titulo ? (
        <h3 className="headline-title mb-8">{titulo}</h3>
      ) : null}
      {children}
    </section>
  )
}
