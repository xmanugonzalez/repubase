drop policy if exists talleres_eliminar_admin on public.talleres;

create policy talleres_eliminar_admin on public.talleres
for delete using (public.es_administrador_taller(id));
