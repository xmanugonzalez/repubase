alter table public.perfiles
add column if not exists estado text not null default 'activo',
add column if not exists desactivado_en timestamptz,
add column if not exists desactivado_por uuid references auth.users(id) on delete set null,
add column if not exists motivo_desactivacion text;

alter table public.talleres
add column if not exists estado text not null default 'activo',
add column if not exists desactivado_en timestamptz,
add column if not exists desactivado_por uuid references auth.users(id) on delete set null,
add column if not exists motivo_desactivacion text;

do $$
begin
  alter table public.perfiles
  add constraint perfiles_estado_valido check (estado in ('activo', 'desactivado'));
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter table public.talleres
  add constraint talleres_estado_valido check (estado in ('activo', 'desactivado'));
exception
  when duplicate_object then null;
end;
$$;

create index if not exists perfiles_estado_idx on public.perfiles(estado);
create index if not exists talleres_estado_idx on public.talleres(estado);

create or replace function public.cuenta_actual_activa()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
    and exists (
      select 1
      from public.perfiles p
      where p.id = auth.uid()
        and p.estado = 'activo'
    );
$$;

create or replace function public.rol_usuario_taller(p_taller_id uuid)
returns public.rol_taller
language sql
stable
security definer
set search_path = public
as $$
  select mt.rol
  from public.miembros_taller mt
  join public.talleres t on t.id = mt.taller_id
  where public.cuenta_actual_activa()
    and t.id = p_taller_id
    and t.estado = 'activo'
    and mt.estado = 'activo'
    and (
      mt.usuario_id = auth.uid()
      or mt.email = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  order by mt.creado_en asc
  limit 1;
$$;

create or replace function public.perfil_comparte_taller(perfil_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select perfil_id = auth.uid()
    or (
      public.cuenta_actual_activa()
      and exists (
        select 1
        from public.perfiles objetivo_perfil
        join public.miembros_taller objetivo on objetivo.usuario_id = objetivo_perfil.id
        join public.miembros_taller actual on actual.taller_id = objetivo.taller_id
        join public.talleres t on t.id = objetivo.taller_id
        where objetivo_perfil.id = perfil_id
          and objetivo_perfil.estado = 'activo'
          and t.estado = 'activo'
          and objetivo.estado = 'activo'
          and actual.estado = 'activo'
          and (
            actual.usuario_id = auth.uid()
            or actual.email = lower(coalesce(auth.jwt() ->> 'email', ''))
          )
      )
    );
$$;

create or replace function public.desactivar_taller(p_taller_id uuid, p_motivo text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  filas_actualizadas integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion';
  end if;

  if not public.es_propietario_taller(p_taller_id) then
    raise exception 'Solo el propietario activo puede desactivar este taller';
  end if;

  update public.talleres
  set estado = 'desactivado',
      desactivado_en = now(),
      desactivado_por = auth.uid(),
      motivo_desactivacion = nullif(trim(p_motivo), '')
  where id = p_taller_id
    and estado = 'activo';

  get diagnostics filas_actualizadas = row_count;

  return filas_actualizadas > 0;
end;
$$;

create or replace function public.eliminar_taller(p_taller_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.desactivar_taller(p_taller_id, 'Solicitud recibida desde el flujo antiguo de eliminacion');
end;
$$;

create or replace function public.validar_invitacion_taller(p_token text)
returns table (
  valida boolean,
  taller_id uuid,
  taller_nombre text,
  rol public.rol_taller
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    true,
    t.id,
    t.nombre,
    i.rol
  from public.invitaciones_taller i
  join public.talleres t on t.id = i.taller_id
  where i.token_hash = public.hash_invitacion_taller(p_token)
    and i.revocado_en is null
    and t.estado = 'activo'
  limit 1;

  if not found then
    return query select false, null::uuid, null::text, null::public.rol_taller;
  end if;
end;
$$;

create or replace function public.aceptar_invitacion_taller(p_token text)
returns table (
  taller_id uuid,
  taller_nombre text,
  rol public.rol_taller
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitacion public.invitaciones_taller%rowtype;
  v_email text;
  v_miembro_id uuid;
begin
  if not public.cuenta_actual_activa() then
    raise exception 'Debes iniciar sesion con una cuenta activa para aceptar la invitacion';
  end if;

  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if v_email = '' then
    raise exception 'Tu cuenta no tiene un correo valido';
  end if;

  select i.*
  into v_invitacion
  from public.invitaciones_taller i
  join public.talleres t on t.id = i.taller_id
  where i.token_hash = public.hash_invitacion_taller(p_token)
    and i.revocado_en is null
    and t.estado = 'activo'
  limit 1;

  if v_invitacion.id is null then
    raise exception 'Invitacion invalida o regenerada';
  end if;

  select id
  into v_miembro_id
  from public.miembros_taller
  where taller_id = v_invitacion.taller_id
    and (usuario_id = auth.uid() or email = v_email)
  order by creado_en asc
  limit 1;

  if v_miembro_id is null then
    insert into public.miembros_taller (taller_id, usuario_id, email, rol, estado)
    values (v_invitacion.taller_id, auth.uid(), v_email, v_invitacion.rol, 'activo');
  else
    update public.miembros_taller
    set usuario_id = auth.uid(),
        email = v_email,
        rol = v_invitacion.rol,
        estado = 'activo'
    where id = v_miembro_id;
  end if;

  return query
  select
    t.id,
    t.nombre,
    v_invitacion.rol
  from public.talleres t
  where t.id = v_invitacion.taller_id
    and t.estado = 'activo';
end;
$$;

create or replace function public.reclamar_invitaciones_pendientes()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_invitacion public.miembros_taller%rowtype;
begin
  if not public.cuenta_actual_activa() then
    raise exception 'Debes iniciar sesion con una cuenta activa';
  end if;

  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if v_email = '' then
    raise exception 'Tu cuenta no tiene un correo valido';
  end if;

  for v_invitacion in
    select mt.*
    from public.miembros_taller mt
    join public.talleres t on t.id = mt.taller_id
    where mt.email = v_email
      and mt.usuario_id is null
      and t.estado = 'activo'
    for update
  loop
    if exists (
      select 1
      from public.miembros_taller mt
      where mt.taller_id = v_invitacion.taller_id
        and mt.usuario_id = auth.uid()
    ) then
      delete from public.miembros_taller
      where id = v_invitacion.id;
    else
      update public.miembros_taller
      set usuario_id = auth.uid(),
          estado = 'activo'
      where id = v_invitacion.id;
    end if;
  end loop;

  return true;
end;
$$;

drop policy if exists perfiles_ver_propio on public.perfiles;
drop policy if exists perfiles_crear_propio on public.perfiles;
drop policy if exists perfiles_actualizar_propio on public.perfiles;
drop policy if exists perfiles_ver_miembros_taller on public.perfiles;
drop policy if exists talleres_ver_miembros on public.talleres;
drop policy if exists talleres_crear_autenticado on public.talleres;
drop policy if exists talleres_actualizar_admin on public.talleres;
drop policy if exists talleres_actualizar_gestor on public.talleres;
drop policy if exists talleres_eliminar_admin on public.talleres;
drop policy if exists talleres_eliminar_propietario on public.talleres;
drop policy if exists miembros_ver_taller on public.miembros_taller;

create policy perfiles_ver_propio on public.perfiles
for select to authenticated
using (id = auth.uid());

create policy perfiles_ver_miembros_taller on public.perfiles
for select to authenticated
using (public.perfil_comparte_taller(id));

create policy perfiles_crear_propio on public.perfiles
for insert to authenticated
with check (id = auth.uid() and estado = 'activo');

create policy perfiles_actualizar_propio on public.perfiles
for update to authenticated
using (id = auth.uid() and estado = 'activo')
with check (
  id = auth.uid()
  and estado = 'activo'
  and desactivado_en is null
  and desactivado_por is null
  and motivo_desactivacion is null
);

create policy talleres_ver_miembros on public.talleres
for select to authenticated
using (
  estado = 'activo'
  and public.cuenta_actual_activa()
  and (public.es_miembro_activo(id) or creado_por = auth.uid())
);

create policy talleres_crear_autenticado on public.talleres
for insert to authenticated
with check (
  public.cuenta_actual_activa()
  and creado_por = auth.uid()
  and estado = 'activo'
);

create policy talleres_actualizar_gestor on public.talleres
for update to authenticated
using (estado = 'activo' and public.tiene_permiso_taller(id, 'gestionar_taller'))
with check (estado = 'activo' and public.tiene_permiso_taller(id, 'gestionar_taller'));

create policy miembros_ver_taller on public.miembros_taller
for select to authenticated
using (
  public.cuenta_actual_activa()
  and exists (
    select 1
    from public.talleres t
    where t.id = miembros_taller.taller_id
      and t.estado = 'activo'
  )
  and (
    public.es_miembro_activo(taller_id)
    or usuario_id = auth.uid()
    or email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

revoke all on function public.cuenta_actual_activa() from public;
revoke all on function public.rol_usuario_taller(uuid) from public;
revoke all on function public.perfil_comparte_taller(uuid) from public;
revoke all on function public.desactivar_taller(uuid, text) from public;
revoke all on function public.eliminar_taller(uuid) from public;
revoke all on function public.validar_invitacion_taller(text) from public;
revoke all on function public.aceptar_invitacion_taller(text) from public;
revoke all on function public.reclamar_invitaciones_pendientes() from public;

grant execute on function public.cuenta_actual_activa() to authenticated;
grant execute on function public.rol_usuario_taller(uuid) to authenticated;
grant execute on function public.perfil_comparte_taller(uuid) to authenticated;
grant execute on function public.desactivar_taller(uuid, text) to authenticated;
grant execute on function public.eliminar_taller(uuid) to authenticated;
grant execute on function public.validar_invitacion_taller(text) to anon, authenticated;
grant execute on function public.aceptar_invitacion_taller(text) to authenticated;
grant execute on function public.reclamar_invitaciones_pendientes() to authenticated;
