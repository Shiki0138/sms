import { useState } from 'react'
import { Lock, User, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface LoginProps {
  onLogin: (token: string, staff: any) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // 環境変数でログイン機能を制御
  const isLoginEnabled = import.meta.env.VITE_ENABLE_LOGIN === 'true'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 本番環境のAPI認証
      const apiUrl = import.meta.env.VITE_API_URL || 'https://salon-management-system-one.vercel.app/api'
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        const { token, user } = result
        
        localStorage.setItem('token', token)
        localStorage.setItem('staff', JSON.stringify(user))
        
        toast.success('ログインに成功しました')
        onLogin(token, user)
      } else {
        toast.error(result.message || 'メールアドレスまたはパスワードが正しくありません')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('ログインに失敗しました。ネットワーク接続を確認してください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">SMS</h1>
            <p className="text-sm text-gray-600 mt-2">セキュアログイン</p>
          </div>

          {/* ログインが無効な場合のメッセージ */}
          {!isLoginEnabled ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    本番環境でのみログイン可能
                  </h3>
                  <p className="mt-1 text-sm text-yellow-700">
                    このシステムは本番環境でのみログイン機能を利用できます。
                    開発環境では安全性のためログイン機能が無効化されています。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="example@test-salon.jp"
                      autoComplete="email"
                      required
                      data-testid="login-email-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    パスワード
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                      data-testid="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] text-base"
              data-testid="login-submit-button"
            >
              {loading ? '認証中...' : 'ログイン'}
            </button>
              </form>

            </>
          )}
        </div>
      </div>
    </div>
  )
}