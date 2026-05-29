with candidato_propietario as (
  select distinct on (t.id)
    mt.id
  from public.talleres t
  join public.miembros_taller mt on mt.taller_id = t.id
  where mt.estado = 'activo'
  order by
    t.id,
    (mt.usuario_id = t.creado_por) desc,
    (mt.rol = 'administrador') desc,
    mt.creado_en asc
)
update public.miembros_taller mt
set rol = 'propietario'
from candidato_propietario cp
where mt.id = cp.id
  and mt.rol <> 'propietario';

create or replace function public.rol_usuario_taller(p_taller_id uuid)
returns public.rol_taller
language sql
stable
security definer
set search_path = public
as $$
  select mt.rol
  from public.miembros_taller mt
  where mt.taller_id = p_taller_id
    and mt.estado = 'activo'
    and (
      mt.usuario_id = auth.uid()
      or mt.email = lower(coalesce(auth.jwt() ->> 'email', ''))
    )
  order by mt.creado_en asc
  limit 1;
$$;

create or replace function public.tiene_permiso_taller(p_taller_id uuid, p_permiso text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case public.rol_usuario_taller(p_taller_id)
    when 'propietario' then p_permiso in (
      'ver_dashboard',
      'ver_inventario',
      'gestionar_inventario',
      'registrar_movimientos',
      'ver_usuarios',
      'gestionar_miembros',
      'gestionar_admins',
      'transferir_propiedad',
      'gestionar_taller'
    )
    when 'administrador' then p_permiso in (
      'ver_dashboard',
      'ver_inventario',
      'gestionar_inventario',
      'registrar_movimientos',
      'ver_usuarios',
      'gestionar_miembros',
      'gestionar_taller'
    )
    when 'encargado' then p_permiso in (
      'ver_dashboard',
      'ver_inventario',
      'gestionar_inventario',
      'registrar_movimientos'
    )
    when 'mecanico' then p_permiso in (
      'ver_dashboard',
      'ver_inventario',
      'registrar_movimientos'
    )
    when 'inventario' then p_permiso in (
      'ver_dashboard',
      'ver_inventario',
      'gestionar_inventario',
      'registrar_movimientos'
    )
    when 'visualizador' then p_permiso in (
      'ver_dashboard',
      'ver_inventario'
    )
    else false
  end;
$$;

create or replace function public.es_miembro_activo(taller uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.rol_usuario_taller(taller) is not null;
$$;

create or replace function public.es_propietario_taller(p_taller_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.rol_usuario_taller(p_taller_id) = 'propietario';
$$;

create or replace function public.es_administrador_taller(taller uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.rol_usuario_taller(taller) in ('propietario', 'administrador');
$$;

create or replace function public.puede_gestionar_miembros_taller(p_taller_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.tiene_permiso_taller(p_taller_id, 'gestionar_miembros');
$$;

create or replace function public.puede_asignar_rol_taller(p_taller_id uuid, p_rol public.rol_taller)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case public.rol_usuario_taller(p_taller_id)
    when 'propietario' then p_rol <> 'propietario'
    when 'administrador' then p_rol in ('encargado', 'mecanico', 'inventario', 'visualizador')
    else false
  end;
$$;

create or replace function public.cambiar_rol_miembro_taller(p_miembro_id uuid, p_rol public.rol_taller)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_miembro public.miembros_taller%rowtype;
  v_rol_actor public.rol_taller;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion';
  end if;

  select *
  into v_miembro
  from public.miembros_taller
  where id = p_miembro_id
  for update;

  if v_miembro.id is null then
    raise exception 'Miembro no encontrado';
  end if;

  v_rol_actor := public.rol_usuario_taller(v_miembro.taller_id);

  if v_rol_actor is null then
    raise exception 'No tienes permisos en este taller';
  end if;

  if v_miembro.rol = 'propietario' or p_rol = 'propietario' then
    raise exception 'La propiedad solo se cambia con transferir_propiedad_taller';
  end if;

  if not public.puede_asignar_rol_taller(v_miembro.taller_id, p_rol) then
    raise exception 'No tienes permiso para asignar este rol';
  end if;

  if v_rol_actor = 'administrador' and v_miembro.rol = 'administrador' then
    raise exception 'Solo el propietario puede modificar administradores';
  end if;

  update public.miembros_taller
  set rol = p_rol
  where id = p_miembro_id;

  return true;
end;
$$;

create or replace function public.eliminar_miembro_taller(p_miembro_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_miembro public.miembros_taller%rowtype;
  v_rol_actor public.rol_taller;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion';
  end if;

  select *
  into v_miembro
  from public.miembros_taller
  where id = p_miembro_id
  for update;

  if v_miembro.id is null then
    raise exception 'Miembro no encontrado';
  end if;

  v_rol_actor := public.rol_usuario_taller(v_miembro.taller_id);

  if v_rol_actor is null then
    raise exception 'No tienes permisos en este taller';
  end if;

  if v_miembro.rol = 'propietario' then
    raise exception 'No se puede eliminar al propietario actual';
  end if;

  if v_rol_actor = 'administrador' and v_miembro.rol = 'administrador' then
    raise exception 'Solo el propietario puede eliminar administradores';
  end if;

  if v_rol_actor <> 'propietario' and not public.puede_gestionar_miembros_taller(v_miembro.taller_id) then
    raise exception 'No tienes permiso para eliminar miembros';
  end if;

  delete from public.miembros_taller
  where id = p_miembro_id;

  return true;
end;
$$;

create or replace function public.transferir_propiedad_taller(
  p_taller_id uuid,
  p_nuevo_propietario_miembro_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_propietario_actual uuid;
begin
  if not public.es_propietario_taller(p_taller_id) then
    raise exception 'Solo el propietario actual puede transferir la propiedad';
  end if;

  select id
  into v_propietario_actual
  from public.miembros_taller
  where taller_id = p_taller_id
    and estado = 'activo'
    and rol = 'propietario'
  for update;

  if v_propietario_actual is null then
    raise exception 'El taller no tiene propietario activo';
  end if;

  if not exists (
    select 1
    from public.miembros_taller
    where id = p_nuevo_propietario_miembro_id
      and taller_id = p_taller_id
      and estado = 'activo'
  ) then
    raise exception 'El nuevo propietario debe ser un miembro activo del taller';
  end if;

  update public.miembros_taller
  set rol = 'administrador'
  where id = v_propietario_actual;

  update public.miembros_taller
  set rol = 'propietario'
  where id = p_nuevo_propietario_miembro_id;

  return true;
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
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion';
  end if;

  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if v_email = '' then
    raise exception 'Tu cuenta no tiene un correo valido';
  end if;

  update public.miembros_taller
  set usuario_id = auth.uid(),
      estado = 'activo'
  where email = v_email
    and usuario_id is null;

  return true;
end;
$$;

create or replace function public.generar_invitacion_taller(p_taller_id uuid, p_rol text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text;
  v_rol public.rol_taller;
begin
  v_rol := p_rol::public.rol_taller;

  if not public.puede_gestionar_miembros_taller(p_taller_id) then
    raise exception 'Solo un administrador activo puede generar invitaciones';
  end if;

  if not public.puede_asignar_rol_taller(p_taller_id, v_rol) then
    raise exception 'No tienes permiso para invitar con este rol';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');

  update public.invitaciones_taller
  set revocado_en = now()
  where taller_id = p_taller_id
    and revocado_en is null;

  insert into public.invitaciones_taller (taller_id, token_hash, rol, creado_por)
  values (p_taller_id, public.hash_invitacion_taller(v_token), v_rol, auth.uid());

  return v_token;
end;
$$;

create or replace function public.eliminar_taller(p_taller_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  filas_eliminadas integer := 0;
begin
  if not public.es_propietario_taller(p_taller_id) then
    raise exception 'Solo el propietario activo puede eliminar este taller';
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

drop policy if exists talleres_actualizar_admin on public.talleres;
drop policy if exists talleres_eliminar_admin on public.talleres;
drop policy if exists miembros_primer_admin on public.miembros_taller;
drop policy if exists miembros_admin_insertar on public.miembros_taller;
drop policy if exists miembros_admin_actualizar on public.miembros_taller;
drop policy if exists miembros_admin_eliminar on public.miembros_taller;
drop policy if exists repuestos_admin_insertar on public.repuestos;
drop policy if exists repuestos_admin_actualizar on public.repuestos;
drop policy if exists repuestos_admin_eliminar on public.repuestos;
drop policy if exists movimientos_miembros_insertar on public.movimientos_stock;
drop policy if exists auditoria_ver_admin on public.auditoria;

create policy talleres_actualizar_gestor on public.talleres
for update using (public.tiene_permiso_taller(id, 'gestionar_taller'))
with check (public.tiene_permiso_taller(id, 'gestionar_taller'));

create policy talleres_eliminar_propietario on public.talleres
for delete using (public.es_propietario_taller(id));

create policy miembros_primer_propietario on public.miembros_taller
for insert with check (
  usuario_id = auth.uid()
  and rol = 'propietario'
  and estado = 'activo'
  and not exists (
    select 1
    from public.miembros_taller existente
    where existente.taller_id = miembros_taller.taller_id
  )
);

create policy miembros_gestor_insertar on public.miembros_taller
for insert with check (
  public.puede_gestionar_miembros_taller(taller_id)
  and public.puede_asignar_rol_taller(taller_id, rol)
);

create policy repuestos_gestor_insertar on public.repuestos
for insert with check (public.tiene_permiso_taller(taller_id, 'gestionar_inventario'));

create policy repuestos_gestor_actualizar on public.repuestos
for update using (public.tiene_permiso_taller(taller_id, 'gestionar_inventario'))
with check (public.tiene_permiso_taller(taller_id, 'gestionar_inventario'));

create policy repuestos_gestor_eliminar on public.repuestos
for delete using (public.tiene_permiso_taller(taller_id, 'gestionar_inventario'));

create policy movimientos_operador_insertar on public.movimientos_stock
for insert with check (
  usuario_id = auth.uid()
  and public.tiene_permiso_taller(taller_id, 'registrar_movimientos')
);

create policy auditoria_ver_gestor on public.auditoria
for select using (taller_id is not null and public.tiene_permiso_taller(taller_id, 'gestionar_taller'));

revoke all on function public.cambiar_rol_miembro_taller(uuid, public.rol_taller) from public;
revoke all on function public.eliminar_miembro_taller(uuid) from public;
revoke all on function public.transferir_propiedad_taller(uuid, uuid) from public;
revoke all on function public.reclamar_invitaciones_pendientes() from public;

grant execute on function public.cambiar_rol_miembro_taller(uuid, public.rol_taller) to authenticated;
grant execute on function public.eliminar_miembro_taller(uuid) to authenticated;
grant execute on function public.transferir_propiedad_taller(uuid, uuid) to authenticated;
grant execute on function public.reclamar_invitaciones_pendientes() to authenticated;
