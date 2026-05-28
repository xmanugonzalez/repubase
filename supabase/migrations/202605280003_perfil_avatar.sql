alter table public.perfiles
add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatares',
  'avatares',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists avatares_ver_publico on storage.objects;
drop policy if exists avatares_crear_propio on storage.objects;
drop policy if exists avatares_actualizar_propio on storage.objects;
drop policy if exists avatares_eliminar_propio on storage.objects;

create policy avatares_ver_publico on storage.objects
for select using (bucket_id = 'avatares');

create policy avatares_crear_propio on storage.objects
for insert with check (
  bucket_id = 'avatares'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy avatares_actualizar_propio on storage.objects
for update using (
  bucket_id = 'avatares'
  and (storage.foldername(name))[1] = auth.uid()::text
) with check (
  bucket_id = 'avatares'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy avatares_eliminar_propio on storage.objects
for delete using (
  bucket_id = 'avatares'
  and (storage.foldername(name))[1] = auth.uid()::text
);
