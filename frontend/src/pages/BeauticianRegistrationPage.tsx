import React from 'react'
import { Sparkles, Users, MapPin, Star } from 'lucide-react'
import BeauticianRegistration from '../components/SupportBeautician/BeauticianRegistration'

const BeauticianRegistrationPage: React.FC = () => {
  const handleRegistrationComplete = () => {
    alert('登録が完了しました！審査完了後、マッチング可能な案件をお知らせします。')
    // 実際の実装では、成功ページへリダイレクトまたは状態を更新
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">応援美容師 登録</h1>
              <p className="text-gray-600">あなたのスキルで美容業界を支えませんか？</p>
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 説明セクション */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              応援美容師プラットフォームとは？
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              あなたの技術と経験を活かして、困っているサロンを支援しませんか？
              自分の条件に合った案件に応募して、柔軟な働き方を実現できます。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">自由な働き方</h3>
              <p className="text-sm text-gray-600">
                あなたの都合に合わせて、働く時間・場所・条件を自由に設定できます
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">幅広い案件</h3>
              <p className="text-sm text-gray-600">
                様々なエリア・サロンタイプの案件から、あなたに最適なものを選択
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">スキルアップ</h3>
              <p className="text-sm text-gray-600">
                多様なサロンでの経験を通じて、新しい技術やノウハウを習得
              </p>
            </div>
          </div>
        </div>

        {/* 登録の流れ */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">登録の流れ</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-medium">
                1
              </div>
              <h4 className="font-medium text-gray-900 mb-1">プロフィール登録</h4>
              <p className="text-xs text-gray-600">基本情報とスキルを入力</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-medium">
                2
              </div>
              <h4 className="font-medium text-gray-900 mb-1">審査</h4>
              <p className="text-xs text-gray-600">資格・経験の確認（1-2営業日）</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-medium">
                3
              </div>
              <h4 className="font-medium text-gray-900 mb-1">マッチング</h4>
              <p className="text-xs text-gray-600">条件に合う案件を自動紹介</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-medium">
                4
              </div>
              <h4 className="font-medium text-gray-900 mb-1">勤務開始</h4>
              <p className="text-xs text-gray-600">サロンでのお仕事スタート</p>
            </div>
          </div>
        </div>

        {/* 登録フォーム */}
        <BeauticianRegistration onComplete={handleRegistrationComplete} />

        {/* フッター情報 */}
        <div className="mt-8 text-center">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">サポート・お問い合わせ</h3>
            <p className="text-sm text-gray-600 mb-2">
              登録についてご不明な点がございましたら、お気軽にお問い合わせください。
            </p>
            <p className="text-sm text-gray-600">
              📧 support@salon-support.jp | 📞 03-1234-5678（平日 9:00-18:00）
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BeauticianRegistrationPage