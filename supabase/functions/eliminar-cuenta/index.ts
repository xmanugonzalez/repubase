import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const responder = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return responder({ error: 'Método no permitido' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authorization = req.headers.get('Authorization')
  const token = authorization?.replace('Bearer ', '').trim()

  if (!supabaseUrl || !serviceRoleKey) {
    return responder({ error: 'Servicio no configurado' }, 500)
  }

  if (!token) {
    return responder({ error: 'Sesión requerida' }, 401)
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user) {
    return responder({ error: 'Sesión inválida' }, 401)
  }

  const email = user.email?.toLowerCase() ?? ''

  try {
    const { data: membresias, error: membresiasError } = await supabaseAdmin
      .from('miembros_taller')
      .select('id,taller_id,usuario_id,email,estado')
      .or(`usuario_id.eq.${user.id},email.eq.${email}`)

    if (membresiasError) throw membresiasError

    const tallerIds = [...new Set((membresias ?? []).map((miembro) => miembro.taller_id))]

    for (const tallerId of tallerIds) {
      const { data: miembrosActivos, error: miembrosActivosError } = await supabaseAdmin
        .from('miembros_taller')
        .select('id,usuario_id,email,estado')
        .eq('taller_id', tallerId)
        .eq('estado', 'activo')

      if (miembrosActivosError) throw miembrosActivosError

      const tieneOtroMiembroActivo = (miembrosActivos ?? []).some(
        (miembro) => miembro.usuario_id !== user.id && miembro.email !== email,
      )

      if (tieneOtroMiembroActivo) continue

      const { error: movimientosError } = await supabaseAdmin.from('movimientos_stock').delete().eq('taller_id', tallerId)
      if (movimientosError) throw movimientosError

      const { error: repuestosError } = await supabaseAdmin.from('repuestos').delete().eq('taller_id', tallerId)
      if (repuestosError) throw repuestosError

      const { error: miembrosError } = await supabaseAdmin.from('miembros_taller').delete().eq('taller_id', tallerId)
      if (miembrosError) throw miembrosError

      const { error: talleresError } = await supabaseAdmin.from('talleres').delete().eq('id', tallerId)
      if (talleresError) throw talleresError
    }

    const { error: membresiaUsuarioError } = await supabaseAdmin
      .from('miembros_taller')
      .delete()
      .or(`usuario_id.eq.${user.id},email.eq.${email}`)

    if (membresiaUsuarioError) throw membresiaUsuarioError

    const { data: avatares } = await supabaseAdmin.storage.from('avatares').list(user.id)
    const rutasAvatar = (avatares ?? []).map((archivo) => `${user.id}/${archivo.name}`)

    if (rutasAvatar.length > 0) {
      await supabaseAdmin.storage.from('avatares').remove(rutasAvatar)
    }

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteUserError) throw deleteUserError

    return responder({ ok: true })
  } catch (error) {
    console.error('No se pudo eliminar la cuenta', error)
    return responder({ error: 'No se pudo eliminar la cuenta' }, 500)
  }
})
