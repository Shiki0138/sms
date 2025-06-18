import React, { useState } from 'react'
import {
  CheckCircle,
  Star,
  Users,
  MessageSquare,
  Calendar,
  Gift,
  ArrowRight,
  Sparkles,
  Book,
  Phone,
  Mail
} from 'lucide-react'

interface BetaTesterOnboardingProps {
  userName: string
  onComplete: () => void
}

const BetaTesterOnboarding: React.FC<BetaTesterOnboardingProps> = ({
  userName,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const steps = [
    {
      title: 'ようこそベータテストへ！',
      icon: <Star className="w-12 h-12 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-lg text-gray-700">
            {userName}様、美容室管理システムのベータテストにご参加いただき、
            誠にありがとうございます。
          </p>
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">ベータテスト期間</h4>
            <p className="text-blue-800">2025年6月18日 〜 2025年7月31日（約6週間）</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">特典</h4>
            <ul className="text-purple-800 space-y-1">
              <li>• テスト期間中、全機能無料でご利用可能</li>
              <li>• 正式版リリース後、初年度50%OFF</li>
              <li>• 優先サポート対応</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'テスターの役割',
      icon: <Users className="w-12 h-12 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            ベータテスターの皆様には、以下のご協力をお願いしています：
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">日常業務での使用</h4>
                <p className="text-sm text-gray-600">
                  実際の業務でシステムをご利用いただき、使い勝手を評価
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">バグ・不具合の報告</h4>
                <p className="text-sm text-gray-600">
                  エラーや動作不良を見つけた際の即座の報告
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">改善提案</h4>
                <p className="text-sm text-gray-600">
                  より使いやすくするためのアイデアや機能要望
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900">定期フィードバック</h4>
                <p className="text-sm text-gray-600">
                  週次アンケートと月次インタビューへの参加
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'フィードバック方法',
      icon: <MessageSquare className="w-12 h-12 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            フィードバックは以下の方法で簡単に送信できます：
          </p>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
                フィードバックボタン
              </h4>
              <p className="text-sm text-gray-600">
                画面右下の青いボタンから、いつでもフィードバックを送信できます
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Star className="w-5 h-5 text-yellow-500 mr-2" />
                クイック評価
              </h4>
              <p className="text-sm text-gray-600">
                1日1回、5段階評価で使い心地を評価してください
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Calendar className="w-5 h-5 text-green-500 mr-2" />
                定期レビュー
              </h4>
              <p className="text-sm text-gray-600">
                週次アンケート（毎週月曜）と月次インタビュー（第3週）
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'サポート体制',
      icon: <Phone className="w-12 h-12 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            テスト期間中は専用サポートをご利用いただけます：
          </p>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
                専用サポートチャット
              </h4>
              <p className="text-sm text-gray-600">
                平日 9:00-18:00 リアルタイム対応
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Book className="w-5 h-5 text-purple-500 mr-2" />
                オンライン相談会
              </h4>
              <p className="text-sm text-gray-600">
                毎週水曜 14:00-15:00 Zoom開催
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                <Mail className="w-5 h-5 text-green-500 mr-2" />
                メールサポート
              </h4>
              <p className="text-sm text-gray-600">
                beta-support@salon-system.com（24時間以内に返信）
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: '利用規約の確認',
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <h4 className="font-medium text-gray-900 mb-2">ベータテスト利用規約</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>1. <strong>守秘義務</strong>：テスト中に知り得た情報は第三者に開示しません。</p>
              <p>2. <strong>フィードバック</strong>：積極的にフィードバックを提供します。</p>
              <p>3. <strong>データ利用</strong>：テストデータは品質向上のために利用されることに同意します。</p>
              <p>4. <strong>免責事項</strong>：ベータ版のため、予期しない不具合が発生する可能性があります。</p>
              <p>5. <strong>データ保護</strong>：個人情報は適切に保護され、目的外利用はされません。</p>
            </div>
          </div>
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm text-gray-700">
              上記の利用規約を確認し、同意します
            </span>
          </label>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else if (agreedToTerms) {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              {steps[currentStep].icon}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
          </div>

          <div className="mb-8">
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-md font-medium ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              前へ
            </button>

            <div className="flex items-center space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentStep
                      ? 'bg-blue-600'
                      : index < currentStep
                      ? 'bg-blue-300'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1 && !agreedToTerms}
              className={`px-6 py-2 rounded-md font-medium flex items-center ${
                currentStep === steps.length - 1 && !agreedToTerms
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {currentStep === steps.length - 1 ? (
                <>
                  開始する
                  <Gift className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  次へ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BetaTesterOnboarding