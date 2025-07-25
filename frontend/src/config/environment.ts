// 環境変数の管理とフォールバック値
export const getEnvConfig = () => {
  return {
    // Supabase設定（デフォルト値を提供）
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://fqwdbywgknavgwqpnlkj.supabase.co',
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2RieXdna25hdmd3cXBubGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzc2MDQsImV4cCI6MjA2Njc1MzYwNH0._CJ-IvMB1JqotdMQla75qj8U8SFZkEsEi2YWJSeHpMM',
    
    // 認証設定
    ENABLE_LOGIN: import.meta.env.VITE_ENABLE_LOGIN === 'true' || false,
    
    // API設定
    API_URL: import.meta.env.VITE_API_URL || '/api',
    
    // 環境判定
    IS_PRODUCTION: import.meta.env.PROD,
    IS_DEVELOPMENT: import.meta.env.DEV,
  }
}

// 環境変数が設定されているかチェック
export const checkRequiredEnvVars = () => {
  const config = getEnvConfig()
  const missing: string[] = []
  
  // 本番環境では警告のみ（ビルドエラーを防ぐ）
  if (!import.meta.env.VITE_SUPABASE_URL && config.IS_PRODUCTION) {
    console.warn('VITE_SUPABASE_URL is not set, using default value')
  }
  
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY && config.IS_PRODUCTION) {
    console.warn('VITE_SUPABASE_ANON_KEY is not set, using default value')
  }
  
  return missing
}