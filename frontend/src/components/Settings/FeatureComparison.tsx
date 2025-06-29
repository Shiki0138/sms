import React from 'react'
import { Check, X, Minus } from 'lucide-react'
import { SubscriptionPlan } from '../../types/subscription'

interface FeatureComparisonProps {
  currentPlan: SubscriptionPlan
}

const FeatureComparison: React.FC<FeatureComparisonProps> = ({ currentPlan }) => {
  const features = [
    {
      category: '基本機能',
      items: [
        { name: '予約管理', light: true, standard: true, premium_ai: true },
        { name: '顧客管理', light: true, standard: true, premium_ai: true },
        { name: 'メニュー管理', light: true, standard: true, premium_ai: true },
        { name: 'スタッフ管理', light: '3名まで', standard: '10名まで', premium_ai: '無制限' },
        { name: '顧客登録', light: '500名まで', standard: '2,000名まで', premium_ai: '無制限' },
      ]
    },
    {
      category: 'メッセージ機能',
      items: [
        { name: '基本メッセージ管理', light: true, standard: true, premium_ai: true },
        { name: 'LINE連携', light: false, standard: true, premium_ai: true },
        { name: 'Instagram DM連携', light: false, standard: true, premium_ai: true },
        { name: '一斉送信', light: false, standard: true, premium_ai: true },
        { name: '自動リマインダー', light: true, standard: true, premium_ai: true },
      ]
    },
    {
      category: 'AI機能',
      items: [
        { name: 'AI返信生成', light: false, standard: '200回/月', premium_ai: '無制限' },
        { name: 'AI顧客分析', light: false, standard: true, premium_ai: true },
        { name: 'AI売上予測', light: false, standard: false, premium_ai: true },
        { name: 'AI最適化提案', light: false, standard: false, premium_ai: true },
        { name: 'AIチャットボット', light: false, standard: false, premium_ai: true },
      ]
    },
    {
      category: '分析・レポート',
      items: [
        { name: '基本レポート', light: true, standard: true, premium_ai: true },
        { name: '売上分析', light: false, standard: true, premium_ai: true },
        { name: '顧客分析', light: false, standard: true, premium_ai: true },
        { name: 'リアルタイムダッシュボード', light: false, standard: false, premium_ai: true },
        { name: 'カスタムレポート', light: false, standard: false, premium_ai: true },
      ]
    },
    {
      category: 'データ・連携',
      items: [
        { name: 'CSVエクスポート', light: '3回/月', standard: '無制限', premium_ai: '無制限' },
        { name: 'バックアップ', light: '週次', standard: '日次', premium_ai: 'リアルタイム' },
        { name: 'API連携', light: false, standard: false, premium_ai: true },
        { name: 'カスタムインテグレーション', light: false, standard: false, premium_ai: true },
      ]
    },
    {
      category: 'サポート',
      items: [
        { name: 'メールサポート', light: true, standard: true, premium_ai: true },
        { name: '電話サポート', light: false, standard: '営業時間内', premium_ai: '24時間365日' },
        { name: '専任担当者', light: false, standard: false, premium_ai: true },
        { name: '初期設定サポート', light: '基本', standard: '標準', premium_ai: '完全' },
        { name: 'トレーニング', light: false, standard: 'オンライン', premium_ai: 'オンサイト可' },
      ]
    }
  ]

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-600 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-400 mx-auto" />
      )
    }
    return <span className="text-sm text-gray-700">{value}</span>
  }

  const getPlanHighlight = (plan: SubscriptionPlan) => {
    return plan === currentPlan ? 'bg-blue-50 border-blue-200' : 'bg-white'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">詳細機能比較表</h2>
        <p className="text-sm text-gray-600 mt-1">
          各プランで利用可能な機能の詳細な比較です
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 font-medium text-gray-900">機能</th>
              <th className={`text-center p-4 font-medium text-gray-900 ${getPlanHighlight('light')}`}>
                Light
              </th>
              <th className={`text-center p-4 font-medium text-gray-900 ${getPlanHighlight('standard')}`}>
                Standard
              </th>
              <th className={`text-center p-4 font-medium text-gray-900 ${getPlanHighlight('premium_ai')}`}>
                Premium AI
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((category, categoryIndex) => (
              <React.Fragment key={categoryIndex}>
                <tr className="bg-gray-50">
                  <td colSpan={4} className="p-3 font-semibold text-gray-900">
                    {category.category}
                  </td>
                </tr>
                {category.items.map((item, itemIndex) => (
                  <tr key={itemIndex} className="border-b border-gray-100">
                    <td className="p-4 text-sm text-gray-700">{item.name}</td>
                    <td className={`p-4 text-center ${getPlanHighlight('light')}`}>
                      {renderFeatureValue(item.light)}
                    </td>
                    <td className={`p-4 text-center ${getPlanHighlight('standard')}`}>
                      {renderFeatureValue(item.standard)}
                    </td>
                    <td className={`p-4 text-center ${getPlanHighlight('premium_ai')}`}>
                      {renderFeatureValue(item.premium_ai)}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default FeatureComparison