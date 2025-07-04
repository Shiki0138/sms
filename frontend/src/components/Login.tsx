import { useState } from 'react'
import { Lock, User, Smartphone, Shield, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface LoginProps {
  onLogin: (token: string, staff: any) => void
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [showOTP, setShowOTP] = useState(false)
  const [loading, setLoading] = useState(false)

  // 環境変数でログイン機能を制御
  const isLoginEnabled = import.meta.env.VITE_ENABLE_LOGIN === 'true'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // デモモード：固定認証情報
      if (email === 'admin@salon.com' && password === 'admin123') {
        // 2FAが有効な場合
        if (!showOTP) {
          setShowOTP(true)
          toast.success('認証コードを入力してください')
          setLoading(false)
          return
        }

        // OTP検証（デモ用：123456で固定）
        if (otpCode === '123456') {
          const demoToken = 'demo-jwt-token'
          const demoStaff = {
            id: '1',
            name: '管理者',
            email: 'admin@salon.com',
            role: 'ADMIN',
            tenantId: '1'
          }
          
          localStorage.setItem('token', demoToken)
          localStorage.setItem('staff', JSON.stringify(demoStaff))
          
          toast.success('ログインに成功しました')
          onLogin(demoToken, demoStaff)
        } else {
          toast.error('認証コードが正しくありません')
        }
      } else {
        toast.error('メールアドレスまたはパスワードが正しくありません')
      }
    } catch (error) {
      toast.error('ログインに失敗しました')
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
            <h1 className="text-2xl font-bold text-gray-900">美容室統合管理システム</h1>
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
            {!showOTP ? (
              <>
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
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="admin@salon.com"
                      required
                      data-testid="legacy-login-email-input"
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
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      required
                      data-testid="legacy-login-password-input"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2要素認証コード
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="6桁の認証コード"
                    maxLength={6}
                    required
                    data-testid="legacy-login-otp-input"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  デモ用コード: 123456
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="legacy-login-submit-button"
            >
              {loading ? '認証中...' : showOTP ? '認証コードを確認' : 'ログイン'}
            </button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-2">デモ認証情報:</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <p>メール: admin@salon.com</p>
                  <p>パスワード: admin123</p>
                  <p>2FAコード: 123456</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}