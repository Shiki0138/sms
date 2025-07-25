// テナントID管理ユーティリティ
import { supabase } from './supabase-client'

// 統一されたテナントID取得関数
export async function getUnifiedTenantId(user: any): Promise<string> {
  console.log('🔍 getUnifiedTenantId called with user:', user)
  
  // デモモードの場合
  if (user?.id === 'demo-user') {
    console.log('✅ Using demo-user as tenantId')
    return 'demo-user'
  }
  
  // Supabase認証ユーザーの場合
  try {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    
    if (supabaseUser) {
      console.log('✅ Using Supabase user ID as tenantId:', supabaseUser.id)
      return supabaseUser.id
    }
  } catch (error) {
    console.error('Failed to get Supabase user:', error)
  }
  
  // フォールバック
  const fallbackId = user?.id || 'default-tenant'
  console.log('⚠️ Using fallback tenantId:', fallbackId)
  return fallbackId
}

// デバッグ用：現在のテナントIDと保存されているデータを確認
export async function debugTenantData() {
  const { data: { user: supabaseUser } } = await supabase.auth.getUser()
  const { data: allSettings } = await supabase
    .from('holiday_settings')
    .select('*')
  
  console.log('🔍 Debug Tenant Data:')
  console.log('  - Supabase User:', supabaseUser)
  console.log('  - All Holiday Settings:', allSettings)
  
  return {
    supabaseUser,
    allSettings
  }
}