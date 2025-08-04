import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MGMT_API_TOKEN = Deno.env.get('MGMT_API_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')

// The project ID is the subdomain of your Supabase URL
const PROJECT_ID = new URL(SUPABASE_URL!).hostname.split('.')[0]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // First, ensure the user is authenticated
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch storage stats from the Supabase Management API
    const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_ID}/storage`, {
      headers: {
        'Authorization': `Bearer ${MGMT_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch storage data: ${await res.text()}`)
    }

    const storageData = await res.json()

    return new Response(JSON.stringify(storageData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})