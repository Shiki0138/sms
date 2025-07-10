import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import {
  AuthState,
  AuthContextType,
  LoginCredentials,
  User,
  Permission,
  PermissionAction,
  TEST_USERS,
  TEST_LOGIN_CREDENTIALS
} from '../types/auth'

// JWT トークンのデコード（簡易版）
const decodeJWT = (token: string): any => {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

// トークンの有効性チェック
const isTokenValid = (token: string): boolean => {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return false
  return decoded.exp * 1000 > Date.now()
}

// 簡易JWT生成（実際の本番環境では適切なJWTライブラリを使用）
const generateDemoJWT = (user: User): string => {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8時間有効
  }
  
  // Base64エンコード（デモ用、実際の本番環境では適切な署名が必要）
  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  const signature = btoa(`demo_signature_${user.id}`)
  
  return `${encodedHeader}.${encodedPayload}.${signature}`
}

// 認証状態の初期値
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: []
}

// 認証アクションの型
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'INIT_COMPLETE'; payload?: { user: User; token: string } }

// 認証リデューサー
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true
      }
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        permissions: action.payload.user.permissions
      }
    case 'LOGIN_FAILURE':
      return {
        ...initialState,
        isLoading: false
      }
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false
      }
    case 'INIT_COMPLETE':
      if (action.payload) {
        return {
          user: action.payload.user,
          token: action.payload.token,
          isAuthenticated: true,
          isLoading: false,
          permissions: action.payload.user.permissions
        }
      }
      return {
        ...initialState,
        isLoading: false
      }
    default:
      return state
  }
}

// 認証コンテキスト
const AuthContext = createContext<AuthContextType | null>(null)

// 認証プロバイダー
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // 初期化時にローカルストレージからトークンを確認
  useEffect(() => {
    const initAuth = () => {
      // ローカル環境でログインが無効の場合は、自動的に認証済みとして扱う
      const isLoginEnabled = false // ログイン機能を一時的に無効化
      
      if (!isLoginEnabled) {
        // ローカル環境用のダミーユーザー
        const demoUser: User = {
          id: 'demo-user',
          username: 'demo',
          email: 'demo@localhost',
          role: 'admin',
          isActive: true,
          permissions: [
            { resource: 'all', actions: ['read', 'write', 'delete', 'admin'] }
          ],
          profile: {
            name: 'デモユーザー',
            department: '管理部',
            position: 'システム管理者'
          },
          createdAt: new Date().toISOString()
        }
        dispatch({
          type: 'INIT_COMPLETE',
          payload: { user: demoUser, token: 'demo-token' }
        })
        return
      }

      // 本番環境では通常の認証チェック
      const storedToken = localStorage.getItem('salon_auth_token')
      const storedUser = localStorage.getItem('salon_auth_user')

      if (storedToken && storedUser && isTokenValid(storedToken)) {
        try {
          const user: User = JSON.parse(storedUser)
          dispatch({
            type: 'INIT_COMPLETE',
            payload: { user, token: storedToken }
          })
        } catch (error) {
          console.error('Failed to parse stored user data:', error)
          localStorage.removeItem('salon_auth_token')
          localStorage.removeItem('salon_auth_user')
          dispatch({ type: 'INIT_COMPLETE' })
        }
      } else {
        if (storedToken) {
          localStorage.removeItem('salon_auth_token')
          localStorage.removeItem('salon_auth_user')
        }
        dispatch({ type: 'INIT_COMPLETE' })
      }
    }

    initAuth()
  }, [])

  // ログイン
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'LOGIN_START' })

    // ローカル環境でログインが無効の場合は、ログイン処理をスキップ
    const isLoginEnabled = import.meta.env.VITE_ENABLE_LOGIN === 'true'
    if (!isLoginEnabled) {
      console.warn('ログイン機能は本番環境でのみ利用可能です')
      dispatch({ type: 'LOGIN_FAILURE' })
      return false
    }

    try {
      // バックエンドAPIに認証リクエスト送信
      const apiUrl = import.meta.env.VITE_API_URL || 'https://salon-management-system-one.vercel.app/api'
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.username, // usernameをemailとして使用
          password: credentials.password
        })
      })

      if (!response.ok) {
        dispatch({ type: 'LOGIN_FAILURE' })
        return false
      }

      const result = await response.json()
      
      if (!result.success) {
        dispatch({ type: 'LOGIN_FAILURE' })
        return false
      }

      // バックエンドのレスポンスからユーザー情報を変換
      const backendUser = result.data.user
      const user: User = {
        id: backendUser.id.toString(),
        username: backendUser.email,
        email: backendUser.email,
        role: backendUser.role.toLowerCase() as 'admin' | 'staff' | 'demo',
        permissions: [
          { resource: 'all', actions: ['read', 'write', 'delete', 'admin'] }
        ],
        profile: {
          name: backendUser.name || backendUser.email.split('@')[0]
        },
        isActive: backendUser.isActive,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }

      const token = result.data.token

      // ローカルストレージに保存
      localStorage.setItem('salon_auth_token', token)
      localStorage.setItem('salon_auth_user', JSON.stringify(user))

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token }
      })

      return true
    } catch (error) {
      console.error('Login failed:', error)
      dispatch({ type: 'LOGIN_FAILURE' })
      return false
    }
  }

  // ログアウト
  const logout = () => {
    localStorage.removeItem('salon_auth_token')
    localStorage.removeItem('salon_auth_user')
    dispatch({ type: 'LOGOUT' })
  }

  // 権限チェック
  const hasPermission = (resource: string, action: PermissionAction): boolean => {
    if (!state.user || !state.isAuthenticated) return false

    // 管理者は全権限を持つ
    if (state.user.role === 'admin') return true

    // ワイルドカード権限をチェック
    const wildcardPermission = state.permissions.find(p => p.resource === '*')
    if (wildcardPermission && wildcardPermission.actions.includes(action)) {
      return true
    }

    // 特定リソースの権限をチェック
    const permission = state.permissions.find(p => p.resource === resource)
    return permission ? permission.actions.includes(action) : false
  }

  // トークンリフレッシュ
  const refreshToken = async (): Promise<boolean> => {
    if (!state.token || !state.user) return false

    try {
      // 実際の本番環境ではサーバーAPIを呼び出し
      // デモ環境では新しいトークンを生成
      const newToken = generateDemoJWT(state.user)
      
      localStorage.setItem('salon_auth_token', newToken)
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: state.user, token: newToken }
      })

      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  const contextValue: AuthContextType = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    login,
    logout,
    hasPermission,
    refreshToken
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// カスタムフック
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext