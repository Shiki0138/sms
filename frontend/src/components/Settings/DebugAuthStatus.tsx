import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase-client'
import { useAuth } from '../../contexts/AuthContext'

const DebugAuthStatus: React.FC = () => {
  const { user } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [supabaseUser, setSupabaseUser] = useState<any>(null)
  
  useEffect(() => {
    const checkAuth = async () => {
      // セッション情報を取得
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      setSessionInfo({ session, error: sessionError })
      
      // ユーザー情報を取得
      const { data: { user: sbUser }, error: userError } = await supabase.auth.getUser()
      setSupabaseUser({ user: sbUser, error: userError })
    }
    
    checkAuth()
  }, [])
  
  return (
    <div className="fixed bottom-20 left-10 bg-purple-50 border-2 border-purple-600 p-4 rounded-lg z-50 max-w-md">
      <h4 className="font-bold text-purple-900 mb-2">🔐 認証状態デバッグ</h4>
      
      <div className="space-y-2 text-xs">
        <div>
          <strong>AuthContext User:</strong>
          <pre className="bg-white p-1 rounded mt-1 overflow-auto max-h-20">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
        
        <div>
          <strong>Supabase Session:</strong>
          <pre className="bg-white p-1 rounded mt-1 overflow-auto max-h-20">
            {sessionInfo ? JSON.stringify({
              hasSession: !!sessionInfo.session,
              userId: sessionInfo.session?.user?.id,
              email: sessionInfo.session?.user?.email,
              error: sessionInfo.error?.message
            }, null, 2) : 'Loading...'}
          </pre>
        </div>
        
        <div>
          <strong>Supabase User:</strong>
          <pre className="bg-white p-1 rounded mt-1 overflow-auto max-h-20">
            {supabaseUser ? JSON.stringify({
              hasUser: !!supabaseUser.user,
              userId: supabaseUser.user?.id,
              email: supabaseUser.user?.email,
              error: supabaseUser.error?.message
            }, null, 2) : 'Loading...'}
          </pre>
        </div>
        
        <button 
          onClick={async () => {
            const { data: { session } } = await supabase.auth.getSession()
            console.log('Current Supabase session:', session)
            alert(`セッション: ${session ? 'あり' : 'なし'}\nユーザーID: ${session?.user?.id || 'なし'}`)
          }}
          className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700"
        >
          セッション確認
        </button>
      </div>
    </div>
  )
}

export default DebugAuthStatus