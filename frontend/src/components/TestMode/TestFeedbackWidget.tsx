import React, { useState } from 'react'
import { MessageSquare, Bug, Lightbulb, Star, Send, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

interface FeedbackData {
  category: 'bug' | 'improvement' | 'feature_request'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

const TestFeedbackWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({
    category: 'improvement',
    title: '',
    description: '',
    priority: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categoryIcons = {
    bug: <Bug className="w-4 h-4" />,
    improvement: <Lightbulb className="w-4 h-4" />,
    feature_request: <Star className="w-4 h-4" />
  }

  const categoryLabels = {
    bug: 'バグ報告',
    improvement: '改善提案',
    feature_request: '機能リクエスト'
  }

  const priorityLabels = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '緊急'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback.title || !feedback.description) {
      toast.error('タイトルと詳細を入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      // ユーザー情報を取得
      const userStr = localStorage.getItem('staff')
      const user = userStr ? JSON.parse(userStr) : null

      const { error } = await supabase
        .from('test_feedback')
        .insert({
          user_id: user?.id || 'anonymous',
          ...feedback
        })

      if (error) throw error

      toast.success('フィードバックを送信しました。ご協力ありがとうございます！')
      
      // フォームをリセット
      setFeedback({
        category: 'improvement',
        title: '',
        description: '',
        priority: 'medium'
      })
      setIsOpen(false)
    } catch (error) {
      console.error('Feedback submission error:', error)
      toast.error('送信に失敗しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }

  // テスト環境でのみ表示
  if (!window.location.hostname.includes('test') && 
      import.meta.env.VITE_TEST_MODE !== 'true') {
    return null
  }

  return (
    <>
      {/* フィードバックボタン */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors z-40"
        aria-label="フィードバックを送信"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* フィードバックモーダル */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  テストフィードバック
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* カテゴリー選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリー
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(categoryIcons) as Array<keyof typeof categoryIcons>).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFeedback({ ...feedback, category: cat })}
                        className={`flex items-center justify-center space-x-2 p-2 rounded-lg border transition-colors ${
                          feedback.category === cat
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {categoryIcons[cat]}
                        <span className="text-xs">{categoryLabels[cat]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* タイトル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タイトル
                  </label>
                  <input
                    type="text"
                    value={feedback.title}
                    onChange={(e) => setFeedback({ ...feedback, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="簡潔なタイトルを入力"
                    maxLength={100}
                  />
                </div>

                {/* 詳細 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    詳細
                  </label>
                  <textarea
                    value={feedback.description}
                    onChange={(e) => setFeedback({ ...feedback, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      feedback.category === 'bug' 
                        ? '発生した問題と再現手順を詳しく記載してください'
                        : '詳細な説明を記載してください'
                    }
                    rows={4}
                  />
                </div>

                {/* 優先度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    優先度
                  </label>
                  <select
                    value={feedback.priority}
                    onChange={(e) => setFeedback({ 
                      ...feedback, 
                      priority: e.target.value as FeedbackData['priority'] 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {(Object.keys(priorityLabels) as Array<keyof typeof priorityLabels>).map((priority) => (
                      <option key={priority} value={priority}>
                        {priorityLabels[priority]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={isSubmitting || !feedback.title || !feedback.description}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>送信</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-xs text-gray-500">
                ※ フィードバックはシステム改善のために使用されます
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default TestFeedbackWidget