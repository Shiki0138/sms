import React, { useState, useEffect } from 'react'
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Crown,
  Building,
  Mail,
  Lock,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react'

interface Manager {
  tenantId: string
  tenantName: string
  email: string
  name: string
  password?: string
  loginUrl: string
}

interface ManagerListItem {
  id: string
  email: string
  name: string
  isActive: boolean
  lastLoginAt?: string
  tenant: {
    id: string
    name: string
    address: string
    phone: string
    isActive: boolean
    createdAt: string
  }
  createdAt: string
}

const ManagerAccountCreator: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([])
  const [managerList, setManagerList] = useState<ManagerListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [showCleanupConfirm, setShowCleanupConfirm] = useState(false)
  const [cleanupPassword, setCleanupPassword] = useState('')

  // 20人の経営者管理者作成
  const create20Managers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/test/prepare-managers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success) {
        setManagers(result.data.managers)
        alert(`20人の経営者管理者アカウントを作成しました！\n\n作成数: ${result.data.totalCount}件\n\n※ パスワードは初回表示のみです。必要に応じて保存してください。`)
        await loadManagerList()
      } else {
        alert(`エラー: ${result.message}`)
      }
    } catch (error) {
      console.error('管理者作成エラー:', error)
      alert('管理者アカウントの作成に失敗しました')
    }
    setLoading(false)
  }

  // 管理者一覧取得
  const loadManagerList = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/v1/test/managers')
      const result = await response.json()
      
      if (result.success) {
        setManagerList(result.data.managers)
      }
    } catch (error) {
      console.error('管理者一覧取得エラー:', error)
    }
    setLoading(false)
  }

  // 全デモアカウント削除
  const cleanupAllDemoAccounts = async () => {
    if (cleanupPassword !== 'DELETE_ALL_DEMO_ACCOUNTS_CONFIRM') {
      alert('削除確認パスワードが正しくありません')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/v1/test/cleanup-demo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          confirmPassword: cleanupPassword
        })
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`デモアカウントを完全に削除しました\n\n削除件数: ${result.deletedCount}件`)
        setManagers([])
        setManagerList([])
        setShowCleanupConfirm(false)
        setCleanupPassword('')
      } else {
        alert(`エラー: ${result.message}`)
      }
    } catch (error) {
      console.error('デモアカウント削除エラー:', error)
      alert('デモアカウントの削除に失敗しました')
    }
    setLoading(false)
  }

  // クリップボードにコピー
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('クリップボードにコピーしました')
    })
  }

  // CSV出力
  const exportToCSV = () => {
    if (managers.length === 0) {
      alert('エクスポートするデータがありません')
      return
    }

    const csvContent = [
      ['テナント名', 'メールアドレス', 'パスワード', 'ログインURL'],
      ...managers.map(m => [m.tenantName, m.email, m.password || '', m.loginUrl])
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `管理者アカウント_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  useEffect(() => {
    loadManagerList()
  }, [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* ヘッダー */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-purple-600" />
          <h1 className="text-xl font-bold text-purple-800">20人経営者管理者アカウント準備</h1>
        </div>
        <p className="text-purple-700 mt-2">
          デモ・テスト用に20人分の経営者管理者アカウントを一括作成・管理します。
        </p>
      </div>

      {/* 作成ボタン */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-semibold">管理者アカウント一括作成</h2>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={create20Managers}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>20人作成</span>
            </button>
            <button
              onClick={loadManagerList}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>更新</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">作成される内容</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 20個の美容室テナント（田中サロン、佐藤美容室、など）</li>
            <li>• 各テナントに管理者アカウント1つずつ</li>
            <li>• ログイン用メールアドレス: manager1@test-salon.com ～ manager20@test-salon.com</li>
            <li>• 強力なパスワード自動生成</li>
            <li>• プレミアムプラン設定済み</li>
          </ul>
        </div>
      </div>

      {/* 作成済みアカウント表示 */}
      {managers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold">作成完了アカウント ({managers.length}件)</h2>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 flex items-center space-x-1"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showPasswords ? 'パスワード非表示' : 'パスワード表示'}</span>
              </button>
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>CSV出力</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">テナント名</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">メールアドレス</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">パスワード</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {managers.map((manager, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{manager.tenantName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm">{manager.email}</span>
                        <button
                          onClick={() => copyToClipboard(manager.email)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Lock className="w-4 h-4 text-gray-400" />
                        <span className="font-mono text-sm">
                          {showPasswords ? manager.password : '••••••••••'}
                        </span>
                        {showPasswords && manager.password && (
                          <button
                            onClick={() => copyToClipboard(manager.password!)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => window.open(manager.loginUrl, '_blank')}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center space-x-1"
                      >
                        <span>ログイン</span>
                        <Crown className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 既存管理者一覧 */}
      {managerList.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">既存管理者一覧 ({managerList.length}件)</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">テナント</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">管理者</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">最終ログイン</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900">作成日</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {managerList.map((manager) => (
                  <tr key={manager.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{manager.tenant.name}</div>
                        <div className="text-xs text-gray-500">{manager.tenant.address}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{manager.name}</div>
                        <div className="text-xs text-gray-500">{manager.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {manager.lastLoginAt 
                          ? new Date(manager.lastLoginAt).toLocaleString() 
                          : '未ログイン'
                        }
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {new Date(manager.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 削除セクション */}
      {managerList.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-semibold">全デモアカウント削除</h2>
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
                  <span className="font-semibold text-red-800">危険: 全デモアカウント削除</span>
                </div>
                <p className="text-red-700 mb-4">
                  この操作により、全てのデモテナント、管理者アカウント、関連データが完全に削除されます。
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-red-700 mb-1">
                    削除確認パスワード: DELETE_ALL_DEMO_ACCOUNTS_CONFIRM
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
                    onClick={cleanupAllDemoAccounts}
                    disabled={loading || cleanupPassword !== 'DELETE_ALL_DEMO_ACCOUNTS_CONFIRM'}
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

export default ManagerAccountCreator