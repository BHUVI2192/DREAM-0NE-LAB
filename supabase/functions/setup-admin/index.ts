import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const masterPassword = Deno.env.get('ADMIN_MASTER_PASSWORD')!
        
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { email, password, providedMasterPassword } = await req.json()

        // Verify master password
        if (providedMasterPassword !== masterPassword) {
            throw new Error('Invalid master password')
        }

        // Check if user already exists
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (existingProfile) {
            // User exists, just make them admin
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_admin: true })
                .eq('id', existingProfile.id)

            if (updateError) throw updateError

            return new Response(
                JSON.stringify({ success: true, message: 'User promoted to admin' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Create new admin user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        })

        if (authError) throw authError

        // Update profile to admin
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('id', authData.user.id)

        if (profileError) throw profileError

        return new Response(
            JSON.stringify({ success: true, message: 'Admin user created successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
