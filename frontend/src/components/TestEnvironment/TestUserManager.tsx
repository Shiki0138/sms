import React, { useState, useEffect } from 'react'
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  AlertCircle,
  CheckCircle,
  Settings,
  Lock,
  Eye,
  RefreshCw
} from 'lucide-react'

interface TestUser {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

interface TestCustomer {
  id: string
  name: string
  email: string
  phone: string
  isActive: boolean
  createdAt: string
}

interface TestEnvironmentData {
  staff: TestUser[]
  customers: TestCustomer[]
  reservations: any[]
  summary: {
    staffCount: number
    customerCount: number
    reservationCount: number
  }
}

const TestUserManager: React.FC = () => {
  const [testData, setTestData] = useState<TestEnvironmentData | null>(null)
  const [loading, setLoading] = useState(false)
  const [adminCredentials, setAdminCredentials] = useState({
    email: 'admin@test.salon.com',
    password: 'TestAdmin2025!',
    tenantName: 'テスト美容室システム'
  })
  const [testTenantId, setTestTenantId] = useState('')
  const [cleanupPassword, setCleanupPassword] = useState('')
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false)

  // テスト管理者作成
  const createTestAdmin = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminCredentials)
      })

      const result = await response.json()
      
      if (result.success) {
        setTestTenantId(result.data.tenantId)
        alert(`テスト管理者アカウントを作成しました！\n\nテナントID: ${result.data.tenantId}\nメール: ${result.data.email}\n\nこの情報を保存してください。`)
      } else {
        alert(`エラー: ${result.message}`)
      }
    } catch (error) {
      console.error('管理者作成エラー:', error)
      alert('管理者アカウントの作成に失敗しました')
    }
    setLoading(false)
  }

  // テストユーザー20名作成
  const createTestUsers = async () => {
    if (!testTenantId) {
      alert('先にテスト管理者を作成してください')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/test/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantId: testTenantId,
          count: 20
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`テストユーザーを作成しました！\n\nスタッフ: ${result.data.staffCount}名\n顧客: ${result.data.customerCount}名\n予約: ${result.data.reservationCount}件`)
        await loadTestUsers()
      } else {
        alert(`エラー: ${result.message}`)
      }
    } catch (error) {
      console.error('テストユーザー作成エラー:', error)
      alert('テストユーザーの作成に失敗しました')
    }
    setLoading(false)
  }

  // テストユーザー一覧取得
  const loadTestUsers = async () => {
    if (!testTenantId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/test/users/${testTenantId}`)
      const result = await response.json()
      
      if (result.success) {
        setTestData(result.data)
      }
    } catch (error) {
      console.error('テストユーザー取得エラー:', error)
    }
    setLoading(false)
  }

  // テストデータ一括削除
  const cleanupTestData = async () => {
    if (cleanupPassword !== 'DELETE_ALL_TEST_DATA_CONFIRM') {
      alert('削除確認パスワードが正しくありません')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/test/cleanup', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tenantId: testTenantId,
          confirmPassword: cleanupPassword
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert('テストデータを完全に削除しました')
        setTestData(null)
        setTestTenantId('')
        setShowCleanupConfirm(false)
        setCleanupPassword('')
      } else {
        alert(`エラー: ${result.message}`)
      }
    } catch (error) {
      console.error('データ削除エラー:', error)
      alert('データ削除に失敗しました')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (testTenantId) {
      loadTestUsers()
    }
  }, [testTenantId])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <h1 className="text-xl font-bold text-yellow-800">テスト環境管理</h1>
        </div>
        <p className="text-yellow-700 mt-2">
          安全なテスト環境でユーザー20名の準備とAPI設定を行います。外部送信は完全に無効化されています。
        </p>
      </div>

      {/* 管理者アカウント作成 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold">1. テスト管理者アカウント作成</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              type="email"
              value={adminCredentials.email}
              onChange={(e) => setAdminCredentials({...adminCredentials, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">パスワード</label>
            <input
              type="password"
              value={adminCredentials.password}
              onChange={(e) => setAdminCredentials({...adminCredentials, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">テナント名</label>
            <input
              type="text"
              value={adminCredentials.tenantName}
              onChange={(e) => setAdminCredentials({...adminCredentials, tenantName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <button
          onClick={createTestAdmin}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
        >
          <Shield className="w-4 h-4" />
          <span>管理者作成</span>
        </button>

        {testTenantId && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800 font-medium">テナントID: {testTenantId}</span>
            </div>
          </div>
        )}
      </div>

      {/* テストユーザー作成 */}
      {testTenantId && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold">2. テストユーザー20名作成</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={createTestUsers}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>ユーザー作成</span>
              </button>
              <button
                onClick={loadTestUsers}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>更新</span>
              </button>
            </div>
          </div>

          {testData && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{testData.summary.staffCount}</div>
                  <div className="text-blue-800">スタッフ</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{testData.summary.customerCount}</div>
                  <div className="text-green-800">顧客</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{testData.summary.reservationCount}</div>
                  <div className="text-purple-800">予約</div>
                </div>
              </div>

              {/* スタッフ一覧 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">テストスタッフ一覧</h3>
                <div className="bg-gray-50 rounded p-4 max-h-40 overflow-y-auto">
                  {testData.staff.map((staff) => (
                    <div key={staff.id} className="flex justify-between items-center py-1 text-sm">
                      <span>{staff.name} ({staff.email})</span>
                      <span className={`px-2 py-1 rounded text-xs ${staff.role === 'ADMIN' ? 'bg-red-100 text-red-800' : staff.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {staff.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* データ削除 */}
      {testData && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold">3. テストデータ完全削除</h2>
          </div>
          
          {!showCleanupConfirm ? (
            <button
              onClick={() => setShowCleanupConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>削除モード開始</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">危険: 全データ削除</span>
                </div>
                <p className="text-red-700 mb-4">
                  この操作により、テナント、全ユーザー、全予約データが完全に削除されます。
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    削除確認パスワード: DELETE_ALL_TEST_DATA_CONFIRM
                  </label>
                  <input
                    type="text"
                    value={cleanupPassword}
                    onChange={(e) => setCleanupPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-md"
                    placeholder="上記のパスワードを正確に入力してください"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={cleanupTestData}
                    disabled={loading || cleanupPassword !== 'DELETE_ALL_TEST_DATA_CONFIRM'}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>完全削除実行</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowCleanupConfirm(false)
                      setCleanupPassword('')
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span>処理中...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TestUserManager