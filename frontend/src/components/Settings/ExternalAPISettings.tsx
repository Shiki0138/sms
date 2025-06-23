import React from 'react'
import { 
  MessageCircle, 
  Instagram, 
  Shield,
  AlertCircle,
  Info
} from 'lucide-react'

const ExternalAPISettings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* セキュリティ警告 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-yellow-600" />
          <h2 className="text-lg font-bold text-yellow-800">外部API設定について</h2>
        </div>
        <p className="text-yellow-700 mt-2">
          現在、外部API連携設定は安全性確保のため一時的に無効化されています。
        </p>
      </div>

      {/* LINE API */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold">LINE連携</h3>
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
            設定無効化中
          </span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Info className="w-4 h-4" />
            <span className="font-medium">LINE連携について</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            LINE公式アカウントとの連携機能は、セキュリティ確保のため現在無効化されています。
            <br />
            詳細な設定方法については、LINEグループにてご案内いたします。
          </p>
        </div>
      </div>

      {/* Instagram API */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Instagram className="w-6 h-6 text-pink-600" />
          <h3 className="text-lg font-semibold">Instagram連携</h3>
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
            設定無効化中
          </span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Info className="w-4 h-4" />
            <span className="font-medium">Instagram連携について</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Instagram Graph APIとの連携機能は、セキュリティ確保のため現在無効化されています。
            <br />
            詳細な設定方法については、LINEグループにてご案内いたします。
          </p>
        </div>
      </div>

      {/* お問い合わせ案内 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-blue-600" />
          </div>
          
          <h4 className="text-lg font-medium text-blue-900 mb-2">
            設定に関するお問い合わせ
          </h4>
          
          <p className="text-blue-700 text-sm leading-relaxed">
            外部API連携の詳細設定や個別サポートについては、
            <br />
            専用のLINEグループにてご案内いたします。
            <br /><br />
            LINEグループへのご案内は、システム管理者より別途ご連絡いたします。
          </p>
          
          <div className="mt-4 text-xs text-blue-600">
            ※ メールアドレス、電話番号等での直接のお問い合わせは受け付けておりません
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExternalAPISettings