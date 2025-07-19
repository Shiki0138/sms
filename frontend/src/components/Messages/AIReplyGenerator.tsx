import React, { useState } from 'react'
import { Bot, Loader2, RefreshCw, Check, X } from 'lucide-react'

interface Customer {
  id: string
  name: string
  visitHistory?: any[]
  preferences?: string[]
  lastService?: string
}

interface Message {
  id: string
  content: string
  createdAt: string
  senderType: 'CUSTOMER' | 'STAFF'
}

interface AIReplyGeneratorProps {
  threadId: string
  customerData: Customer
  messageHistory: Message[]
  onReplyGenerated: (reply: string) => void
  onClose: () => void
}

interface AIReplyResponse {
  reply: string
  confidence: number
  reasoning: string
  alternatives: string[]
}

const AIReplyGenerator: React.FC<AIReplyGeneratorProps> = ({
  threadId,
  customerData,
  messageHistory,
  onReplyGenerated,
  onClose
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReply, setGeneratedReply] = useState<AIReplyResponse | null>(null)
  const [editedReply, setEditedReply] = useState('')
  const [error, setError] = useState<string | null>(null)

  const generateAIReply = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      // API呼び出し (チームBが実装するエンドポイント)
      const response = await fetch('/api/v1/ai/generate-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          threadId,
          customerData: {
            name: customerData.name,
            visitHistory: customerData.visitHistory || [],
            preferences: customerData.preferences || [],
            lastService: customerData.lastService || ''
          },
          messageHistory: messageHistory.slice(-5), // 最新5件のメッセージ
          messageType: 'general'
        })
      })

      if (!response.ok) {
        throw new Error('AI返信生成に失敗しました')
      }

      const aiResponse: AIReplyResponse = await response.json()
      setGeneratedReply(aiResponse)
      setEditedReply(aiResponse.reply)
    } catch (err) {
      console.error('AI Reply Generation Error:', err)
      setError(err instanceof Error ? err.message : 'AI返信生成中にエラーが発生しました')
      
      // フォールバック: デモ用の返信生成
      const demoReply = generateDemoReply()
      setGeneratedReply(demoReply)
      setEditedReply(demoReply.reply)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateDemoReply = (): AIReplyResponse => {
    const lastMessage = messageHistory[messageHistory.length - 1]?.content || ''
    
    let reply = ''
    if (lastMessage.includes('予約') || lastMessage.includes('空いて')) {
      reply = `${customerData.name}様、お問い合わせありがとうございます。ご希望のお日にちをお聞かせください。お客様に最適なお時間をご提案させていただきます。`
    } else if (lastMessage.includes('カット') || lastMessage.includes('カラー')) {
      reply = `${customerData.name}様、いつもありがとうございます。${customerData.lastService ? `前回の${customerData.lastService}もとてもお似合いでした。` : ''}ご希望のスタイルについて詳しくお聞かせください。`
    } else {
      reply = `${customerData.name}様、いつもありがとうございます。お気軽にご相談ください。スタッフ一同、心よりお待ちしております。`
    }

    return {
      reply,
      confidence: 0.85,
      reasoning: '顧客情報とメッセージ履歴から最適な返信を生成しました',
      alternatives: [
        'ありがとうございます。詳細をお聞かせください。',
        'お問い合わせいただき、ありがとうございます。'
      ]
    }
  }

  const handleUseReply = () => {
    onReplyGenerated(editedReply)
  }

  const handleRegenerate = () => {
    generateAIReply()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">AI返信生成</h2>
                <p className="text-sm text-gray-600">{customerData.name}様への返信を作成</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 顧客情報 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">顧客情報</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">お名前:</span> {customerData.name}</p>
              {customerData.lastService && (
                <p><span className="font-medium">前回サービス:</span> {customerData.lastService}</p>
              )}
              {customerData.preferences && customerData.preferences.length > 0 && (
                <p><span className="font-medium">好み:</span> {customerData.preferences.join(', ')}</p>
              )}
            </div>
          </div>

          {/* メッセージ履歴 */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">最近のメッセージ</h3>
            <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {messageHistory.slice(-3).map((message, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <div className={`text-sm ${
                    message.senderType === 'CUSTOMER' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    <span className="font-medium">
                      {message.senderType === 'CUSTOMER' ? 'お客様' : 'スタッフ'}:
                    </span>
                    <span className="ml-2">{message.content}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI返信生成 */}
          {!generatedReply ? (
            <div className="text-center py-8">
              {isGenerating ? (
                <div className="space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
                  <p className="text-gray-600">AIが返信を生成中...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Bot className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="text-gray-600">AIが最適な返信を生成します</p>
                  <button
                    onClick={generateAIReply}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    返信を生成
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* 生成された返信 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">生成された返信</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span>信頼度: {Math.round(generatedReply.confidence * 100)}%</span>
                  </div>
                </div>
                <textarea
                  value={editedReply}
                  onChange={(e) => setEditedReply(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="返信内容を編集できます"
                />
              </div>

              {/* AI分析理由 */}
              {generatedReply.reasoning && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <span className="font-medium">AI分析:</span> {generatedReply.reasoning}
                  </p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={handleRegenerate}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>再生成</span>
                </button>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUseReply}
                    disabled={!editedReply.trim()}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>この返信を使用</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* エラー表示 */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AIReplyGenerator