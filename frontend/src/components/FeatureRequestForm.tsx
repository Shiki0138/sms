import React from 'react'
import { MessageSquare, ExternalLink } from 'lucide-react'

interface FeatureRequestFormProps {
  onNewRequest?: (request: any) => void
}

const FeatureRequestForm: React.FC<FeatureRequestFormProps> = ({ onNewRequest }) => {
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