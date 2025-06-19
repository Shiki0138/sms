import React, { useState, useEffect } from 'react'
import { 
  Crown, 
  Sparkles, 
  Star, 
  Shield, 
  Clock, 
  Users, 
  ChevronRight,
  Zap,
  TrendingUp,
  Award,
  CheckCircle,
  ArrowRight,
  Calendar,
  Heart,
  Target,
  Scissors,
  Palette,
  MessageSquare,
  BarChart3,
  CreditCard,
  Smartphone,
  Lock,
  Eye,
  Diamond
} from 'lucide-react'

const PremiumLandingPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [remainingSlots, setRemainingSlots] = useState(7) // 残り枠数
  const [timeLeft, setTimeLeft] = useState(72) // 残り時間（時間）

  // カウントダウンタイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
    }, 3600000) // 1時間ごと
    return () => clearInterval(timer)
  }, [])

  // お客様の声の自動切り替え
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const testimonials = [
    {
      name: "田中美容室 オーナー",
      text: "売上が3ヶ月で40%アップ！予約管理が劇的に楽になりました",
      rating: 5,
      avatar: "👩‍💼"
    },
    {
      name: "SALON TOKYO 店長", 
      text: "顧客満足度が95%に向上。AIの予測機能が素晴らしい",
      rating: 5,
      avatar: "🧑‍💼"
    },
    {
      name: "Hair Studio M 代表",
      text: "スタッフの効率が2倍に。もう手放せません",
      rating: 5,
      avatar: "👨‍💼"
    }
  ]

  const features = [
    {
      icon: <Crown className="w-8 h-8 text-yellow-500" />,
      title: "プレミアムAI分析",
      description: "業界最先端のAIが顧客行動を予測し、売上最適化を実現"
    },
    {
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      title: "リアルタイム同期",
      description: "LINE・Instagram・予約サイトを完全統合管理"
    },
    {
      icon: <Shield className="w-8 h-8 text-green-500" />,
      title: "エンタープライズ級セキュリティ",
      description: "銀行レベルの暗号化で顧客情報を完全保護"
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      title: "売上予測エンジン",
      description: "3ヶ月先の売上を95%の精度で予測"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* ヒーローセクション */}
      <section className="relative overflow-hidden">
        {/* 背景アニメーション */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          {/* 限定感演出バッジ */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-2 rounded-full text-sm sm:text-base animate-pulse shadow-lg">
              <Crown className="w-5 h-5 mr-2" />
              🔥 限定20名様 特別先行体験 🔥
            </div>
            <div className="mt-2 text-yellow-300 text-sm font-medium">
              残り {remainingSlots} 枠 | あと {timeLeft} 時間で締切
            </div>
          </div>

          {/* メインキャッチコピー */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                革命的AI美容室
              </span>
              <br />
              <span className="text-white">管理システム</span>
            </h1>
            
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-4 font-light">
              売上 <span className="text-yellow-400 font-bold">+347%</span> を実現した
            </p>
            <p className="text-lg sm:text-xl text-gray-400 mb-8">
              業界初のAI予測エンジン搭載システム
            </p>

            {/* 緊急性演出 */}
            <div className="bg-red-600 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-8 backdrop-blur-sm">
              <div className="flex items-center justify-center text-red-300 font-medium">
                <Clock className="w-5 h-5 mr-2 animate-pulse" />
                このオファーは 72 時間限定です
              </div>
            </div>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="group relative bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-4 px-8 rounded-full text-lg transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/25">
                <span className="flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 group-hover:animate-spin" />
                  今すぐ無料で体験開始
                  <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                  無料
                </div>
              </button>
              
              <button className="text-white border-2 border-white hover:bg-white hover:text-black font-medium py-4 px-8 rounded-full transition-all duration-300 group">
                <span className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  デモを見る
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>

            {/* 信頼性アピール */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-6 text-gray-400 text-sm">
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-1 text-green-400" />
                SSL暗号化
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-blue-400" />
                500店舗導入済み
              </div>
              <div className="flex items-center">
                <Award className="w-4 h-4 mr-1 text-yellow-400" />
                業界No.1評価
              </div>
            </div>
          </div>

          {/* メインビジュアル（システム画面のモックアップ） */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-1 shadow-2xl">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 h-96 sm:h-[500px] relative overflow-hidden">
                {/* ダッシュボード画面のモックアップ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 h-full">
                  {/* 売上グラフエリア */}
                  <div className="sm:col-span-2 bg-white rounded-lg p-4 shadow-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                        売上分析
                      </h3>
                      <span className="text-green-500 font-bold text-xl">+347%</span>
                    </div>
                    <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 rounded flex items-end justify-around px-2">
                      {[40, 60, 80, 95, 120, 150, 180].map((height, i) => (
                        <div 
                          key={i}
                          className="bg-gradient-to-t from-green-500 to-green-400 rounded-t w-8 animate-pulse"
                          style={{ height: `${height * 0.6}px`, animationDelay: `${i * 200}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* 顧客満足度エリア */}
                  <div className="bg-white rounded-lg p-4 shadow-lg border">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-pink-500" />
                      満足度
                    </h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-pink-500 mb-2">98%</div>
                      <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">顧客満足度</div>
                    </div>
                  </div>

                  {/* 予約状況エリア */}
                  <div className="bg-white rounded-lg p-4 shadow-lg border">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      本日の予約
                    </h3>
                    <div className="space-y-2">
                      {['10:00 田中様', '13:00 佐藤様', '15:30 山田様'].map((appointment, i) => (
                        <div key={i} className="flex items-center text-sm bg-blue-50 rounded p-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                          {appointment}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* メッセージエリア */}
                  <div className="bg-white rounded-lg p-4 shadow-lg border">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-purple-500" />
                      メッセージ
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-green-100 rounded p-2 text-sm">
                        LINE: 予約確認 ✓
                      </div>
                      <div className="bg-pink-100 rounded p-2 text-sm">
                        Instagram: DM 2件
                      </div>
                    </div>
                  </div>

                  {/* AI予測エリア */}
                  <div className="bg-white rounded-lg p-4 shadow-lg border">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      AI予測
                    </h3>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500 mb-1">来月</div>
                      <div className="text-lg font-bold text-gray-800">+25%</div>
                      <div className="text-xs text-gray-600">売上予測</div>
                    </div>
                  </div>
                </div>
                
                {/* 浮遊するAIアシスタント */}
                <div className="absolute top-4 right-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-3 shadow-lg animate-bounce">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            {/* 浮遊する機能アイコン */}
            <div className="absolute -top-4 -left-4 bg-blue-500 rounded-full p-3 shadow-lg animate-pulse">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-green-500 rounded-full p-3 shadow-lg animate-pulse animation-delay-1000">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* 特別オファーセクション */}
      <section className="py-16 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              🎯 先着20名様限定 🎯
            </h2>
            <p className="text-xl text-white mb-6 font-medium">
              通常 月額 ¥98,000 → <span className="line-through opacity-70">¥98,000</span>
            </p>
            <div className="text-5xl sm:text-6xl font-bold text-white mb-4">
              完全無料
            </div>
            <p className="text-lg text-white mb-8 opacity-90">
              3ヶ月間 全機能使い放題 + 専属サポート付き
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">¥0</div>
                <div className="text-white opacity-90">初期費用</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">¥0</div>
                <div className="text-white opacity-90">月額費用</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-white opacity-90">サポート</div>
              </div>
            </div>

            <button className="bg-white text-black font-bold py-4 px-12 rounded-full text-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl">
              <span className="flex items-center">
                <Diamond className="w-6 h-6 mr-2" />
                今すぐ特別枠を確保する
                <ArrowRight className="w-6 h-6 ml-2" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              なぜ <span className="text-yellow-400">347%</span> の売上アップを実現できるのか？
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              業界初のAI技術と革新的なシステム設計により、従来の常識を覆す結果を実現
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-purple-500 transition-all duration-300 group hover:transform hover:scale-105">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-slate-700 rounded-lg p-3 group-hover:bg-purple-600 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お客様の声セクション */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              実際に使った方々の<span className="text-purple-400">リアルな声</span>
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl">
            <div className="text-center">
              <div className="text-6xl mb-4">{testimonials[currentTestimonial].avatar}</div>
              <div className="flex justify-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl text-gray-800 font-medium mb-4 italic">
                "{testimonials[currentTestimonial].text}"
              </blockquote>
              <cite className="text-gray-600 font-semibold">
                {testimonials[currentTestimonial].name}
              </cite>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-purple-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 最終CTA */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                今すぐ始めて、あなたの美容室を
                <br />
                <span className="text-yellow-300">次のレベルへ</span>
              </h2>
              
              <div className="bg-red-500 text-white inline-block px-6 py-2 rounded-full font-bold text-lg mb-6 animate-pulse">
                ⚡ 残り {remainingSlots} 枠のみ ⚡
              </div>
              
              <div className="text-xl text-white mb-8 opacity-90">
                クレジットカード不要 | 3分で導入完了 | 即日利用開始
              </div>

              <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-6 px-12 rounded-full text-2xl transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-400/50">
                <span className="flex items-center">
                  <Crown className="w-8 h-8 mr-3" />
                  特別枠で今すぐ開始
                  <Sparkles className="w-8 h-8 ml-3 animate-pulse" />
                </span>
              </button>

              <div className="mt-6 text-white text-sm opacity-75">
                30秒で登録完了 | 解約はいつでも可能
              </div>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `
      }} />
    </div>
  )
}

export default PremiumLandingPage