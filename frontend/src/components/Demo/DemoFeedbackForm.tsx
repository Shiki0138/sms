/**
 * 🎭 デモモード専用フィードバックフォーム
 * ユーザーからの改善要望・エラー報告を収集
 */

import React, { useState } from 'react'
import { Send, MessageSquare, AlertTriangle, Lightbulb, Bug } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEnvironmentConfig } from '../../utils/environment'

interface FeedbackData {
  title: string
  category: 'bug' | 'improvement' | 'feature_request' | 'ui_ux' | 'other'
  page: string
  description: string
  userAgent: string
  timestamp: string
  sessionId: string
}

interface DemoFeedbackFormProps {
  isOpen: boolean
  onClose: () => void
  currentPage?: string
}

const pageOptions = [
  { value: 'dashboard', label: 'ダッシュボード' },
  { value: 'customers', label: '顧客管理' },
  { value: 'reservations', label: '予約管理' },
  { value: 'staff', label: 'スタッフ管理' },
  { value: 'analytics', label: '分析・レポート' },
  { value: 'messages', label: 'メッセージ管理' },
  { value: 'settings', label: '設定' },
  { value: 'billing', label: '料金・請求' },
  { value: 'integrations', label: '外部連携' },
  { value: 'other', label: 'その他' }
]

const categoryOptions = [
  { value: 'bug', label: 'バグ・エラー報告', icon: Bug, color: 'text-red-600' },
  { value: 'improvement', label: '改善提案', icon: Lightbulb, color: 'text-yellow-600' },
  { value: 'feature_request', label: '新機能要望', icon: MessageSquare, color: 'text-blue-600' },
  { value: 'ui_ux', label: 'UI/UX改善', icon: AlertTriangle, color: 'text-purple-600' },
  { value: 'other', label: 'その他', icon: MessageSquare, color: 'text-gray-600' }
]

export const DemoFeedbackForm: React.FC<DemoFeedbackFormProps> = ({
  isOpen,
  onClose,
  currentPage = ''
}) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'improvement' as FeedbackData['category'],
    page: currentPage || 'other',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const config = getEnvironmentConfig()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const feedbackData: FeedbackData = {
        ...formData,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: sessionStorage.getItem('demo_session_id') || 'unknown'
      }

      // Googleスプレッドシートに送信
      const response = await fetch(`${config.apiBaseURL}/api/demo/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      })

      if (response.ok) {
        toast.success('フィードバックを送信しました。ご協力ありがとうございます！', {
          duration: 4000,
          icon: '🙏'
        })
        
        // フォームをリセット
        setFormData({
          title: '',
          category: 'improvement',
          page: currentPage || 'other',
          description: ''
        })
        onClose()
      } else {
        throw new Error('送信に失敗しました')
      }
    } catch (error) {
      console.error('Feedback submission error:', error)
      toast.error('送信に失敗しました。しばらく経ってから再度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categoryOptions.find(cat => cat.value === formData.category)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🎭 デモモード フィードバック
              </h2>
              <p className="text-blue-100 mt-1">
                ご利用いただきありがとうございます。改善点やご要望をお聞かせください
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例: 予約画面でエラーが発生しました"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* カテゴリー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリー <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryOptions.map((category) => {
                const IconComponent = category.icon
                return (
                  <label
                    key={category.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.category === category.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={category.value}
                      checked={formData.category === category.value}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as FeedbackData['category'] })}
                      className="sr-only"
                    />
                    <IconComponent className={`w-5 h-5 ${category.color} mr-3`} />
                    <span className="text-sm font-medium">{category.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 該当ページ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              該当ページ <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.page}
              onChange={(e) => setFormData({ ...formData, page: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {pageOptions.map((page) => (
                <option key={page.value} value={page.value}>
                  {page.label}
                </option>
              ))}
            </select>
          </div>

          {/* 詳細説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              詳細説明 <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={
                formData.category === 'bug'
                  ? '例: 顧客情報を保存しようとすると「サーバーエラー」が表示されて保存できません。Chrome最新版で発生。'
                  : formData.category === 'improvement'
                  ? '例: 予約一覧画面で月表示だけでなく週表示も選択できるようになると便利です。'
                  : '具体的な内容をご記入ください...'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              できるだけ具体的にご記入いただけると、より良い改善につながります
            </p>
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  送信中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  フィードバックを送信
                </>
              )}
            </button>
          </div>
        </form>

        {/* フッター */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">ご利用ありがとうございます</p>
              <p>
                いただいたフィードバックは開発チームで検討し、サービス改善に活用させていただきます。
                デモ期間終了後、データは安全に削除されます。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoFeedbackForm