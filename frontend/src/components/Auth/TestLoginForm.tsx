import React, { useState } from 'react'
import { 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  Shield, 
  Store,
  ArrowRight,
  Copy,
  CheckCircle
} from 'lucide-react'
import { adminTestAccounts, loginTestInstructions } from '../../data/adminAccounts'

interface TestLoginFormProps {
  onLogin?: (account: any) => void
  className?: string
}

const TestLoginForm: React.FC<TestLoginFormProps> = ({
  onLogin,
  className = ''
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<string>('')
  const [showAccountList, setShowAccountList] = useState(false)
  const [copiedAccount, setCopiedAccount] = useState<string>('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    
    const account = adminTestAccounts.find(acc => acc.username === username)
    if (account && password === loginTestInstructions.commonPassword) {
      alert(`ログイン成功！\n${account.name}様（${account.salonInfo.name}）としてログインします。`)
      if (onLogin) {
        onLogin(account)
      }
    } else {
      alert('ユーザー名またはパスワードが正しくありません。\nパスワード: test123456')
    }
  }

  const handleAccountSelect = (accountUsername: string) => {
    setUsername(accountUsername)
    setSelectedAccount(accountUsername)
    setShowAccountList(false)
  }

  const copyAccountInfo = (accountUsername: string) => {
    navigator.clipboard.writeText(accountUsername)
    setCopiedAccount(accountUsername)
    setTimeout(() => setCopiedAccount(''), 2000)
  }

  const selectedAccountInfo = adminTestAccounts.find(acc => acc.username === username)

  return (
    <div className={`max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">テスト用ログイン</h2>
          <p className="text-gray-600 text-sm">
            経営者様向けデモアカウント（20個）
          </p>
        </div>

        {/* 注意事項 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">テストモード環境</p>
              <p>実際の外部送信は行われません。安全にお試しいただけます。</p>
            </div>
          </div>
        </div>

        {/* ログインフォーム */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="owner001"
                required
              />
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
            
            {/* アカウント選択ボタン */}
            <button
              type="button"
              onClick={() => setShowAccountList(!showAccountList)}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <Store className="w-4 h-4 mr-1" />
              テストアカウント一覧から選択
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="test123456"
                required
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              全アカウント共通: test123456
            </p>
          </div>

          {/* 選択されたアカウント情報 */}
          {selectedAccountInfo && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-green-900 mb-1">選択されたアカウント</h4>
              <div className="text-sm text-green-800">
                <p>経営者: {selectedAccountInfo.name}</p>
                <p>店舗: {selectedAccountInfo.salonInfo.name}</p>
                <p>タイプ: {selectedAccountInfo.salonInfo.type}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <span>ログイン</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </form>

        {/* パスワードクリックでコピー */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setPassword('test123456')
              navigator.clipboard.writeText('test123456')
              alert('パスワードを自動入力しました')
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            パスワードを自動入力
          </button>
        </div>
      </div>

      {/* アカウント一覧モーダル */}
      {showAccountList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">テスト用管理者アカウント（20個）</h3>
                <button
                  onClick={() => setShowAccountList(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminTestAccounts.map((account) => (
                  <div
                    key={account.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAccount === account.username
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAccountSelect(account.username)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-gray-900">{account.username}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyAccountInfo(account.username)
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        {copiedAccount === account.username ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>経営者:</strong> {account.name}</p>
                      <p><strong>店舗:</strong> {account.salonInfo.name}</p>
                      <p><strong>タイプ:</strong> {account.salonInfo.type}</p>
                      <p><strong>所在地:</strong> {account.salonInfo.location}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">使用方法</h4>
                <ol className="text-sm text-yellow-800 list-decimal list-inside space-y-1">
                  <li>上記のアカウントから1つを選択</li>
                  <li>パスワード「test123456」でログイン</li>
                  <li>ログアウト後、別のアカウントも試用可能</li>
                  <li>すべてテストモードで安全に動作</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestLoginForm