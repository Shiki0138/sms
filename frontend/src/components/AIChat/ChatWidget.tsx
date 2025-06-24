import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, ThumbsUp, ThumbsDown, Sparkles, Minimize2 } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
  suggestions?: string[]
}

interface ChatHistory {
  id: string
  userMessage: string
  aiResponse: string
  createdAt: string
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [showFeedback, setShowFeedback] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  // 初期メッセージ
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const isTestMode = window.location.hostname === 'localhost' || window.location.hostname.includes('test') || window.location.hostname.includes('demo')
      const welcomeText = isTestMode 
        ? 'こんにちは！美容室管理システムのテスト環境へようこそ。✨\n\nこちらはデモ用のAIサポートです。システムの使い方について何でもお聞きください！\n\n※テストモードでは実際のOpenAI APIは使用せず、モック応答で動作します。'
        : 'こんにちは！美容室管理システムのサポートアシスタントです。✨\n\nシステムの使い方や機能について、何でもお気軽にご質問ください。'
      
      setMessages([{
        id: 'welcome',
        text: welcomeText,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: ['予約の登録方法', '顧客情報の確認', 'よくある質問']
      }])
    }
  }, [isOpen, messages.length])

  // スクロール制御
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 会話履歴の読み込み
  useEffect(() => {
    if (isOpen && sessionId && user) {
      loadChatHistory()
    }
  }, [isOpen, sessionId, user])

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(`/api/v1/ai-support/history`, {
        params: { sessionId, limit: 20 }
      })
      
      if (response.data.success && response.data.data.length > 0) {
        const historyMessages: Message[] = response.data.data.flatMap((item: ChatHistory) => [
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
        setMessages(prev => [...historyMessages, ...prev])
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/v1/ai-support/chat', {
        message: inputText,
        sessionId: sessionId || undefined
      })

      if (response.data.success) {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          text: response.data.data.response,
          sender: 'ai',
          timestamp: new Date(),
          suggestions: response.data.data.suggestions
        }
        
        setMessages(prev => [...prev, aiMessage])
        
        if (!sessionId) {
          setSessionId(response.data.data.sessionId)
        }
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: '申し訳ございません。現在接続に問題が発生しています。しばらくしてからもう一度お試しください。',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputText(suggestion)
    inputRef.current?.focus()
  }

  const handleFeedback = async (messageId: string, helpful: boolean) => {
    try {
      await axios.post('/api/v1/ai-support/feedback', {
        sessionId,
        messageId,
        helpful
      })
      setShowFeedback(messageId)
      setTimeout(() => setShowFeedback(null), 2000)
    } catch (error) {
      console.error('Failed to send feedback:', error)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 z-50"
        aria-label="AIサポートを開く"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
        </div>
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl transition-all duration-300 z-50 ${
      isMinimized ? 'w-80 h-14' : 'w-96 h-[600px]'
    }`}>
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">AIサポート</span>
            {(window.location.hostname === 'localhost' || window.location.hostname.includes('test') || window.location.hostname.includes('demo')) && (
              <span className="text-xs text-blue-200">テストモード</span>
            )}
          </div>
          {isLoading && (
            <div className="ml-2">
              <div className="animate-pulse flex space-x-1">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <div className="w-1 h-1 bg-white rounded-full animation-delay-200"></div>
                <div className="w-1 h-1 bg-white rounded-full animation-delay-400"></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 rounded p-1 transition-colors"
            aria-label="最小化"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 rounded p-1 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* メッセージエリア */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-8rem)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : ''}`}>
                  <div className={`rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                  
                  <div className={`flex items-center mt-1 text-xs text-gray-500 ${
                    message.sender === 'user' ? 'justify-end' : ''
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    
                    {message.sender === 'ai' && !message.id.includes('welcome') && (
                      <div className="ml-2 flex items-center space-x-1">
                        <button
                          onClick={() => handleFeedback(message.id, true)}
                          className="hover:text-green-600 transition-colors"
                          aria-label="役に立った"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, false)}
                          className="hover:text-red-600 transition-colors"
                          aria-label="役に立たなかった"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                        {showFeedback === message.id && (
                          <span className="text-green-600 ml-1">ありがとうございます！</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded px-2 py-1 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage()
              }}
              className="flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="質問を入力してください..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="送信"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}

export default ChatWidget