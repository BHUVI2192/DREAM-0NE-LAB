import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.177.0/node/crypto.ts'

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
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const authHeader = req.headers.get('Authorization')!
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            throw new Error('Unauthorized')
        }

        const { userId, bookId, isSpecial } = await req.json()

        if (!userId || userId !== user.id) {
            throw new Error('Invalid user')
        }

        // PhonePe configuration
        const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID')!
        const saltKey = Deno.env.get('PHONEPE_SALT_KEY')!
        const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX') || '1'
        const apiEndpoint = Deno.env.get('PHONEPE_API_ENDPOINT') || 'https://api-preprod.phonepe.com/apis/pg-sandbox'

        // Create transaction
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const amount = isSpecial ? 4900 : 7900 // Amount in paise

        const payload = {
            merchantId,
            merchantTransactionId: transactionId,
            merchantUserId: userId.replace(/-/g, '').substring(0, 32),
            amount,
            redirectUrl: `${Deno.env.get('APP_URL')}/payment/callback`,
            redirectMode: 'REDIRECT',
            callbackUrl: `${supabaseUrl}/functions/v1/phonepe-callback`,
            mobileNumber: user.phone || '',
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        }

        // Generate checksum
        const base64Payload = btoa(JSON.stringify(payload))
        const stringToHash = base64Payload + '/pg/v1/pay' + saltKey
        const hmac = createHmac('sha256', saltKey)
        hmac.update(stringToHash)
        const checksum = hmac.digest('hex') + '###' + saltIndex

        // Create purchase record
        const { error: purchaseError } = await supabase
            .from('purchases')
            .insert({
                user_id: userId,
                book_id: isSpecial ? bookId : null,
                payment_ref: transactionId,
                amount_inr: amount / 100,
                payment_status: 'pending',
                is_special: isSpecial
            })

        if (purchaseError) {
            throw purchaseError
        }

        // Make API call to PhonePe
        const response = await fetch(`${apiEndpoint}/pg/v1/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            body: JSON.stringify({ request: base64Payload })
        })

        const result = await response.json()

        if (!result.success) {
            throw new Error(result.message || 'Payment initiation failed')
        }

        return new Response(
            JSON.stringify({
                success: true,
                transactionId,
                redirectUrl: result.data.instrumentResponse.redirectInfo.url
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
