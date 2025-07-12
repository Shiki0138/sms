import React, { useState } from 'react'
import { 
  Send, 
  Lightbulb, 
  CheckCircle, 
  AlertCircle,
  Star,
  Bug,
  Zap,
  Plus,
  Loader,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface FeatureRequest {
  id: string
  title: string
  description: string
  category: 'bug' | 'feature' | 'improvement' | 'other'
  priority: 'low' | 'medium' | 'high'
  userInfo: {
    name: string
    email: string
    role: string
  }
  submittedAt: string
  status: 'submitted' | 'under_review' | 'in_progress' | 'completed' | 'rejected'
}

interface FeatureRequestFormProps {
  onNewRequest?: (request: FeatureRequest) => void
}

const FeatureRequestForm: React.FC<FeatureRequestFormProps> = ({ onNewRequest }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'feature' as const,
    priority: 'medium' as const,
    userInfo: {
      name: '',
      email: '',
      role: 'staff'
    }
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submittedRequests, setSubmittedRequests] = useState<FeatureRequest[]>([])

  const categoryOptions = [
    { value: 'bug', label: 'バグ報告', icon: Bug, color: 'text-red-600' },
    { value: 'feature', label: '新機能', icon: Plus, color: 'text-blue-600' },
    { value: 'improvement', label: '機能改善', icon: Zap, color: 'text-yellow-600' },
    { value: 'other', label: 'その他', icon: Star, color: 'text-purple-600' }
  ]

  const priorityOptions = [
    { value: 'low', label: '低', color: 'text-green-600' },
    { value: 'medium', label: '中', color: 'text-yellow-600' },
    { value: 'high', label: '高', color: 'text-red-600' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // APIエンドポイントに送信
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4002' : '/api')
      
      const response = await fetch(`${API_URL}/v1/feedback/feature-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          userInfo: formData.userInfo,
          submittedAt: new Date().toISOString(),
          systemInfo: {
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit feature request')
      }

      const result = await response.json()
      
      const newRequest: FeatureRequest = {
        id: result.id || `req_${Date.now()}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        userInfo: formData.userInfo,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      }

      setSubmittedRequests(prev => [newRequest, ...prev])
      setSubmitStatus('success')
      
      // Notify parent component about new request
      if (onNewRequest) {
        onNewRequest(newRequest)
      }
      
      // フォームリセット
      setFormData({
        title: '',
        description: '',
        category: 'feature',
        priority: 'medium',
        userInfo: {
          name: '',
          email: '',
          role: 'staff'
        }
      })

      // 成功メッセージを3秒後にクリア
      setTimeout(() => setSubmitStatus('idle'), 3000)

    } catch (error) {
      console.error('Feature request submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category)
    const Icon = option?.icon || Star
    return <Icon className={`w-5 h-5 ${option?.color || 'text-gray-600'}`} />
  }

  const getStatusBadge = (status: FeatureRequest['status']) => {
    const statusConfig = {
      submitted: { label: '送信済み', color: 'bg-blue-100 text-blue-800' },
      under_review: { label: '確認中', color: 'bg-yellow-100 text-yellow-800' },
      in_progress: { label: '開発中', color: 'bg-purple-100 text-purple-800' },
      completed: { label: '完了', color: 'bg-green-100 text-green-800' },
      rejected: { label: '却下', color: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status]
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4">
          <Lightbulb className="w-8 h-8 mr-3 text-yellow-600" />
          機能改善要望
        </h2>
        <p className="text-gray-600">
          システムの改善点や新機能のご要望をお聞かせください。
          お寄せいただいたご意見は開発チームが確認し、システムの向上に活用させていただきます。
        </p>
      </div>

      {/* 要望送信フォーム */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">新しい要望を送信</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.userInfo.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  userInfo: { ...prev.userInfo, name: e.target.value }
                }))}
                placeholder="山田 太郎"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.userInfo.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  userInfo: { ...prev.userInfo, email: e.target.value }
                }))}
                placeholder="example@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              要望タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="カレンダー表示の改善について"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* カテゴリーと優先度 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリー <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categoryOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: option.value as any }))}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        formData.category === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${option.color}`} />
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                優先度 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 詳細説明 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              詳細説明 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="具体的な改善点や要望内容をお書きください。現在の問題点、期待する動作、使用環境などの詳細があると開発の参考になります。"
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* 送信ボタン */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  送信中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  要望を送信
                </>
              )}
            </button>
          </div>
        </form>

        {/* 送信結果 */}
        {submitStatus === 'success' && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">要望を送信しました</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              ご意見ありがとうございます。開発チームで確認後、必要に応じてご連絡いたします。
            </p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <span className="font-medium text-red-800">送信に失敗しました</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              時間をおいて再度お試しください。
            </p>
          </div>
        )}
      </div>

      {/* 送信済み要望一覧 */}
      {submittedRequests.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">送信済みの要望</h3>
          
          <div className="space-y-4">
            {submittedRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(request.category)}
                    <div>
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {format(new Date(request.submittedAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </span>
                        <span className={`text-xs font-medium ${
                          request.priority === 'high' ? 'text-red-600' :
                          request.priority === 'medium' ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          優先度: {priorityOptions.find(p => p.value === request.priority)?.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
                
                <p className="text-sm text-gray-700 line-clamp-3">
                  {request.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 使い方のヒント */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">効果的な要望の書き方</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">📝 具体的に書く</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• 現在の問題点を明確に</li>
              <li>• 期待する動作を詳しく</li>
              <li>• 使用している機能名を記載</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🎯 背景情報を含める</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• なぜその機能が必要か</li>
              <li>• 現在の回避方法</li>
              <li>• 業務への影響度</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureRequestForm