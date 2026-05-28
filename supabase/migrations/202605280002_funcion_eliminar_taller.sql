create or replace function public.eliminar_taller(p_taller_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  filas_eliminadas integer := 0;
begin
  if not public.es_administrador_taller(p_taller_id) then
    raise exception 'Solo un administrador activo puede eliminar este taller';
  end if;

  delete from public.movimientos_stock
  where taller_id = p_taller_id;

  delete from public.repuestos
  where taller_id = p_taller_id;

  delete from public.miembros_taller
  where taller_id = p_taller_id;

  delete from public.talleres
  where id = p_taller_id;

  get diagnostics filas_eliminadas = row_count;

  return filas_eliminadas > 0;
end;
$$;

revoke all on function public.eliminar_taller(uuid) from public;
grant execute on function public.eliminar_taller(uuid) to authenticated;
