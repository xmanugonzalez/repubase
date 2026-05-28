export const formatearFecha = (fecha: string | null) => {
  if (!fecha) return 'Sin movimiento'

  return new Intl.DateTimeFormat('es-PY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(fecha))
}

export const calcularDias = (fecha: string | null) => {
  if (!fecha) return 999

  const diferencia = Date.now() - new Date(fecha).getTime()

  return Math.max(0, Math.floor(diferencia / 86_400_000))
}

export const formatearGs = (valor: number) =>
  new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  }).format(valor)
