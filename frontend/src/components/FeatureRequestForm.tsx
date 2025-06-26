import React, { useState } from 'react'
import { MessageSquare, ExternalLink } from 'lucide-react'
import { getEnvironmentConfig } from '../utils/environment'
import DemoFeedbackForm from './Demo/DemoFeedbackForm'

interface FeatureRequestFormProps {
  onNewRequest?: (request: any) => void
}

const FeatureRequestForm: React.FC<FeatureRequestFormProps> = ({ onNewRequest }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false)
  const config = getEnvironmentConfig()

  // デモモードの場合はフィードバックフォームを表示
  if (config.isDemoMode) {
    return (
      <>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                🎭
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                デモモード お問い合わせ・フィードバック
              </h2>
              
              <div className="max-w-2xl mx-auto text-gray-600 space-y-4">
                <p className="text-lg">
                  システムの改善点やご要望、エラー報告など、
                  <br />
                  お気づきの点がございましたらお聞かせください。
                </p>
                
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mt-6">
                  <div className="flex items-center justify-center space-x-2 text-purple-800 font-medium mb-3">
                    <MessageSquare className="w-5 h-5" />
                    <span>デモ期間中のフィードバック収集</span>
                  </div>
                  <p className="text-purple-700 text-sm leading-relaxed mb-4">
                    いただいたフィードバックは開発チームで検討し、
                    <br />
                    サービス改善に活用させていただきます。
                  </p>
                  
                  <button
                    onClick={() => setShowFeedbackForm(true)}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                  >
                    フィードバックを送信
                  </button>
                </div>
                
                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="text-amber-800 font-medium mb-2">デモ期間中の注意事項</h3>
                  <div className="text-amber-700 text-sm space-y-1">
                    <p>• 実際のデータを登録してお試しいただけます</p>
                    <p>• LINE・決済機能など一部機能は制限されています</p>
                    <p>• データは{config.demoExpiryDays || 30}日後に自動削除されます</p>
                    <p>• お問い合わせは専用フォームからお願いいたします</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DemoFeedbackForm 
          isOpen={showFeedbackForm}
          onClose={() => setShowFeedbackForm(false)}
          currentPage="feedback"
        />
      </>
    )
  }

  // 通常モードの場合は従来のLINE案内を表示
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            お問い合わせ・ご要望について
          </h2>
          
          <div className="max-w-2xl mx-auto text-gray-600 space-y-4">
            <p className="text-lg">
              システムに関するお問い合わせ、機能改善のご要望、
              <br />
              ご質問等は専用のLINEグループにてご案内いたします。
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
              <div className="flex items-center justify-center space-x-2 text-blue-800 font-medium mb-3">
                <MessageSquare className="w-5 h-5" />
                <span>LINEグループでのサポート</span>
              </div>
              <p className="text-blue-700 text-sm leading-relaxed">
                詳細なお問い合わせ方法、LINEグループへのご案内は
                <br />
                システム管理者より別途ご連絡いたします。
              </p>
            </div>
            
            <div className="mt-8 text-sm text-gray-500">
              <p>
                ※ メールアドレス、電話番号等での直接のお問い合わせは
                <br />
                現在受け付けておりません
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureRequestForm