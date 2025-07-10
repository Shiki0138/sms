import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 顧客データ操作
export const customersApi = {
  // 全顧客取得
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('createdAt', { ascending: false })
    
    if (error) throw error
    return data
  },

  // 顧客作成
  async create(customer: any) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 顧客更新
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 顧客削除
  async delete(id: string) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// 予約データ操作
export const reservationsApi = {
  // 予約一覧取得
  async getAll() {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        customer:customers(id, name, phone),
        staff:staff(id, name)
      `)
      .order('startTime', { ascending: true })
    
    if (error) throw error
    return data
  },

  // 予約作成
  async create(reservation: any) {
    const { data, error } = await supabase
      .from('reservations')
      .insert([reservation])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // 予約更新
  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('reservations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// 認証関連
export const authApi = {
  // ログイン
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    // スタッフ情報を取得
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .single()
    
    if (staffError) throw staffError
    
    return { user: data.user, staff: staffData }
  },

  // ログアウト
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // 現在のユーザー取得
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    const { data: staffData, error } = await supabase
      .from('staff')
      .select('*')
      .eq('email', user.email)
      .single()
    
    if (error) throw error
    return staffData
  }
}