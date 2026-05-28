alter table public.talleres
alter column creado_por drop not null;

alter table public.talleres
drop constraint if exists talleres_creado_por_fkey;

alter table public.talleres
add constraint talleres_creado_por_fkey
foreign key (creado_por) references auth.users(id) on delete set null;

alter table public.repuestos
alter column creado_por drop not null;

alter table public.repuestos
drop constraint if exists repuestos_creado_por_fkey;

alter table public.repuestos
add constraint repuestos_creado_por_fkey
foreign key (creado_por) references auth.users(id) on delete set null;

alter table public.repuestos
drop constraint if exists repuestos_actualizado_por_fkey;

alter table public.repuestos
add constraint repuestos_actualizado_por_fkey
foreign key (actualizado_por) references auth.users(id) on delete set null;

alter table public.movimientos_stock
alter column usuario_id drop not null;

alter table public.movimientos_stock
drop constraint if exists movimientos_stock_usuario_id_fkey;

alter table public.movimientos_stock
add constraint movimientos_stock_usuario_id_fkey
foreign key (usuario_id) references auth.users(id) on delete set null;

create or replace function public.eliminar_cuenta_propia()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usuario uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_taller uuid;
begin
  if v_usuario is null then
    raise exception 'Usuario no autenticado';
  end if;

  delete from storage.objects
  where bucket_id = 'avatares'
    and (storage.foldername(name))[1] = v_usuario::text;

  for v_taller in
    select mt.taller_id
    from public.miembros_taller mt
    where mt.estado = 'activo'
      and (mt.usuario_id = v_usuario or mt.email = v_email)
      and not exists (
        select 1
        from public.miembros_taller otro
        where otro.taller_id = mt.taller_id
          and otro.estado = 'activo'
          and not (otro.usuario_id = v_usuario or otro.email = v_email)
      )
  loop
    delete from public.movimientos_stock
    where taller_id = v_taller;

    delete from public.repuestos
    where taller_id = v_taller;

    delete from public.miembros_taller
    where taller_id = v_taller;

    delete from public.talleres
    where id = v_taller;
  end loop;

  delete from public.miembros_taller
  where usuario_id = v_usuario
    or email = v_email;

  delete from auth.users
  where id = v_usuario;

  return true;
end;
$$;

revoke all on function public.eliminar_cuenta_propia() from public;
grant execute on function public.eliminar_cuenta_propia() to authenticated;
