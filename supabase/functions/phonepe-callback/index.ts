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

        const { merchantTransactionId } = await req.json()

        if (!merchantTransactionId) {
            throw new Error('Transaction ID required')
        }

        // PhonePe configuration
        const merchantId = Deno.env.get('PHONEPE_MERCHANT_ID')!
        const saltKey = Deno.env.get('PHONEPE_SALT_KEY')!
        const saltIndex = Deno.env.get('PHONEPE_SALT_INDEX') || '1'
        const apiEndpoint = Deno.env.get('PHONEPE_API_ENDPOINT') || 'https://api-preprod.phonepe.com/apis/pg-sandbox'

        // Verify transaction status
        const statusUrl = `${apiEndpoint}/pg/v1/status/${merchantId}/${merchantTransactionId}`
        const stringToHash = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + saltKey
        const hmac = createHmac('sha256', saltKey)
        hmac.update(stringToHash)
        const checksum = hmac.digest('hex') + '###' + saltIndex

        const response = await fetch(statusUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': merchantId
            }
        })

        const result = await response.json()

        if (!result.success) {
            throw new Error('Transaction verification failed')
        }

        const paymentStatus = result.data.state

        // Update purchase record
        const { data: purchase, error: fetchError } = await supabase
            .from('purchases')
            .select('*')
            .eq('payment_ref', merchantTransactionId)
            .single()

        if (fetchError || !purchase) {
            throw new Error('Purchase not found')
        }

        const payment_status = paymentStatus === 'COMPLETED' ? 'success' : 'failed'

        const { error: updateError } = await supabase
            .from('purchases')
            .update({
                payment_status,
                phonepe_transaction_id: result.data.transactionId
            })
            .eq('payment_ref', merchantTransactionId)

        if (updateError) {
            throw updateError
        }

        // If successful, extend subscription or grant access
        if (payment_status === 'success') {
            if (purchase.is_special) {
                // Special book purchase - access is automatic via purchases table
                console.log(`Special book ${purchase.book_id} unlocked for user ${purchase.user_id}`)
            } else {
                // Subscription - extend by 30 days
                const { error: subError } = await supabase.rpc('extend_subscription', {
                    user_uuid: purchase.user_id,
                    days: 30
                })

                if (subError) {
                    console.error('Subscription extension error:', subError)
                }
            }
        }

        // Redirect user
        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
        const redirectUrl = `${appUrl}/payment/result?status=${payment_status === 'success' ? 'success' : 'failure'}`

        return new Response(null, {
            status: 302,
            headers: {
                'Location': redirectUrl
            }
        })

    } catch (error) {
        console.error('Callback error:', error)
        const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'
        return new Response(null, {
            status: 302,
            headers: {
                'Location': `${appUrl}/payment/result?status=failure`
            }
        })
    }
})
