import { useState } from 'react'
import { Lock, User, Smartphone, Shield } from 'lucide-react'
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
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '認証中...' : showOTP ? '認証コードを確認' : 'ログイン'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}