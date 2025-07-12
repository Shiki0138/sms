import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase-client'

export default function TestConnection() {
  const [status, setStatus] = useState<string>('接続確認中...')
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      // 1. Supabase接続テスト
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .limit(1)

      if (tenantsError) {
        setError(`Tenants取得エラー: ${tenantsError.message}`)
        return
      }

      // 2. スタッフ数を確認
      const { count: staffCount, error: staffError } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true })

      if (staffError) {
        setError(`Staff取得エラー: ${staffError.message}`)
        return
      }

      // 3. 顧客数を確認
      const { count: customerCount, error: customerError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      if (customerError) {
        setError(`Customers取得エラー: ${customerError.message}`)
        return
      }

      setStatus('✅ Supabase接続成功！')
      setData({
        tenants: tenants?.length || 0,
        staff: staffCount || 0,
        customers: customerCount || 0
      })
    } catch (err) {
      setError(`接続エラー: ${err}`)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      backgroundColor: '#f5f5f5'
    }}>
      <h3>Supabase接続テスト</h3>
      <p>ステータス: {status}</p>
      {error && (
        <p style={{ color: 'red' }}>エラー: {error}</p>
      )}
      {data && (
        <div>
          <h4>データベース情報:</h4>
          <ul>
            <li>テナント数: {data.tenants}</li>
            <li>スタッフ数: {data.staff}</li>
            <li>顧客数: {data.customers}</li>
          </ul>
        </div>
      )}
      <hr />
      <h4>環境変数:</h4>
      <ul>
        <li>SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定'}</li>
        <li>SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定'}</li>
        <li>ENABLE_LOGIN: {import.meta.env.VITE_ENABLE_LOGIN}</li>
      </ul>
    </div>
  )
}