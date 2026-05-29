create or replace function public.agregar_miembro_taller_por_email(
  p_taller_id uuid,
  p_email text,
  p_rol text
)
returns table (
  resultado text,
  miembro_id uuid,
  email text,
  usuario_id uuid,
  rol public.rol_taller,
  estado public.estado_miembro
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_rol public.rol_taller;
  v_usuario_id uuid;
  v_miembro_email public.miembros_taller%rowtype;
  v_miembro_usuario public.miembros_taller%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion';
  end if;

  v_email := lower(trim(coalesce(p_email, '')));

  if v_email = '' or v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Ingresa un email valido';
  end if;

  if p_rol is null or not exists (
    select 1
    from unnest(enum_range(null::public.rol_taller)) as roles(rol_valor)
    where roles.rol_valor::text = p_rol
  ) then
    raise exception 'Rol invalido';
  end if;

  v_rol := p_rol::public.rol_taller;

  if not public.puede_gestionar_miembros_taller(p_taller_id) then
    raise exception 'No tienes permiso para agregar miembros';
  end if;

  if not public.puede_asignar_rol_taller(p_taller_id, v_rol) then
    raise exception 'No tienes permiso para asignar este rol';
  end if;

  select u.id
  into v_usuario_id
  from auth.users u
  where lower(u.email) = v_email
  limit 1;

  select *
  into v_miembro_email
  from public.miembros_taller mt
  where mt.taller_id = p_taller_id
    and mt.email = v_email
  for update;

  if v_usuario_id is not null then
    select *
    into v_miembro_usuario
    from public.miembros_taller mt
    where mt.taller_id = p_taller_id
      and mt.usuario_id = v_usuario_id
    for update;
  end if;

  if v_miembro_usuario.id is not null then
    if v_miembro_usuario.estado = 'activo' then
      return query
      select
        'ya_miembro'::text,
        v_miembro_usuario.id,
        v_miembro_usuario.email,
        v_miembro_usuario.usuario_id,
        v_miembro_usuario.rol,
        v_miembro_usuario.estado;
      return;
    end if;

    update public.miembros_taller mt
    set email = v_email,
        rol = v_rol,
        estado = 'activo'
    where mt.id = v_miembro_usuario.id
    returning mt.id, mt.email, mt.usuario_id, mt.rol, mt.estado
    into miembro_id, email, usuario_id, rol, estado;

    resultado := 'miembro_activado';
    return next;
    return;
  end if;

  if v_miembro_email.id is not null then
    if v_miembro_email.estado = 'activo' and v_miembro_email.usuario_id is not null then
      return query
      select
        'ya_miembro'::text,
        v_miembro_email.id,
        v_miembro_email.email,
        v_miembro_email.usuario_id,
        v_miembro_email.rol,
        v_miembro_email.estado;
      return;
    end if;

    update public.miembros_taller mt
    set usuario_id = v_usuario_id,
        rol = v_rol,
        estado = case when v_usuario_id is null then 'invitado'::public.estado_miembro else 'activo'::public.estado_miembro end
    where mt.id = v_miembro_email.id
    returning mt.id, mt.email, mt.usuario_id, mt.rol, mt.estado
    into miembro_id, email, usuario_id, rol, estado;

    resultado := case when v_usuario_id is null then 'invitacion_pendiente_actualizada' else 'miembro_activado' end;
    return next;
    return;
  end if;

  insert into public.miembros_taller (taller_id, usuario_id, email, rol, estado)
  values (
    p_taller_id,
    v_usuario_id,
    v_email,
    v_rol,
    case when v_usuario_id is null then 'invitado'::public.estado_miembro else 'activo'::public.estado_miembro end
  )
  returning miembros_taller.id, miembros_taller.email, miembros_taller.usuario_id, miembros_taller.rol, miembros_taller.estado
  into miembro_id, email, usuario_id, rol, estado;

  resultado := case when v_usuario_id is null then 'invitacion_pendiente' else 'miembro_activado' end;
  return next;
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
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion';
  end if;

  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if v_email = '' then
    raise exception 'Tu cuenta no tiene un correo valido';
  end if;

  for v_invitacion in
    select *
    from public.miembros_taller
    where email = v_email
      and usuario_id is null
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

revoke all on function public.agregar_miembro_taller_por_email(uuid, text, text) from public;
revoke all on function public.reclamar_invitaciones_pendientes() from public;

grant execute on function public.agregar_miembro_taller_por_email(uuid, text, text) to authenticated;
grant execute on function public.reclamar_invitaciones_pendientes() to authenticated;
