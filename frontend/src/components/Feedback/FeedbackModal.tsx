import React, { useState, useRef } from 'react'
import {
  X,
  Bug,
  Lightbulb,
  MessageSquare,
  Camera,
  Send,
  Star,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import html2canvas from 'html2canvas'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  userEmail?: string
  userName?: string
  defaultType?: 'bug' | 'feature' | 'general'
}

interface FeedbackData {
  type: 'bug' | 'feature' | 'general'
  title: string
  description: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  screenshot?: string
  rating?: number
  userAgent: string
  url: string
  timestamp: string
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  userName,
  defaultType = 'general'
}) => {
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>(defaultType)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [category, setCategory] = useState('')
  const [rating, setRating] = useState(0)
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = {
    bug: ['UI表示', 'データ処理', 'パフォーマンス', '認証・権限', 'その他'],
    feature: ['予約管理', '顧客管理', 'メッセージ', '分析', '決済', 'その他'],
    general: ['使いやすさ', 'デザイン', 'パフォーマンス', 'ドキュメント', 'その他']
  }

  const handleScreenshot = async () => {
    try {
      onClose() // モーダルを一時的に閉じる
      
      setTimeout(async () => {
        const canvas = await html2canvas(document.body, {
          ignoreElements: (element) => {
            return element.classList.contains('feedback-modal')
          }
        })
        
        const dataUrl = canvas.toDataURL('image/png')
        setScreenshot(dataUrl)
        
        // モーダルを再度開く
        setTimeout(() => {
          // Re-open modal logic
        }, 100)
      }, 100)
    } catch (error) {
      console.error('Screenshot failed:', error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setScreenshot(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    if (!title || !description) {
      setSubmitError('タイトルと詳細は必須です')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    const feedbackData: FeedbackData = {
      type: feedbackType,
      title,
      description,
      severity: feedbackType === 'bug' ? severity : undefined,
      category,
      screenshot: screenshot || undefined,
      rating: feedbackType === 'general' ? rating : undefined,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...feedbackData,
          userId,
          userEmail,
          userName
        })
      })

      if (!response.ok) {
        throw new Error('フィードバックの送信に失敗しました')
      }

      setSubmitSuccess(true)
      setTimeout(() => {
        onClose()
        // Reset form
        setTitle('')
        setDescription('')
        setCategory('')
        setRating(0)
        setScreenshot(null)
        setSubmitSuccess(false)
      }, 2000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 feedback-modal">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">フィードバック</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Beta Tester Badge */}
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Star className="w-3 h-3 mr-1" />
            ベータテスター
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Feedback Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              フィードバックの種類
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setFeedbackType('bug')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  feedbackType === 'bug'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Bug className="w-6 h-6 mx-auto mb-1 text-red-500" />
                <span className="text-sm font-medium">バグ報告</span>
              </button>
              
              <button
                onClick={() => setFeedbackType('feature')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  feedbackType === 'feature'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Lightbulb className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
                <span className="text-sm font-medium">機能要望</span>
              </button>
              
              <button
                onClick={() => setFeedbackType('general')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  feedbackType === 'general'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                <span className="text-sm font-medium">ご意見</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                feedbackType === 'bug'
                  ? '例: 予約画面でエラーが発生する'
                  : feedbackType === 'feature'
                  ? '例: 予約の一括キャンセル機能が欲しい'
                  : '例: ダッシュボードの使い勝手について'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリー
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">選択してください</option>
              {categories[feedbackType].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Severity (for bugs only) */}
          {feedbackType === 'bug' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                重要度
              </label>
              <div className="flex space-x-3">
                {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSeverity(level)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      severity === level
                        ? level === 'critical'
                          ? 'bg-red-600 text-white'
                          : level === 'high'
                          ? 'bg-orange-600 text-white'
                          : level === 'medium'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'critical' ? '致命的' : level === 'high' ? '高' : level === 'medium' ? '中' : '低'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rating (for general feedback only) */}
          {feedbackType === 'general' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                総合評価
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              詳細 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder={
                feedbackType === 'bug'
                  ? '再現手順や発生条件など、できるだけ詳しくお書きください'
                  : feedbackType === 'feature'
                  ? 'どのような機能が必要か、なぜ必要かをお書きください'
                  : 'ご意見・ご感想をお聞かせください'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Screenshot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スクリーンショット
            </label>
            <div className="space-y-3">
              <div className="flex space-x-3">
                <button
                  onClick={handleScreenshot}
                  className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  画面をキャプチャ
                </button>
                
                <label className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  画像をアップロード
                </label>
              </div>
              
              {screenshot && (
                <div className="relative">
                  <img
                    src={screenshot}
                    alt="Screenshot"
                    className="w-full max-h-64 object-contain border border-gray-200 rounded-md"
                  />
                  <button
                    onClick={() => setScreenshot(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error/Success Messages */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{submitError}</span>
            </div>
          )}
          
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm text-green-700">
                フィードバックを送信しました。ありがとうございます！
              </span>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <Info className="w-4 h-4 mr-1" />
              <span>フィードバックは品質向上のために活用させていただきます</span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !title || !description}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    送信中...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    送信
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal