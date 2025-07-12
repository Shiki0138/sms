import React, { useState } from 'react'
import { Bot, Loader2, Copy, Check, AlertCircle } from 'lucide-react'
import { useSubscription } from '../contexts/SubscriptionContext'

interface AIReplyGeneratorProps {
  context: {
    customerName: string
    message: string
    channel: 'LINE' | 'INSTAGRAM'
  }
  onGenerated: (reply: string) => void
}

const AIReplyGenerator: React.FC<AIReplyGeneratorProps> = ({ context, onGenerated }) => {
  const { subscriptionInfo, getRemainingLimit } = useSubscription()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReply, setGeneratedReply] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const remainingAIReplies = getRemainingLimit('maxAIRepliesPerMonth', subscriptionInfo?.currentUsage.aiRepliesThisMonth || 0)

  const generateReply = async () => {
    if (remainingAIReplies !== null && remainingAIReplies <= 0) {
      setError('今月のAI返信生成回数の上限に達しました。')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      // 実際のAI API呼び出しの代わりに、デモ用の返信生成
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let reply = ''
      
      if (context.message.includes('予約')) {
        reply = `${context.customerName}様\n\nご予約についてのお問い合わせありがとうございます。\n\n空き状況を確認させていただきますので、ご希望の日時をいくつかお教えいただけますでしょうか？\n\nまた、ご希望のメニューがございましたら併せてお知らせください。\n\nよろしくお願いいたします。`
      } else if (context.message.includes('キャンセル')) {
        reply = `${context.customerName}様\n\nご連絡ありがとうございます。\n\nご予約のキャンセルを承りました。\nまたのご来店を心よりお待ちしております。\n\n何かご不明な点がございましたら、お気軽にお問い合わせください。`
      } else if (context.message.includes('料金') || context.message.includes('値段')) {
        reply = `${context.customerName}様\n\nお問い合わせありがとうございます。\n\n料金につきましては、メニューによって異なりますので、詳しくは以下をご確認ください：\n\n・カット: ¥4,500〜\n・カラー: ¥6,500〜\n・パーマ: ¥7,000〜\n\nその他のメニューや詳細な料金については、お電話でもご案内させていただきます。\n\nよろしくお願いいたします。`
      } else {
        reply = `${context.customerName}様\n\nお問い合わせありがとうございます。\n\n詳しくお話を伺いたいので、お手数ですが、もう少し詳しくお教えいただけますでしょうか？\n\nまたは、お電話でもご相談を承っております。\n\nよろしくお願いいたします。`
      }
      
      setGeneratedReply(reply)
      
      // 使用回数を更新（実際の実装では、APIで管理）
      if (subscriptionInfo) {
        subscriptionInfo.currentUsage.aiRepliesThisMonth += 1
      }
    } catch (error) {
      setError('返信の生成に失敗しました。もう一度お試しください。')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onGenerated(generatedReply)
  }

  return (
    <div className="space-y-4">
      {/* AI返信生成ボタン */}
      <div className="flex items-center justify-between">
        <button
          onClick={generateReply}
          disabled={isGenerating || (remainingAIReplies !== null && remainingAIReplies <= 0)}
          className="btn btn-primary btn-sm flex items-center space-x-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" />
              <span>AI返信を生成</span>
            </>
          )}
        </button>
        
        {remainingAIReplies !== null && (
          <div className="text-sm text-gray-600">
            今月の残り回数: <span className="font-medium">{remainingAIReplies}回</span>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* 生成された返信 */}
      {generatedReply && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900">AI生成返信</h4>
            <button
              onClick={copyToClipboard}
              className="text-blue-600 hover:text-blue-700 p-1"
            >
              {copied ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {generatedReply}
          </div>
          <div className="mt-3 text-xs text-gray-600">
            ※ この返信内容を確認・編集してから送信してください
          </div>
        </div>
      )}
    </div>
  )
}

export default AIReplyGenerator