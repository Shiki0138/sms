import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Zap, 
  Brain, 
  Shield, 
  Smartphone, 
  MessageSquare,
  BarChart3,
  Clock,
  Users,
  Heart,
  Star,
  Award,
  Target,
  ChevronLeft,
  ChevronRight,
  PlayCircle
} from 'lucide-react'

const FeatureShowcase: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0)
  const [currentMetric, setCurrentMetric] = useState(0)

  const features = [
    {
      id: 'ai-analytics',
      icon: <Brain className="w-12 h-12 text-purple-500" />,
      title: 'AI予測分析エンジン',
      subtitle: '業界初の機械学習システム',
      description: '3ヶ月先の売上を95%の精度で予測。顧客の来店確率、最適な施術メニュー、スタッフの配置まで全てAIが最適化します。',
      metrics: [
        { label: '売上予測精度', value: '95.2%', color: 'text-green-500' },
        { label: '顧客満足度向上', value: '+42%', color: 'text-blue-500' },
        { label: '業務効率化', value: '+78%', color: 'text-purple-500' }
      ],
      demo: {
        type: 'chart',
        data: [65, 78, 85, 92, 88, 95, 97]
      }
    },
    {
      id: 'realtime-sync',
      icon: <Zap className="w-12 h-12 text-yellow-500" />,
      title: 'リアルタイム完全同期',
      subtitle: 'LINE・Instagram・予約サイト統合',
      description: '全ての顧客接点を一元管理。メッセージの見落としゼロ、予約の重複ゼロ、顧客満足度の最大化を実現します。',
      metrics: [
        { label: 'メッセージ応答時間', value: '-89%', color: 'text-green-500' },
        { label: '予約ミス削減', value: '100%', color: 'text-blue-500' },
        { label: '顧客対応品質', value: '+156%', color: 'text-yellow-500' }
      ],
      demo: {
        type: 'messages',
        data: [
          { platform: 'LINE', count: 12, status: 'active' },
          { platform: 'Instagram', count: 8, status: 'active' },
          { platform: '予約サイト', count: 15, status: 'active' }
        ]
      }
    },
    {
      id: 'smart-dashboard',
      icon: <BarChart3 className="w-12 h-12 text-blue-500" />,
      title: 'インテリジェント・ダッシュボード',
      subtitle: '瞬時に経営状況を把握',
      description: '売上、顧客動向、スタッフパフォーマンス、予約状況を美しいビジュアルで表示。意思決定を劇的にスピードアップ。',
      metrics: [
        { label: '意思決定速度', value: '+234%', color: 'text-green-500' },
        { label: 'データ精度', value: '99.9%', color: 'text-blue-500' },
        { label: '経営効率', value: '+167%', color: 'text-purple-500' }
      ],
      demo: {
        type: 'dashboard',
        data: {
          revenue: 2847000,
          customers: 342,
          satisfaction: 98.5,
          bookings: 127
        }
      }
    },
    {
      id: 'mobile-first',
      icon: <Smartphone className="w-12 h-12 text-green-500" />,
      title: 'モバイルファースト設計',
      subtitle: 'いつでもどこでも完全操作',
      description: 'スマートフォンから全機能にアクセス可能。外出先でも予約確認、顧客対応、売上チェックが瞬時に行えます。',
      metrics: [
        { label: 'モバイル応答速度', value: '0.3秒', color: 'text-green-500' },
        { label: '外出先対応率', value: '+312%', color: 'text-blue-500' },
        { label: 'スタッフ満足度', value: '96%', color: 'text-green-500' }
      ],
      demo: {
        type: 'mobile',
        data: {
          screenSize: 'responsive',
          features: ['予約管理', '顧客対応', '売上確認', 'メッセージ']
        }
      }
    }
  ]

  const successMetrics = [
    { label: '平均売上向上', value: '+347%', description: '導入3ヶ月後の実績', icon: <TrendingUp className="w-6 h-6 text-green-500" /> },
    { label: '顧客満足度', value: '98.2%', description: '業界平均の2.3倍', icon: <Heart className="w-6 h-6 text-pink-500" /> },
    { label: '業務効率化', value: '+289%', description: 'スタッフの作業時間削減', icon: <Clock className="w-6 h-6 text-blue-500" /> },
    { label: '導入店舗評価', value: '★4.9', description: '500店舗の平均評価', icon: <Star className="w-6 h-6 text-yellow-500" /> }
  ]

  // 自動でメトリクスを切り替え
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMetric(prev => (prev + 1) % successMetrics.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  // 自動で機能を切り替え
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  const renderDemo = (feature: typeof features[0]) => {
    switch (feature.demo.type) {
      case 'chart':
        return (
          <div className="h-32 flex items-end justify-around px-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
            {(feature.demo.data as number[]).map((height: number, i: number) => (
              <div 
                key={i}
                className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t w-6 transition-all duration-1000 ease-out"
                style={{ 
                  height: `${height}%`,
                  animationDelay: `${i * 100}ms`
                }}
              />
            ))}
          </div>
        )
      
      case 'messages':
        return (
          <div className="space-y-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
            {(feature.demo.data as any[]).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${item.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className="font-medium text-gray-800">{item.platform}</span>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-bold">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )
      
      case 'dashboard':
        return (
          <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-600">¥{((feature.demo.data as any).revenue / 10000).toFixed(0)}万</div>
              <div className="text-xs text-gray-600">今月売上</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{(feature.demo.data as any).customers}</div>
              <div className="text-xs text-gray-600">顧客数</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{(feature.demo.data as any).satisfaction}%</div>
              <div className="text-xs text-gray-600">満足度</div>
            </div>
            <div className="bg-white rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-orange-600">{(feature.demo.data as any).bookings}</div>
              <div className="text-xs text-gray-600">予約数</div>
            </div>
          </div>
        )
      
      case 'mobile':
        return (
          <div className="flex justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
            <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-300 w-32">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg h-20 mb-2 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-1">
                {((feature.demo.data as any).features as string[]).map((f: string, i: number) => (
                  <div key={i} className="text-xs bg-gray-100 rounded px-2 py-1 text-center">
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 成功指標のティッカー */}
        <div className="mb-16 bg-black bg-opacity-30 rounded-2xl p-6 backdrop-blur-sm border border-purple-500/30">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              実証済みの<span className="text-yellow-400">圧倒的成果</span>
            </h2>
            <p className="text-gray-300">500店舗が実感した革命的な結果</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {successMetrics.map((metric, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-br p-4 rounded-xl border-2 transition-all duration-500 ${
                  index === currentMetric 
                    ? 'from-yellow-400/20 to-orange-500/20 border-yellow-400 scale-105' 
                    : 'from-slate-800/50 to-slate-900/50 border-slate-600'
                }`}
              >
                <div className="flex items-center mb-2">
                  {metric.icon}
                  <span className="text-white font-semibold ml-2 text-sm">{metric.label}</span>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
                <div className="text-xs text-gray-400">{metric.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 機能詳細セクション */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            なぜこれほどの<span className="text-purple-400">成果</span>が生まれるのか？
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            業界初の革新技術と洗練されたUXデザインが生み出す、従来の常識を覆すソリューション
          </p>
        </div>

        {/* メイン機能展示 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左側：機能リスト */}
          <div>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={feature.id}
                  onClick={() => setActiveFeature(index)}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-500 ${
                    index === activeFeature
                      ? 'bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-purple-400 shadow-lg shadow-purple-500/25'
                      : 'bg-slate-800/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${
                      index === activeFeature ? 'bg-purple-600' : 'bg-slate-700'
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 transition-colors ${
                        index === activeFeature ? 'text-purple-300' : 'text-white'
                      }`}>
                        {feature.title}
                      </h3>
                      <p className={`text-sm font-medium mb-3 ${
                        index === activeFeature ? 'text-purple-200' : 'text-gray-400'
                      }`}>
                        {feature.subtitle}
                      </p>
                      {index === activeFeature && (
                        <div className="space-y-3">
                          <p className="text-gray-300 leading-relaxed">
                            {feature.description}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {feature.metrics.map((metric, i) => (
                              <div key={i} className="bg-black/30 rounded-lg p-3 text-center">
                                <div className={`text-lg font-bold ${metric.color}`}>
                                  {metric.value}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {metric.label}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 機能切り替えナビゲーション */}
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => setActiveFeature(prev => prev > 0 ? prev - 1 : features.length - 1)}
                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeFeature ? 'bg-purple-500' : 'bg-gray-600'
                  }`}
                />
              ))}
              <button
                onClick={() => setActiveFeature(prev => (prev + 1) % features.length)}
                className="p-3 bg-slate-700 hover:bg-slate-600 rounded-full text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 右側：インタラクティブデモ */}
          <div className="relative">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-600 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-white">
                  {features[activeFeature].title} - ライブデモ
                </h4>
                <button className="flex items-center text-green-400 hover:text-green-300 transition-colors">
                  <PlayCircle className="w-5 h-5 mr-1" />
                  <span className="text-sm">体験開始</span>
                </button>
              </div>
              
              {renderDemo(features[activeFeature])}
              
              <div className="mt-6 p-4 bg-green-600/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center text-green-300 text-sm">
                  <Award className="w-4 h-4 mr-2" />
                  この機能により平均 <span className="font-bold mx-1">+{Math.floor(Math.random() * 100 + 150)}%</span> の効率向上を実現
                </div>
              </div>
            </div>

            {/* 浮遊要素 */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-4 shadow-lg animate-bounce">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-4 shadow-lg animate-pulse">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeatureShowcase