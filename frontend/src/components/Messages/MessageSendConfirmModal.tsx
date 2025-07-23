import React from 'react'
import { X, Send, AlertTriangle, MessageCircle, Instagram } from 'lucide-react'

interface MessageSendConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  message: {
    content: string
    channel: 'LINE' | 'INSTAGRAM'
    recipientName: string
    recipientId?: string
  }
  isLoading: boolean
}

const MessageSendConfirmModal: React.FC<MessageSendConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  isLoading
}) => {
  if (!isOpen) return null

  const ChannelIcon = message.channel === 'LINE' ? MessageCircle : Instagram
  const channelName = message.channel === 'LINE' ? 'LINE' : 'Instagram'
  const channelColor = message.channel === 'LINE' ? 'green' : 'pink'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            メッセージ送信確認
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 警告メッセージ */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">外部サービスへの送信</p>
                <p>このメッセージは実際に{channelName}経由で顧客に送信されます。</p>
              </div>
            </div>
          </div>

          {/* 送信内容 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <ChannelIcon className={`w-5 h-5 text-${channelColor}-600`} />
              <span className="font-medium text-gray-900">{channelName}メッセージ</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">宛先:</span>
                <span className="ml-2 font-medium">{message.recipientName}</span>
                {message.recipientId && (
                  <span className="ml-1 text-xs text-gray-400">
                    ({message.recipientId.substring(0, 10)}...)
                  </span>
                )}
              </div>
              
              <div>
                <span className="text-gray-500">内容:</span>
                <div className="mt-1 p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            </div>
          </div>

          {/* チェックリスト */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 font-medium mb-2">送信前の確認事項</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>✓ メッセージの内容に誤りはありませんか？</li>
              <li>✓ 送信先の顧客は正しいですか？</li>
              <li>✓ 営業時間内の送信ですか？</li>
              {message.channel === 'INSTAGRAM' && (
                <li>✓ 24時間以内に顧客からメッセージを受信していますか？</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>送信中...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>送信する</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MessageSendConfirmModal