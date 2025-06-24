import { useState, useCallback } from 'react'
import axios from 'axios'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  suggestions?: string[]
}

interface SendMessageResponse {
  success: boolean
  data?: {
    sessionId: string
    response: string
    suggestions: string[]
  }
  error?: string
}

interface FAQCategory {
  category: string
  questions: {
    question: string
    answer: string
  }[]
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [sessionId, setSessionId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // メッセージ送信
  const sendMessage = useCallback(async (text: string): Promise<boolean> => {
    if (!text.trim()) return false

    setError(null)
    setIsLoading(true)

    // ユーザーメッセージを追加
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      text,
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await axios.post<SendMessageResponse>('/api/v1/ai-support/chat', {
        message: text,
        sessionId: sessionId || undefined
      })

      if (response.data.success && response.data.data) {
        // AIメッセージを追加
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          text: response.data.data.response,
          sender: 'ai',
          timestamp: new Date(),
          suggestions: response.data.data.suggestions
        }
        setMessages(prev => [...prev, aiMessage])

        // セッションIDを保存
        if (!sessionId && response.data.data.sessionId) {
          setSessionId(response.data.data.sessionId)
        }

        return true
      } else {
        throw new Error(response.data.error || 'メッセージの送信に失敗しました')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '予期しないエラーが発生しました'
      setError(errorMessage)

      // エラーメッセージを追加
      const errorAiMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        text: '申し訳ございません。現在サポートに接続できません。しばらくしてからもう一度お試しください。',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorAiMessage])

      return false
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  // 会話履歴を読み込み
  const loadHistory = useCallback(async () => {
    if (!sessionId) return

    setIsLoading(true)
    try {
      const response = await axios.get('/api/v1/ai-support/history', {
        params: { sessionId, limit: 50 }
      })

      if (response.data.success && response.data.data) {
        const historyMessages: ChatMessage[] = response.data.data.flatMap((item: any) => [
          {
            id: `user-${item.id}`,
            text: item.userMessage,
            sender: 'user' as const,
            timestamp: new Date(item.createdAt)
          },
          {
            id: `ai-${item.id}`,
            text: item.aiResponse,
            sender: 'ai' as const,
            timestamp: new Date(item.createdAt)
          }
        ])
        setMessages(historyMessages)
      }
    } catch (err) {
      console.error('Failed to load chat history:', err)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId])

  // FAQを取得
  const loadFAQ = useCallback(async (): Promise<FAQCategory[]> => {
    try {
      const response = await axios.get('/api/v1/ai-support/faq')
      if (response.data.success && response.data.data) {
        return response.data.data
      }
      return []
    } catch (err) {
      console.error('Failed to load FAQ:', err)
      return []
    }
  }, [])

  // フィードバックを送信
  const sendFeedback = useCallback(async (messageId: string, helpful: boolean): Promise<boolean> => {
    if (!sessionId) return false

    try {
      const response = await axios.post('/api/v1/ai-support/feedback', {
        sessionId,
        messageId,
        helpful
      })
      return response.data.success
    } catch (err) {
      console.error('Failed to send feedback:', err)
      return false
    }
  }, [sessionId])

  // 会話をクリア
  const clearMessages = useCallback(() => {
    setMessages([])
    setSessionId('')
    setError(null)
  }, [])

  return {
    messages,
    sessionId,
    isLoading,
    error,
    sendMessage,
    loadHistory,
    loadFAQ,
    sendFeedback,
    clearMessages
  }
}