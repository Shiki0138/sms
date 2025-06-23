import React from 'react'
import { X, MessageSquare } from 'lucide-react'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  userEmail?: string
  userName?: string
  defaultType?: 'bug' | 'feature' | 'general'
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">お問い合わせについて</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            
            <h4 className="text-lg font-medium text-gray-900 mb-3">
              LINEグループでのサポート
            </h4>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              お問い合わせ、ご要望、ご質問等は専用のLINEグループにてご案内いたします。
              <br /><br />
              詳細なご案内方法については、システム管理者より別途ご連絡いたします。
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500">
              ※ メールアドレス、電話番号等での直接のお問い合わせは現在受け付けておりません
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal