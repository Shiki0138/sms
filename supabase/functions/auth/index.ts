import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // CORS対応
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { email, password } = await req.json()

    // スタッフ検索
    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !staff) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'メールアドレスまたはパスワードが正しくありません'
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // パスワード検証
    const validPassword = await bcrypt.compare(password, staff.password)
    
    if (!validPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'メールアドレスまたはパスワードが正しくありません'
        }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // 簡易JWT作成（本番では適切なJWTライブラリを使用）
    const token = btoa(JSON.stringify({
      id: staff.id,
      email: staff.email,
      role: staff.role,
      tenantId: staff.tenantId,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24時間
    }))

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          role: staff.role,
          tenantId: staff.tenantId
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})