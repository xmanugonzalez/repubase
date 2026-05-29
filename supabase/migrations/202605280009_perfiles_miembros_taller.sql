create or replace function public.perfil_comparte_taller(perfil_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select perfil_id = auth.uid()
    or exists (
      select 1
      from public.miembros_taller objetivo
      join public.miembros_taller actual on actual.taller_id = objetivo.taller_id
      where objetivo.usuario_id = perfil_id
        and objetivo.estado = 'activo'
        and actual.estado = 'activo'
        and (
          actual.usuario_id = auth.uid()
          or actual.email = lower(coalesce(auth.jwt() ->> 'email', ''))
        )
    );
$$;

drop policy if exists perfiles_ver_miembros_taller on public.perfiles;

create policy perfiles_ver_miembros_taller on public.perfiles
for select using (public.perfil_comparte_taller(id));
