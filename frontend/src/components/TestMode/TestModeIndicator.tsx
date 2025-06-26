import React, { useState } from 'react'
import { TestTube, MessageSquare, Info, X } from 'lucide-react'
import { getEnvironmentConfig } from '../../utils/environment'

interface TestModeIndicatorProps {
  className?: string
}

const TestModeIndicator: React.FC<TestModeIndicatorProps> = ({ 
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const config = getEnvironmentConfig()

  // テスト フェーズでない場合は表示しない
  if (!config.isTestingPhase) {
    return null
  }

  return (
    <>
      {/* トップバー表示 */}
      <div className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-2">
            {/* 左側：テスト中表示 */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <TestTube className="w-5 h-5" />
                <span className="font-medium">🧪 テスト利用中</span>
              </div>
            </div>

            {/* 中央：メッセージ */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              <MessageSquare className="w-4 h-4" />
              <span>フィードバックをお聞かせください</span>
            </div>

            {/* 右側：詳細ボタン */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center space-x-1 px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm hover:bg-opacity-30 transition-all"
              >
                <Info className="w-4 h-4" />
                <span className="hidden sm:inline">詳細</span>
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
                    <TestTube className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">🧪 テスト利用について</h3>
                    <p className="text-gray-600">本番環境のテスト期間中です</p>
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
                {/* テスト期間の説明 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">テスト期間中について</h4>
                  <p className="text-blue-800 text-sm">
                    現在このシステムはテスト期間中です。全ての機能が本番環境で動作しておりますが、
                    エラーやバグが発生する可能性があります。お気づきの点がございましたら、
                    フィードバックフォームからお知らせください。
                  </p>
                </div>

                {/* フィードバックのお願い */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">フィードバックのお願い</h4>
                  <p className="text-green-800 text-sm mb-2">
                    以下の点についてフィードバックをお聞かせください：
                  </p>
                  <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                    <li>システムの使いやすさ</li>
                    <li>発見されたバグやエラー</li>
                    <li>機能の改善提案</li>
                    <li>画面デザイン・操作性の感想</li>
                    <li>追加してほしい機能</li>
                  </ul>
                </div>

                {/* フィードバック方法 */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                    フィードバック方法
                  </h4>
                  <p className="text-gray-700 text-sm">
                    画面右上の「フィードバック」ボタンからお気軽にご連絡ください。
                    カテゴリ別に分類して送信できます。
                  </p>
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
    </>
  )
}

export default TestModeIndicator