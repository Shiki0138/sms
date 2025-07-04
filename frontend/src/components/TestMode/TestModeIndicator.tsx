import React, { useState } from 'react'
import { 
  AlertCircle, 
  Eye, 
  Shield, 
  Info, 
  X, 
  Settings,
  Users,
  Lock,
  Play
} from 'lucide-react'

interface TestModeIndicatorProps {
  isTestMode?: boolean
  accountInfo?: {
    username: string
    name: string
    salonName: string
    salonType: string
  }
  onToggleTestMode?: () => void
  className?: string
}

const TestModeIndicator: React.FC<TestModeIndicatorProps> = ({
  isTestMode = true,
  accountInfo,
  onToggleTestMode,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [showAccountList, setShowAccountList] = useState(false)

  const testAccountList = [
    { username: 'owner001', name: '田中 一郎', salon: 'Hair Studio TOKYO' },
    { username: 'owner002', name: '佐藤 美恵', salon: 'Salon Belle' },
    { username: 'owner003', name: '山田 太郎', salon: 'Men\'s Cut & Style' },
    { username: 'owner004', name: '鈴木 花子', salon: 'Family Hair Plus' },
    { username: 'owner005', name: '高橋 雅人', salon: 'Premium Beauty Lounge' }
  ]

  if (!isTestMode) {
    return null
  }

  return (
    <>
      {/* トップバー表示 */}
      <div className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            {/* 左側：テストモード表示 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Eye className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <span className="font-medium">テストモード</span>
              </div>
              
              {accountInfo && (
                <div className="hidden sm:flex items-center space-x-2 text-sm opacity-90">
                  <span>|</span>
                  <Users className="w-4 h-4" />
                  <span>{accountInfo.name}（{accountInfo.salonName}）</span>
                </div>
              )}
            </div>

            {/* 中央：重要メッセージ */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4" />
              <span>外部送信なし・安全にテスト可能</span>
            </div>

            {/* 右側：アクションボタン */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-1 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm hover:bg-opacity-30 transition-all"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">詳細</span>
              </button>
              
              <button
                onClick={() => setShowAccountList(!showAccountList)}
                className="flex items-center space-x-1 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm hover:bg-opacity-30 transition-all"
              >
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">アカウント</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 詳細情報モーダル */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">テストモード詳細</h3>
                    <p className="text-gray-600">経営者様向け安全テスト環境</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* 現在のアカウント情報 */}
                {accountInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">現在のテストアカウント</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">ユーザー名:</span> {accountInfo.username}
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">経営者名:</span> {accountInfo.name}
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">店舗名:</span> {accountInfo.salonName}
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">店舗タイプ:</span> {accountInfo.salonType}
                      </div>
                    </div>
                  </div>
                )}

                {/* 制限事項 */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-green-600" />
                    テストモードの制限（安全性確保）
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">🚫 制限される機能</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• LINEメッセージ送信</li>
                        <li>• Instagramメッセージ送信</li>
                        <li>• メール送信</li>
                        <li>• SMS送信</li>
                        <li>• 実際の決済処理</li>
                        <li>• 外部API呼び出し</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700">✅ 利用可能な機能</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• 顧客管理・編集</li>
                        <li>• 予約管理・スケジュール</li>
                        <li>• メニュー設定</li>
                        <li>• 売上分析・レポート</li>
                        <li>• スタッフ管理</li>
                        <li>• システム設定</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* テストデータ */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Play className="w-5 h-5 mr-2 text-purple-600" />
                    利用可能なテストデータ
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-blue-600">20名</div>
                      <div className="text-sm text-gray-600">顧客データ</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">5件</div>
                      <div className="text-sm text-gray-600">予約データ</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">25種</div>
                      <div className="text-sm text-gray-600">メニュー</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-orange-600">3名</div>
                      <div className="text-sm text-gray-600">スタッフ</div>
                    </div>
                  </div>
                </div>

                {/* 注意事項 */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    重要な注意事項
                  </h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• このテストでは実際の顧客や外部サービスに影響を与えません</li>
                    <li>• すべてのデータは仮想的なものです</li>
                    <li>• 本番環境では必ずテストモードを無効にしてください</li>
                    <li>• テストアカウントは他の経営者様と共用されます</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  理解しました
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* アカウントリストモーダル */}
      {showAccountList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">テスト用管理者アカウント</h3>
                    <p className="text-gray-600">20個の経営者テストアカウント</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAccountList(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* ログイン情報 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">ログイン方法</h4>
                  <div className="text-sm text-blue-800">
                    <p className="mb-2">
                      <strong>パスワード（全共通）:</strong> 
                      <code className="bg-blue-100 px-2 py-1 rounded ml-2">test123456</code>
                    </p>
                    <p>お好きなユーザー名を選択してログインしてください</p>
                  </div>
                </div>

                {/* アカウント一覧（最初の5個のみ表示） */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">利用可能アカウント（抜粋）</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {testAccountList.map((account, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{account.username}</div>
                            <div className="text-sm text-gray-600">{account.name}</div>
                            <div className="text-xs text-gray-500">{account.salon}</div>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(account.username)
                              alert(`${account.username} をコピーしました`)
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            コピー
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 text-center">
                    <div className="inline-flex items-center space-x-2 text-gray-500">
                      <span>...</span>
                      <span>owner006 ～ owner020 まで全20アカウント利用可能</span>
                    </div>
                  </div>
                </div>

                {/* 使用方法 */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">使用方法</h4>
                  <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                    <li>上記のユーザー名のいずれかを選択</li>
                    <li>パスワード「test123456」でログイン</li>
                    <li>システムの全機能をテスト</li>
                    <li>ログアウト後、別のアカウントも試用可能</li>
                    <li>すべてテストモードで安全に動作</li>
                  </ol>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAccountList(false)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TestModeIndicator