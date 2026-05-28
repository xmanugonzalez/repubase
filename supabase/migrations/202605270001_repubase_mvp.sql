create extension if not exists pgcrypto;

create type public.rol_taller as enum ('administrador', 'mecanico');
create type public.estado_miembro as enum ('activo', 'inactivo', 'invitado');
create type public.estado_repuesto as enum ('disponible', 'reservado', 'usado', 'descartado');
create type public.tipo_movimiento as enum ('entrada', 'salida', 'ajuste');

create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  email text not null unique,
  creado_en timestamptz not null default now()
);

create table public.talleres (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  telefono text,
  creado_por uuid not null references auth.users(id),
  creado_en timestamptz not null default now()
);

create table public.miembros_taller (
  id uuid primary key default gen_random_uuid(),
  taller_id uuid not null references public.talleres(id) on delete cascade,
  usuario_id uuid references auth.users(id) on delete cascade,
  email text not null,
  rol public.rol_taller not null default 'mecanico',
  estado public.estado_miembro not null default 'invitado',
  creado_en timestamptz not null default now(),
  constraint miembros_taller_email_normalizado check (email = lower(email)),
  constraint miembros_taller_usuario_o_invitacion check (usuario_id is not null or estado = 'invitado'),
  unique (taller_id, email),
  unique (taller_id, usuario_id)
);

create table public.repuestos (
  id uuid primary key default gen_random_uuid(),
  taller_id uuid not null references public.talleres(id) on delete cascade,
  codigo text not null,
  nombre text not null,
  marca text not null,
  modelo text not null,
  anio integer not null check (anio between 1900 and 2100),
  categoria text not null,
  estado public.estado_repuesto not null default 'disponible',
  precio numeric(12, 0) not null default 0 check (precio >= 0),
  stock integer not null default 0 check (stock >= 0),
  ubicacion text,
  descripcion text,
  ultimo_movimiento timestamptz,
  creado_por uuid not null references auth.users(id),
  actualizado_por uuid references auth.users(id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (taller_id, codigo)
);

create table public.movimientos_stock (
  id uuid primary key default gen_random_uuid(),
  taller_id uuid not null references public.talleres(id) on delete cascade,
  repuesto_id uuid not null references public.repuestos(id) on delete restrict,
  usuario_id uuid not null references auth.users(id),
  tipo public.tipo_movimiento not null,
  cantidad integer not null check (cantidad > 0),
  stock_anterior integer not null default 0,
  stock_nuevo integer not null default 0,
  motivo text not null,
  creado_en timestamptz not null default now()
);

create table public.auditoria (
  id uuid primary key default gen_random_uuid(),
  taller_id uuid references public.talleres(id) on delete set null,
  usuario_id uuid references auth.users(id) on delete set null,
  tabla text not null,
  accion text not null,
  registro_id uuid,
  descripcion text not null,
  datos jsonb,
  creado_en timestamptz not null default now()
);

create index repuestos_taller_idx on public.repuestos(taller_id);
create index repuestos_alertas_idx on public.repuestos(taller_id, stock, ultimo_movimiento);
create index movimientos_stock_taller_idx on public.movimientos_stock(taller_id, creado_en desc);
create index miembros_taller_usuario_idx on public.miembros_taller(usuario_id);
create index miembros_taller_email_idx on public.miembros_taller(email);

create or replace function public.es_miembro_activo(taller uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.miembros_taller mt
    where mt.taller_id = taller
      and mt.estado = 'activo'
      and (mt.usuario_id = auth.uid() or mt.email = lower(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;

create or replace function public.es_administrador_taller(taller uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.miembros_taller mt
    where mt.taller_id = taller
      and mt.estado = 'activo'
      and mt.rol = 'administrador'
      and (mt.usuario_id = auth.uid() or mt.email = lower(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;

create or replace function public.actualizar_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

create trigger repuestos_actualizado_en
before update on public.repuestos
for each row execute function public.actualizar_actualizado_en();

create or replace function public.aplicar_movimiento_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  stock_actual integer;
  stock_calculado integer;
begin
  select stock into stock_actual
  from public.repuestos
  where id = new.repuesto_id
    and taller_id = new.taller_id
  for update;

  if stock_actual is null then
    raise exception 'El repuesto no pertenece al taller indicado';
  end if;

  if new.tipo = 'entrada' then
    stock_calculado := stock_actual + new.cantidad;
  elsif new.tipo = 'salida' then
    stock_calculado := stock_actual - new.cantidad;
  else
    stock_calculado := new.cantidad;
  end if;

  if stock_calculado < 0 then
    raise exception 'El stock no puede quedar negativo';
  end if;

  new.stock_anterior := stock_actual;
  new.stock_nuevo := stock_calculado;

  update public.repuestos
  set stock = stock_calculado,
      ultimo_movimiento = now(),
      actualizado_por = new.usuario_id
  where id = new.repuesto_id;

  return new;
end;
$$;

create trigger movimientos_stock_aplicar
before insert on public.movimientos_stock
for each row execute function public.aplicar_movimiento_stock();

create or replace function public.registrar_auditoria()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  fila jsonb;
  taller uuid;
  registro uuid;
begin
  fila := to_jsonb(coalesce(new, old));
  taller := nullif(fila ->> 'taller_id', '')::uuid;
  registro := nullif(fila ->> 'id', '')::uuid;

  insert into public.auditoria (taller_id, usuario_id, tabla, accion, registro_id, descripcion, datos)
  values (
    taller,
    auth.uid(),
    tg_table_name,
    tg_op,
    registro,
    tg_op || ' en ' || tg_table_name,
    fila
  );

  return coalesce(new, old);
end;
$$;

create trigger auditoria_repuestos
after insert or update or delete on public.repuestos
for each row execute function public.registrar_auditoria();

create trigger auditoria_movimientos_stock
after insert on public.movimientos_stock
for each row execute function public.registrar_auditoria();

create trigger auditoria_miembros_taller
after insert or update or delete on public.miembros_taller
for each row execute function public.registrar_auditoria();

alter table public.perfiles enable row level security;
alter table public.talleres enable row level security;
alter table public.miembros_taller enable row level security;
alter table public.repuestos enable row level security;
alter table public.movimientos_stock enable row level security;
alter table public.auditoria enable row level security;

create policy perfiles_ver_propio on public.perfiles
for select using (id = auth.uid());

create policy perfiles_crear_propio on public.perfiles
for insert with check (id = auth.uid());

create policy perfiles_actualizar_propio on public.perfiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy talleres_ver_miembros on public.talleres
for select using (public.es_miembro_activo(id) or creado_por = auth.uid());

create policy talleres_crear_autenticado on public.talleres
for insert with check (creado_por = auth.uid());

create policy talleres_actualizar_admin on public.talleres
for update using (public.es_administrador_taller(id)) with check (public.es_administrador_taller(id));

create policy miembros_ver_taller on public.miembros_taller
for select using (
  public.es_miembro_activo(taller_id)
  or usuario_id = auth.uid()
  or email = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy miembros_primer_admin on public.miembros_taller
for insert with check (
  usuario_id = auth.uid()
  and rol = 'administrador'
  and estado = 'activo'
  and not exists (
    select 1
    from public.miembros_taller existente
    where existente.taller_id = miembros_taller.taller_id
  )
);

create policy miembros_admin_insertar on public.miembros_taller
for insert with check (public.es_administrador_taller(taller_id));

create policy miembros_admin_actualizar on public.miembros_taller
for update using (
  public.es_administrador_taller(taller_id)
  or email = lower(coalesce(auth.jwt() ->> 'email', ''))
) with check (
  public.es_administrador_taller(taller_id)
  or usuario_id = auth.uid()
);

create policy miembros_admin_eliminar on public.miembros_taller
for delete using (public.es_administrador_taller(taller_id));

create policy repuestos_ver_miembros on public.repuestos
for select using (public.es_miembro_activo(taller_id));

create policy repuestos_admin_insertar on public.repuestos
for insert with check (public.es_administrador_taller(taller_id));

create policy repuestos_admin_actualizar on public.repuestos
for update using (public.es_administrador_taller(taller_id)) with check (public.es_administrador_taller(taller_id));

create policy repuestos_admin_eliminar on public.repuestos
for delete using (public.es_administrador_taller(taller_id));

create policy movimientos_ver_miembros on public.movimientos_stock
for select using (public.es_miembro_activo(taller_id));

create policy movimientos_miembros_insertar on public.movimientos_stock
for insert with check (
  usuario_id = auth.uid()
  and public.es_miembro_activo(taller_id)
);

create policy auditoria_ver_admin on public.auditoria
for select using (taller_id is not null and public.es_administrador_taller(taller_id));

create or replace view public.alertas_stock_parado as
select
  r.*,
  extract(day from now() - coalesce(r.ultimo_movimiento, r.creado_en))::integer as dias_sin_movimiento
from public.repuestos r
where r.stock > 0
  and coalesce(r.ultimo_movimiento, r.creado_en) < now() - interval '90 days';
