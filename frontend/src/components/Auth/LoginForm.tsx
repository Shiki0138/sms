import React, { useState } from 'react'
import { Eye, EyeOff, LogIn, User, Lock, AlertCircle, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { TEST_LOGIN_CREDENTIALS } from '../../types/auth'

interface LoginFormProps {
  onLoginSuccess?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCredentials, setShowCredentials] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.username || !formData.password) {
      setError('ユーザー名とパスワードを入力してください')
      return
    }

    const success = await login(formData)
    if (success) {
      onLoginSuccess?.()
    } else {
      setError('ログインに失敗しました。ユーザー名またはパスワードが正しくありません。')
    }
  }

  const handleQuickLogin = (role: keyof typeof TEST_LOGIN_CREDENTIALS) => {
    const credentials = TEST_LOGIN_CREDENTIALS[role]
    setFormData(credentials)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            美容室管理システム
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            システムにログインしてください
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ユーザー名 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                ユーザー名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="ユーザー名を入力"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="パスワードを入力"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  ログイン
                </>
              )}
            </button>
          </form>

          {/* デモ用クイックログイン */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">デモアカウント</span>
              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showCredentials ? '非表示' : '表示'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('demo')}
                className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                disabled={isLoading}
              >
                デモユーザー
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-3 py-2 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
                disabled={isLoading}
              >
                管理者
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff1')}
                className="px-3 py-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                disabled={isLoading}
              >
                田中 美咲
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff2')}
                className="px-3 py-2 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                disabled={isLoading}
              >
                佐藤 千夏
              </button>
            </div>

            {showCredentials && (
              <div className="mt-4 text-xs text-gray-600 space-y-2">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium mb-2">ログイン情報:</p>
                  <div className="space-y-1">
                    <div>デモ: salon_demo_001 / Demo2024Salon!</div>
                    <div>管理者: admin_system / AdminSalon2024!System</div>
                    <div>スタッフ1: tanaka_misaki / Staff2024Tanaka!</div>
                    <div>スタッフ2: sato_chinatsu / Staff2024Sato!</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="text-center text-xs text-gray-500">
          <p>このシステムは認証が必要です</p>
          <p className="mt-1">適切な権限を持つアカウントでログインしてください</p>
        </div>
      </div>
    </div>
  )
}

export default LoginForm