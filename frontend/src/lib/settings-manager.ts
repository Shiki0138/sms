// 統一された設定管理システム
import { supabase } from './supabase-client'
import { getUnifiedTenantId } from './tenant-utils'

// 設定タイプの定義
interface HolidaySettings {
  weeklyClosedDays: number[]
  nthWeekdayRules: Array<{nth: number[], weekday: number}>
  specificHolidays: string[]
}

interface ApiSettings {
  service: string
  credentials: any
}

interface ServiceMenu {
  id: string
  tenantId?: string
  name: string
  description?: string
  price: number
  duration: number
  category: 'cut' | 'color' | 'perm' | 'treatment' | 'other'
  isActive: boolean
  displayOrder?: number
  createdAt: string
  updatedAt: string
}

interface PaymentMethod {
  id: string
  tenantId?: string
  name: string
  type: 'cash' | 'credit_card' | 'debit_card' | 'qr_payment' | 'bank_transfer' | 'other'
  isActive: boolean
  displayOrder?: number
  settings?: any
}

interface ReminderSettings {
  enableReminders: boolean
  reminderTiming: number
  reminderChannels: string[]
  reminderTemplate?: string
  enableConfirmation: boolean
  confirmationTiming: number
  enableFollowUp: boolean
  followUpTiming: number
}

// 休日設定の読み込み
export async function loadHolidaySettings(user: any): Promise<HolidaySettings | null> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log('📥 Loading holiday settings for tenant:', tenantId)
    
    const { data, error } = await supabase
      .from('holiday_settings')
      .select('*')
      .eq('tenantId', tenantId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No holiday settings found, returning defaults')
        return null
      }
      throw error
    }
    
    return {
      weeklyClosedDays: data.weekly_closed_days || [],
      nthWeekdayRules: data.nth_weekday_rules || [],
      specificHolidays: data.specific_holidays || []
    }
  } catch (error) {
    console.error('Failed to load holiday settings:', error)
    return null
  }
}

// 休日設定の保存
export async function saveHolidaySettings(user: any, settings: HolidaySettings): Promise<boolean> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log('💾 Saving holiday settings for tenant:', tenantId)
    
    const { error } = await supabase
      .from('holiday_settings')
      .upsert({
        tenantId,
        weekly_closed_days: settings.weeklyClosedDays,
        nth_weekday_rules: settings.nthWeekdayRules,
        specific_holidays: settings.specificHolidays,
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'tenantId'
      })
    
    if (error) throw error
    
    console.log('✅ Holiday settings saved successfully')
    return true
  } catch (error) {
    console.error('Failed to save holiday settings:', error)
    return false
  }
}

// API設定の読み込み
export async function loadApiSettings(user: any, service: string): Promise<ApiSettings | null> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log(`📥 Loading ${service} settings for tenant:`, tenantId)
    
    const { data, error } = await supabase
      .from('api_settings')
      .select('*')
      .eq('tenantId', tenantId)
      .eq('service', service)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`No ${service} settings found`)
        return null
      }
      throw error
    }
    
    return {
      service: data.service,
      credentials: data.credentials
    }
  } catch (error) {
    console.error(`Failed to load ${service} settings:`, error)
    return null
  }
}

// API設定の保存
export async function saveApiSettings(user: any, service: string, credentials: any): Promise<boolean> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log(`💾 Saving ${service} settings for tenant:`, tenantId)
    
    const { error } = await supabase
      .from('api_settings')
      .upsert({
        tenantId,
        service,
        credentials,
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'tenantId,service'
      })
    
    if (error) throw error
    
    console.log(`✅ ${service} settings saved successfully`)
    return true
  } catch (error) {
    console.error(`Failed to save ${service} settings:`, error)
    return false
  }
}

// リアルタイムサブスクリプションの設定
export async function subscribeToHolidaySettings(user: any, callback: (settings: HolidaySettings) => void) {
  const tenantId = await getUnifiedTenantId(user)
  
  const subscription = supabase
    .channel(`holiday_settings_changes_${tenantId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'holiday_settings',
      filter: `tenantId=eq.${tenantId}`
    }, (payload) => {
      console.log('🔄 Holiday settings changed:', payload)
      if (payload.new) {
        callback({
          weeklyClosedDays: payload.new.weekly_closed_days || [],
          nthWeekdayRules: payload.new.nth_weekday_rules || [],
          specificHolidays: payload.new.specific_holidays || []
        })
      }
    })
    .subscribe()
  
  return subscription
}

// メニュー設定の読み込み
export async function loadServiceMenus(user: any): Promise<ServiceMenu[]> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log('📥 Loading service menus for tenant:', tenantId)
    
    const { data, error } = await supabase
      .from('service_menus')
      .select('*')
      .eq('tenantId', tenantId)
      .order('displayOrder', { ascending: true })
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Failed to load service menus:', error)
    return []
  }
}

// メニュー設定の保存
export async function saveServiceMenu(user: any, menu: Partial<ServiceMenu>): Promise<ServiceMenu | null> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log('💾 Saving service menu for tenant:', tenantId)
    
    const menuData = {
      ...menu,
      tenantId,
      updatedAt: new Date().toISOString()
    }
    
    if (menu.id) {
      // Update existing
      const { data, error } = await supabase
        .from('service_menus')
        .update(menuData)
        .eq('id', menu.id)
        .eq('tenantId', tenantId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } else {
      // Create new
      const { data, error } = await supabase
        .from('service_menus')
        .insert({
          ...menuData,
          createdAt: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  } catch (error) {
    console.error('Failed to save service menu:', error)
    return null
  }
}

// メニューの削除
export async function deleteServiceMenu(user: any, menuId: string): Promise<boolean> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log('🗑️ Deleting service menu:', menuId)
    
    const { error } = await supabase
      .from('service_menus')
      .delete()
      .eq('id', menuId)
      .eq('tenantId', tenantId)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to delete service menu:', error)
    return false
  }
}

// 支払い方法の読み込み
export async function loadPaymentMethods(user: any): Promise<PaymentMethod[]> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log('📥 Loading payment methods for tenant:', tenantId)
    
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('tenantId', tenantId)
      .order('displayOrder', { ascending: true })
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Failed to load payment methods:', error)
    return []
  }
}

// 支払い方法の保存
export async function savePaymentMethod(user: any, method: Partial<PaymentMethod>): Promise<boolean> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log('💾 Saving payment method for tenant:', tenantId)
    
    const methodData = {
      ...method,
      tenantId,
      updatedAt: new Date().toISOString()
    }
    
    if (method.id) {
      // Update existing
      const { error } = await supabase
        .from('payment_methods')
        .update(methodData)
        .eq('id', method.id)
        .eq('tenantId', tenantId)
      
      if (error) throw error
    } else {
      // Create new
      const { error } = await supabase
        .from('payment_methods')
        .insert({
          ...methodData,
          createdAt: new Date().toISOString()
        })
      
      if (error) throw error
    }
    
    return true
  } catch (error) {
    console.error('Failed to save payment method:', error)
    return false
  }
}

// リマインダー設定の読み込み
export async function loadReminderSettings(user: any): Promise<ReminderSettings | null> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log('📥 Loading reminder settings for tenant:', tenantId)
    
    const { data, error } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('tenantId', tenantId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No reminder settings found, returning defaults')
        return null
      }
      throw error
    }
    
    return {
      enableReminders: data.enableReminders,
      reminderTiming: data.reminderTiming,
      reminderChannels: data.reminderChannels,
      reminderTemplate: data.reminderTemplate,
      enableConfirmation: data.enableConfirmation,
      confirmationTiming: data.confirmationTiming,
      enableFollowUp: data.enableFollowUp,
      followUpTiming: data.followUpTiming
    }
  } catch (error) {
    console.error('Failed to load reminder settings:', error)
    return null
  }
}

// リマインダー設定の保存
export async function saveReminderSettings(user: any, settings: ReminderSettings): Promise<boolean> {
  try {
    const tenantId = await getUnifiedTenantId(user)
    console.log('💾 Saving reminder settings for tenant:', tenantId)
    
    const { error } = await supabase
      .from('reminder_settings')
      .upsert({
        tenantId,
        enableReminders: settings.enableReminders,
        reminderTiming: settings.reminderTiming,
        reminderChannels: settings.reminderChannels,
        reminderTemplate: settings.reminderTemplate,
        enableConfirmation: settings.enableConfirmation,
        confirmationTiming: settings.confirmationTiming,
        enableFollowUp: settings.enableFollowUp,
        followUpTiming: settings.followUpTiming,
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'tenantId'
      })
    
    if (error) throw error
    
    console.log('✅ Reminder settings saved successfully')
    return true
  } catch (error) {
    console.error('Failed to save reminder settings:', error)
    return false
  }
}

// デバッグ用：全設定を確認
export async function debugAllSettings(user: any) {
  const tenantId = await getUnifiedTenantId(user)
  console.log('🔍 Debugging all settings for tenant:', tenantId)
  
  // 休日設定
  const { data: holiday } = await supabase
    .from('holiday_settings')
    .select('*')
    .eq('tenantId', tenantId)
  
  // API設定
  const { data: api } = await supabase
    .from('api_settings')
    .select('*')
    .eq('tenantId', tenantId)
  
  // メニュー設定
  const { data: menus } = await supabase
    .from('service_menus')
    .select('*')
    .eq('tenantId', tenantId)
  
  // 支払い方法
  const { data: payments } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('tenantId', tenantId)
  
  // リマインダー設定
  const { data: reminder } = await supabase
    .from('reminder_settings')
    .select('*')
    .eq('tenantId', tenantId)
  
  console.log('Holiday Settings:', holiday)
  console.log('API Settings:', api)
  console.log('Service Menus:', menus)
  console.log('Payment Methods:', payments)
  console.log('Reminder Settings:', reminder)
  
  return { holiday, api, menus, payments, reminder }
}