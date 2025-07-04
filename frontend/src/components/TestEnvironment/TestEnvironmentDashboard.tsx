import React, { useState } from 'react'
import { 
  TestTube, 
  Users, 
  Settings, 
  Shield,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react'
import TestUserManager from './TestUserManager'
import TestApiSettings from './TestApiSettings'
import ManagerAccountCreator from './ManagerAccountCreator'

const TestEnvironmentDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'managers' | 'api'>('users')
  const [testTenantId, setTestTenantId] = useState('')

  const tabs = [
    {
      id: 'users' as const,
      label: 'ユーザー管理',
      icon: Users,
      description: 'テストユーザー20名の作成・管理・削除'
    },
    {
      id: 'managers' as const,
      label: '経営者アカウント',
      icon: Shield,
      description: '20人の経営者管理者アカウント準備'
    },
    {
      id: 'api' as const,
      label: 'API設定',
      icon: Settings,
      description: 'LINE・Instagram API設定（送信無効化）'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500 text-white rounded-lg flex items-center justify-center">
                <TestTube className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  テスト環境管理システム
                </h1>
                <p className="text-sm text-gray-600">安全なテスト環境でのユーザー管理とAPI設定</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm border border-red-200">
                <Shield className="w-4 h-4" />
                <span className="font-medium">セーフティモード</span>
              </div>
              <div className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-lg text-sm border border-yellow-200">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">テスト環境</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* セキュリティ情報 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-2">テスト環境セキュリティ設定</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>外部API送信完全無効化</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>内部ログ記録のみ</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>テストデータ一括削除機能</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>管理者権限制御</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>セーフティモード強制有効</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>実データ活用・テスト後消去</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 flex items-center space-x-2 font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-gray-500">{tab.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="p-6">
            {activeTab === 'users' && (
              <div>
                <TestUserManager />
                {/* テナントID入力があれば保存 */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    作成済みテナントID（API設定で使用）
                  </label>
                  <input
                    type="text"
                    value={testTenantId}
                    onChange={(e) => setTestTenantId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="テナントIDを入力してAPI設定タブで使用"
                  />
                </div>
              </div>
            )}

            {activeTab === 'managers' && (
              <ManagerAccountCreator />
            )}
            
            {activeTab === 'api' && (
              <div>
                {testTenantId ? (
                  <TestApiSettings tenantId={testTenantId} />
                ) : (
                  <div className="text-center py-12">
                    <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">テナントIDが必要です</h3>
                    <p className="text-gray-600 mb-4">
                      先にユーザー管理タブでテスト管理者を作成し、テナントIDを入力してください。
                    </p>
                    <button
                      onClick={() => setActiveTab('users')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      ユーザー管理へ
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* フッター情報 */}
        <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
          <p>テスト環境専用システム - 本番環境への影響はありません</p>
          <p className="mt-1">外部API送信は完全に無効化され、すべての操作は内部ログに記録されます</p>
        </div>
      </div>
    </div>
  )
}

export default TestEnvironmentDashboard