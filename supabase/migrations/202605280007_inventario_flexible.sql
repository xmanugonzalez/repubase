alter table public.repuestos
alter column codigo drop not null,
alter column marca drop not null,
alter column modelo drop not null,
alter column anio drop not null;

alter table public.repuestos
add column if not exists foto_url text,
add column if not exists atributos jsonb not null default '{}'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'repuestos',
  'repuestos',
  true,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists repuestos_fotos_ver_miembros on storage.objects;
drop policy if exists repuestos_fotos_crear_admin on storage.objects;
drop policy if exists repuestos_fotos_actualizar_admin on storage.objects;
drop policy if exists repuestos_fotos_eliminar_admin on storage.objects;

create policy repuestos_fotos_ver_miembros on storage.objects
for select using (
  bucket_id = 'repuestos'
  and public.es_miembro_activo(((storage.foldername(name))[1])::uuid)
);

create policy repuestos_fotos_crear_admin on storage.objects
for insert with check (
  bucket_id = 'repuestos'
  and public.es_administrador_taller(((storage.foldername(name))[1])::uuid)
);

create policy repuestos_fotos_actualizar_admin on storage.objects
for update using (
  bucket_id = 'repuestos'
  and public.es_administrador_taller(((storage.foldername(name))[1])::uuid)
) with check (
  bucket_id = 'repuestos'
  and public.es_administrador_taller(((storage.foldername(name))[1])::uuid)
);

create policy repuestos_fotos_eliminar_admin on storage.objects
for delete using (
  bucket_id = 'repuestos'
  and public.es_administrador_taller(((storage.foldername(name))[1])::uuid)
);
