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
    return responder({ error: 'Metodo no permitido' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const authorization = req.headers.get('Authorization')
  const token = authorization?.replace('Bearer ', '').trim()

  if (!supabaseUrl || !serviceRoleKey) {
    return responder({ error: 'Servicio no configurado' }, 500)
  }

  if (!token) {
    return responder({ error: 'Sesion requerida' }, 401)
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
    return responder({ error: 'Sesion invalida' }, 401)
  }

  try {
    const desactivadoEn = new Date().toISOString()
    const email = user.email?.toLowerCase() ?? `${user.id}@sin-email.local`
    const desactivacion = {
      estado: 'desactivado',
      desactivado_en: desactivadoEn,
      desactivado_por: user.id,
      motivo_desactivacion: 'Solicitud del usuario desde la app',
    }

    const { data: perfilActualizado, error: perfilUpdateError } = await supabaseAdmin
      .from('perfiles')
      .update(desactivacion)
      .eq('id', user.id)
      .select('id')
      .maybeSingle()

    if (perfilUpdateError) throw perfilUpdateError

    if (!perfilActualizado) {
      const { error: perfilInsertError } = await supabaseAdmin.from('perfiles').insert({
        id: user.id,
        email,
        ...desactivacion,
      })

      if (perfilInsertError) throw perfilInsertError
    }

    const { error: bloqueoError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      ban_duration: '876000h',
    })

    if (bloqueoError) {
      console.warn('La cuenta fue desactivada en perfiles, pero no se pudo bloquear Auth', bloqueoError)
    }

    return responder({ ok: true })
  } catch (error) {
    console.error('No se pudo desactivar la cuenta', error)
    return responder({ error: 'No se pudo desactivar la cuenta' }, 500)
  }
})
