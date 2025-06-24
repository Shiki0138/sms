import React from 'react'
import { Check, X, Sparkles } from 'lucide-react'
import { SubscriptionPlan } from '../../types/subscription'

interface FeatureComparisonProps {
  currentPlan: SubscriptionPlan
  compact?: boolean
}

interface Feature {
  category: string
  name: string
  light: boolean | string
  standard: boolean | string
  premium_ai: boolean | string
}

const FeatureComparison: React.FC<FeatureComparisonProps> = ({ currentPlan, compact = false }) => {
  const features: Feature[] = [
    // 基本機能
    { category: '顧客管理', name: '顧客登録・編集', light: '500名まで', standard: '2,000名まで', premium_ai: '無制限' },
    { category: '顧客管理', name: '顧客写真管理', light: false, standard: true, premium_ai: true },
    { category: '顧客管理', name: '顧客セグメント分析', light: false, standard: true, premium_ai: true },
    { category: 'スタッフ管理', name: 'スタッフ登録', light: '3名まで', standard: '10名まで', premium_ai: '無制限' },
    { category: 'スタッフ管理', name: 'シフト管理', light: '基本', standard: '詳細', premium_ai: 'AI最適化' },
    { category: 'スタッフ管理', name: '権限管理', light: false, standard: true, premium_ai: true },
    
    // 予約管理
    { category: '予約管理', name: 'ドラッグ&ドロップ', light: false, standard: true, premium_ai: true },
    { category: '予約管理', name: '繰り返し予約', light: false, standard: true, premium_ai: true },
    { category: '予約管理', name: '予約リマインダー', light: '手動', standard: '自動', premium_ai: 'AI最適化' },
    { category: '予約管理', name: '空き時間検索', light: false, standard: true, premium_ai: 'AI提案' },
    
    // メッセージ機能
    { category: 'メッセージ', name: 'LINE連携', light: false, standard: true, premium_ai: true },
    { category: 'メッセージ', name: 'Instagram連携', light: false, standard: true, premium_ai: true },
    { category: 'メッセージ', name: '一括送信', light: '月100件', standard: '月500件', premium_ai: '無制限' },
    { category: 'メッセージ', name: 'AI自動返信', light: false, standard: '月200回', premium_ai: '無制限' },
    
    // AI機能
    { category: 'AI機能', name: '感情分析', light: false, standard: '基本', premium_ai: '高度' },
    { category: 'AI機能', name: '顧客行動予測', light: false, standard: false, premium_ai: true },
    { category: 'AI機能', name: '売上予測', light: false, standard: false, premium_ai: true },
    { category: 'AI機能', name: 'リスク顧客検知', light: false, standard: false, premium_ai: true },
    { category: 'AI機能', name: '最適メニュー提案', light: false, standard: false, premium_ai: true },
    
    // 分析・レポート
    { category: '分析', name: '売上推移', light: '月次', standard: '日次', premium_ai: 'リアルタイム' },
    { category: '分析', name: '顧客分析', light: false, standard: true, premium_ai: true },
    { category: '分析', name: 'RFM分析', light: false, standard: false, premium_ai: true },
    { category: '分析', name: 'LTV分析', light: false, standard: false, premium_ai: true },
    { category: '分析', name: 'エクスポート', light: 'CSV月3回', standard: '無制限', premium_ai: '全形式対応' },
    
    // 決済・その他
    { category: '決済', name: 'Stripe連携', light: false, standard: true, premium_ai: true },
    { category: '決済', name: '複数決済対応', light: false, standard: false, premium_ai: true },
    { category: 'セキュリティ', name: '2段階認証', light: true, standard: true, premium_ai: true },
    { category: 'セキュリティ', name: 'IPアドレス制限', light: true, standard: true, premium_ai: true },
    { category: 'カスタマイズ', name: 'API利用', light: false, standard: false, premium_ai: true },
    { category: 'サポート', name: 'サポート', light: 'メール', standard: '優先メール', premium_ai: '24時間電話' }
  ]

  // カテゴリごとにグループ化
  const groupedFeatures = features.reduce((acc, feature) => {
    if (!acc[feature.category]) {
      acc[feature.category] = []
    }
    acc[feature.category].push(feature)
    return acc
  }, {} as Record<string, Feature[]>)

  const getFeatureValue = (feature: Feature, plan: SubscriptionPlan) => {
    const value = feature[plan]
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto" />
      )
    }
    return <span className="text-sm font-medium">{value}</span>
  }

  const getPlanHighlight = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return 'bg-blue-50 border-blue-500'
    if (plan === 'standard') return 'border-orange-200'
    return 'border-gray-200'
  }

  if (compact) {
    // コンパクト表示（主要機能のみ）
    const keyFeatures = features.filter(f => 
      ['顧客登録・編集', 'スタッフ登録', 'LINE連携', 'AI自動返信', '売上推移', 'サポート'].includes(f.name)
    )

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">主要機能</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">ライト</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">スタンダード</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">AIプレミアム</th>
            </tr>
          </thead>
          <tbody>
            {keyFeatures.map((feature, index) => (
              <tr key={index} className="border-t border-gray-100">
                <td className="px-4 py-3 text-sm text-gray-700">{feature.name}</td>
                <td className="px-4 py-3 text-center">{getFeatureValue(feature, 'light')}</td>
                <td className="px-4 py-3 text-center">{getFeatureValue(feature, 'standard')}</td>
                <td className="px-4 py-3 text-center">{getFeatureValue(feature, 'premium_ai')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // フル表示
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
          機能詳細比較表
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">機能カテゴリ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">機能名</th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${currentPlan === 'light' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'}`}>
                  ライトプラン
                  {currentPlan === 'light' && <div className="text-xs font-normal mt-1">現在のプラン</div>}
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${currentPlan === 'standard' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'}`}>
                  スタンダードプラン
                  {currentPlan === 'standard' && <div className="text-xs font-normal mt-1">現在のプラン</div>}
                </th>
                <th className={`px-4 py-3 text-center text-sm font-medium ${currentPlan === 'premium_ai' ? 'text-blue-700 bg-blue-50' : 'text-gray-700'}`}>
                  AIプレミアムプラン
                  {currentPlan === 'premium_ai' && <div className="text-xs font-normal mt-1">現在のプラン</div>}
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                <React.Fragment key={category}>
                  {categoryFeatures.map((feature, index) => (
                    <tr key={`${category}-${index}`} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {index === 0 && (
                          <span className="font-medium">{category}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{feature.name}</td>
                      <td className={`px-4 py-3 text-center ${currentPlan === 'light' ? 'bg-blue-50' : ''}`}>
                        {getFeatureValue(feature, 'light')}
                      </td>
                      <td className={`px-4 py-3 text-center ${currentPlan === 'standard' ? 'bg-blue-50' : ''}`}>
                        {getFeatureValue(feature, 'standard')}
                      </td>
                      <td className={`px-4 py-3 text-center ${currentPlan === 'premium_ai' ? 'bg-blue-50' : ''}`}>
                        {getFeatureValue(feature, 'premium_ai')}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* プラン別のハイライト */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-lg border-2 ${getPlanHighlight('light')}`}>
          <h4 className="font-semibold text-gray-900 mb-2">ライトプラン</h4>
          <p className="text-sm text-gray-600">個人サロン向けの基本機能</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>• 顧客管理 500名まで</li>
            <li>• スタッフ 3名まで</li>
            <li>• 基本的な予約管理</li>
          </ul>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${getPlanHighlight('standard')}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">スタンダードプラン</h4>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">人気No.1</span>
          </div>
          <p className="text-sm text-gray-600">成長中のサロンに最適</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>• LINE/Instagram連携</li>
            <li>• AI自動返信（月200回）</li>
            <li>• 売上・顧客分析</li>
          </ul>
        </div>
        
        <div className={`p-4 rounded-lg border-2 ${getPlanHighlight('premium_ai')}`}>
          <h4 className="font-semibold text-gray-900 mb-2">AIプレミアムプラン</h4>
          <p className="text-sm text-gray-600">大規模サロン・多店舗対応</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            <li>• 全機能無制限</li>
            <li>• 高度なAI分析・予測</li>
            <li>• 24時間電話サポート</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default FeatureComparison