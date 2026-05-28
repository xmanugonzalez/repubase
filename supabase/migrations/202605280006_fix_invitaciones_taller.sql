-- Fix: Asegurar que pgcrypto en el esquema extensions (o public) sea accesible.
-- Eliminamos el set search_path restrictivo en hash_invitacion_taller para heredar o lo seteamos a public, extensions.

create or replace function public.hash_invitacion_taller(p_token text)
returns text
language sql
immutable
set search_path = public, extensions
as $$
  select encode(digest(p_token, 'sha256'), 'hex');
$$;

drop function if exists public.generar_invitacion_taller(uuid, public.rol_taller);

create or replace function public.generar_invitacion_taller(p_taller_id uuid, p_rol text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_token text;
begin
  if not public.es_administrador_taller(p_taller_id) then
    raise exception 'Solo un administrador activo puede generar invitaciones';
  end if;

  v_token := encode(gen_random_bytes(32), 'hex');

  update public.invitaciones_taller
  set revocado_en = now()
  where taller_id = p_taller_id
    and revocado_en is null;

  insert into public.invitaciones_taller (taller_id, token_hash, rol, creado_por)
  values (p_taller_id, public.hash_invitacion_taller(v_token), p_rol::public.rol_taller, auth.uid());

  return v_token;
end;
$$;

revoke all on function public.generar_invitacion_taller(uuid, text) from public;
grant execute on function public.generar_invitacion_taller(uuid, text) to authenticated;

create or replace function public.validar_invitacion_taller(p_token text)
returns table (
  valida boolean,
  taller_id uuid,
  taller_nombre text,
  rol public.rol_taller
)
language plpgsql
security definer
set search_path = public, extensions
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
set search_path = public, extensions
as $$
declare
  v_invitacion public.invitaciones_taller%rowtype;
  v_email text;
  v_miembro_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesion para aceptar la invitacion';
  end if;

  v_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  if v_email = '' then
    raise exception 'Tu cuenta no tiene un correo valido';
  end if;

  select *
  into v_invitacion
  from public.invitaciones_taller
  where token_hash = public.hash_invitacion_taller(p_token)
    and revocado_en is null
  limit 1;

  if v_invitacion.id is null then
    raise exception 'Invitacion invalida o regenerada';
  end if;

  select id
  into v_miembro_id
  from public.miembros_taller mt
  where mt.taller_id = v_invitacion.taller_id
    and (mt.usuario_id = auth.uid() or mt.email = v_email)
  order by mt.creado_en asc
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
  where t.id = v_invitacion.taller_id;
end;
$$;
