import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Scissors, Mail, Lock, AlertCircle, Sparkles, Users, Calendar, MessageSquare } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login({
        username: credentials.email,
        password: credentials.password
      })

      if (success) {
        navigate('/dashboard')
      } else {
        setError('メールアドレスまたはパスワードが正しくありません')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('ログイン中にエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  // テストアカウント情報を表示
  const testAccounts = [
    { email: 'admin@beauty-tokyo.jp', password: 'Test1234!', role: '東京店舗管理者' },
    { email: 'system@beauty-salon.jp', password: 'Admin2024!', role: 'システム管理者' },
    { email: 'viewer@demo.beauty-salon.jp', password: 'DemoView2024!', role: '閲覧専用' }
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                <Scissors className="w-10 h-10" />
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              美容室統合管理システム
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              すべての業務を一つのプラットフォームで
            </p>
          </div>
        
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="salon@example.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  パスワード
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="パスワードを入力"
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-[1.02]"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </div>

            <div className="text-center">
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                新規アカウント登録はこちら
              </Link>
            </div>
          </form>

          {/* テストアカウント情報 */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              デモアカウントでお試しください
            </h3>
            <div className="space-y-2">
              {testAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => setCredentials({ email: account.email, password: account.password })}
                  className="w-full text-left p-2 rounded-lg hover:bg-white/50 transition-colors group"
                >
                  <div className="text-xs font-medium text-blue-900 group-hover:text-blue-700">{account.role}</div>
                  <div className="font-mono text-xs text-blue-700 group-hover:text-blue-600">
                    {account.email}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Features */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-purple-700 text-white p-12 items-center">
        <div className="max-w-lg mx-auto">
          <h1 className="text-4xl font-bold mb-8">美容室経営をもっとスマートに</h1>
          <p className="text-lg mb-12 opacity-90">
            SNS連携、予約管理、顧客管理をワンストップで。
            業務効率を大幅に改善し、お客様満足度を向上させます。
          </p>
          
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg mb-1">統合メッセージング</h3>
                <p className="text-sm opacity-80">Instagram、LINE、メールを一元管理。返信漏れをゼロに。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg mb-1">スマート予約管理</h3>
                <p className="text-sm opacity-80">Google Calendar連携で予約を自動同期。ダブルブッキングを防止。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="font-semibold text-lg mb-1">顧客カルテ管理</h3>
                <p className="text-sm opacity-80">来店履歴や好みを記録。パーソナライズされたサービスを提供。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage