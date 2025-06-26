/**
 * 🎭 デモモード表示バナー
 * デモモードであることを明示し、制限事項を表示
 */

import React, { useState, useEffect } from 'react'
import { AlertTriangle, MessageSquare, Clock, Shield } from 'lucide-react'
import { getEnvironmentConfig } from '../../utils/environment'
import DemoFeedbackForm from './DemoFeedbackForm'

interface DemoBannerProps {
  currentPage?: string
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ currentPage }) => {
  const [showFeedback, setShowFeedback] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(7)
  const config = getEnvironmentConfig()

  useEffect(() => {
    // デモ開始日を取得（ローカルストレージから）
    const demoStartDate = localStorage.getItem('demo_start_date')
    if (demoStartDate) {
      const startDate = new Date(demoStartDate)
      const currentDate = new Date()
      const diffTime = config.demoExpiryDays * 24 * 60 * 60 * 1000 - (currentDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysRemaining(Math.max(0, diffDays))
    } else {
      // 初回アクセス時は開始日を設定
      localStorage.setItem('demo_start_date', new Date().toISOString())
      setDaysRemaining(config.demoExpiryDays)
    }
  }, [config.demoExpiryDays])

  if (!config.isDemoMode) return null

  return (
    <>
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* メイン情報 */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  🎭
                </div>
                <div>
                  <span className="font-bold text-lg">デモモード</span>
                  <span className="ml-2 text-purple-200">SMS体験版</span>
                </div>
              </div>

              {/* 残り日数 */}
              <div className="flex items-center gap-2 bg-white bg-opacity-20 px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  残り {daysRemaining} 日間
                </span>
              </div>

              {/* 制限事項 */}
              <div className="hidden lg:flex items-center gap-2 bg-yellow-500 bg-opacity-20 px-3 py-1 rounded-full">
                <Shield className="w-4 h-4" />
                <span className="text-sm">
                  LINE・決済機能は制限中
                </span>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFeedback(true)}
                className="flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all text-sm font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                フィードバック
              </button>
              
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">実際のデータ登録は可能です</span>
              </div>
            </div>
          </div>

          {/* 詳細情報（モバイル用） */}
          <div className="lg:hidden mt-3 pt-3 border-t border-white border-opacity-20">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>LINE・決済機能は制限中</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>実際のデータ登録は可能</span>
              </div>
            </div>
          </div>

          {/* 制限機能の詳細説明 */}
          <div className="mt-3 p-3 bg-white bg-opacity-10 rounded-lg">
            <details className="group">
              <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                <span>🔒 デモモードの制限事項</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-2 text-xs space-y-1 text-purple-100">
                <p>• LINE・Instagram・SMS・メール送信機能は無効化されています</p>
                <p>• AI分析機能は制限されています（基本分析のみ利用可能）</p>
                <p>• 決済・課金機能は無効化されています</p>
                <p>• プッシュ通知は制限されています</p>
                <p>• CSVインポート・エクスポート機能は利用可能です</p>
                <p>• 登録データは{config.demoExpiryDays}日後に自動削除されます</p>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* フィードバックフォーム */}
      <DemoFeedbackForm 
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        currentPage={currentPage}
      />
    </>
  )
}

export default DemoBanner