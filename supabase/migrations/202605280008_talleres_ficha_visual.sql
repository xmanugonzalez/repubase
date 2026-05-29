alter table public.talleres
add column if not exists whatsapp text,
add column if not exists email text,
add column if not exists ciudad text,
add column if not exists horario text,
add column if not exists servicios text,
add column if not exists notas text,
add column if not exists logo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('talleres', 'talleres', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists talleres_logos_ver_miembros on storage.objects;
drop policy if exists talleres_logos_insertar_admin on storage.objects;
drop policy if exists talleres_logos_actualizar_admin on storage.objects;
drop policy if exists talleres_logos_eliminar_admin on storage.objects;

create policy talleres_logos_ver_miembros on storage.objects
for select using (
  bucket_id = 'talleres'
  and public.es_miembro_activo(((storage.foldername(name))[1])::uuid)
);

create policy talleres_logos_insertar_admin on storage.objects
for insert with check (
  bucket_id = 'talleres'
  and public.es_administrador_taller(((storage.foldername(name))[1])::uuid)
);

create policy talleres_logos_actualizar_admin on storage.objects
for update using (
  bucket_id = 'talleres'
  and public.es_administrador_taller(((storage.foldername(name))[1])::uuid)
) with check (
  bucket_id = 'talleres'
  and public.es_administrador_taller(((storage.foldername(name))[1])::uuid)
);

create policy talleres_logos_eliminar_admin on storage.objects
for delete using (
  bucket_id = 'talleres'
  and public.es_administrador_taller(((storage.foldername(name))[1])::uuid)
);
