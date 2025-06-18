import React, { useState, useEffect } from 'react';
import { ChevronRight, Star, TrendingUp, Users, Zap, Shield, PlayCircle, CheckCircle, ArrowRight, Smartphone, BarChart3, MessageCircle, Calendar, CreditCard, Sparkles } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const testimonials = [
    {
      name: "美容室オーナー A様",
      comment: "予約管理がとても楽になりました。お客様からの問い合わせも一箇所で管理できて便利です。",
      rating: 5
    },
    {
      name: "サロン経営者 B様", 
      comment: "シンプルで使いやすい。スタッフもすぐに覚えられました。",
      rating: 4
    },
    {
      name: "ヘアサロン店長 C様",
      comment: "顧客情報の管理が効率的になり、接客の質が向上しました。",
      rating: 5
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // 実際の機能デモ用データ
  const systemFeatures = [
    {
      title: "顧客管理システム",
      description: "顧客情報を一元管理し、過去の来店履歴や好みを記録"
    },
    {
      title: "予約管理システム", 
      description: "カレンダー形式で予約状況を視覚的に管理"
    },
    {
      title: "LINE連携機能",
      description: "LINE公式アカウントと連携した予約受付システム"
    }
  ];

  const features = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "LINE連携機能",
      description: "LINE公式アカウントと連携した予約受付・顧客対応",
      benefit: "24時間予約受付"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "売上分析機能",
      description: "日次・月次売上データの集計と視覚的な分析",
      benefit: "データ可視化"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "予約管理システム",
      description: "カレンダー表示での予約管理とスケジュール調整",
      benefit: "予約管理効率化"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "顧客管理機能",
      description: "顧客情報・来店履歴・施術記録の一元管理",
      benefit: "情報整理"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "売上記録機能",
      description: "日々の売上データ入力と集計機能",
      benefit: "売上管理"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "モバイル対応",
      description: "スマートフォン・タブレットからのアクセス対応",
      benefit: "場所を選ばない"
    }
  ];

  const pricingPlans = [
    {
      name: "ライト",
      price: "¥9,800",
      period: "/月",
      description: "小規模サロン向け",
      features: [
        "基本的な顧客管理",
        "予約管理システム",
        "LINE連携",
        "月次レポート",
        "メール・チャットサポート"
      ],
      popular: false
    },
    {
      name: "スタンダード", 
      price: "¥19,800",
      period: "/月",
      description: "成長サロン向け",
      setupFee: "¥30,000（初回導入費）",
      features: [
        "全ライト機能",
        "売上分析機能", 
        "顧客セグメント管理",
        "リマインダー機能",
        "優先サポート"
      ],
      popular: true
    },
    {
      name: "プレミアムAI",
      price: "¥39,800", 
      period: "/月",
      description: "プロサロン向け",
      features: [
        "全スタンダード機能",
        "高度なAI予測分析",
        "個別マーケティング自動化",
        "売上最適化コンサル",
        "24/7電話サポート",
        "専用アカウントマネージャー"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-slate-800 to-gray-900 font-mono">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-slate-600 rounded text-gray-200 text-sm font-semibold mb-8 border border-gray-600">
              <Sparkles className="w-4 h-4 mr-2" />
              PROFESSIONAL SALON MANAGEMENT SYSTEM
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              サロン運営を
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                スマート化
              </span>
              <br />
              するプロシステム
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              データドリブンなサロン運営を実現。
              <br />
              <span className="text-cyan-400 font-semibold">プロフェッショナルグレード</span>の統合管理プラットフォーム
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button className="group bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded text-lg font-semibold hover:scale-105 transition-all shadow-xl border border-blue-500">
                <PlayCircle className="inline w-5 h-5 mr-2" />
                LIVE DEMO
                <ChevronRight className="inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-gray-800/80 backdrop-blur-sm text-gray-200 px-8 py-4 rounded text-lg font-semibold border border-gray-600 hover:bg-gray-700/80 transition-all">
                FREE TRIAL
              </button>
            </div>

            {/* システム機能プレビュー */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">📊</div>
                <div className="text-gray-400">売上分析</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">📅</div>
                <div className="text-gray-400">予約管理</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">👥</div>
                <div className="text-gray-400">顧客管理</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">💬</div>
                <div className="text-gray-400">LINE連携</div>
              </div>
            </div>
            
            {/* メインビジュアル */}
            <div className="max-w-5xl mx-auto">
              <img 
                src="/image/スクリーンショット 2025-06-18 23.58.02.png" 
                alt="美容室管理システムのメインダッシュボード" 
                className="w-full object-contain bg-gray-800 rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 課題提起セクション */}
      <div className="py-20 bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">
              CURRENT CHALLENGES
            </h2>
            <p className="text-gray-400 text-lg">
              現在のサロン運営での課題とシステム導入後の改善
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-red-900/10 border border-red-600/40 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-red-300 mb-4 tracking-wide">CURRENT ISSUES</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-red-300 mr-3 font-bold">✗</span>
                  深夜や休日の予約を取り逃している
                </li>
                <li className="flex items-start">
                  <span className="text-red-300 mr-3 font-bold">✗</span>
                  顧客情報の管理が手作業で大変
                </li>
                <li className="flex items-start">
                  <span className="text-red-300 mr-3 font-bold">✗</span>
                  売上分析に時間がかかりすぎる
                </li>
                <li className="flex items-start">
                  <span className="text-red-300 mr-3 font-bold">✗</span>
                  リピート率が思うように上がらない
                </li>
                <li className="flex items-start">
                  <span className="text-red-300 mr-3 font-bold">✗</span>
                  事務作業に追われて接客に集中できない
                </li>
              </ul>
            </div>
            
            <div className="bg-blue-900/10 border border-blue-600/40 rounded-lg p-8">
              <h3 className="text-2xl font-bold text-blue-300 mb-4 tracking-wide">AFTER IMPLEMENTATION</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  AIが24時間自動で予約対応
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  顧客データが自動で蓄積・分析
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  リアルタイムで売上状況を把握
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  個別アプローチでリピート率向上
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-3 font-bold">✓</span>
                  接客とサービスに専念できる
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 機能紹介セクション */}
      <div className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              CORE FEATURES
            </h2>
            <p className="text-xl text-gray-300">
              プロフェッショナルサロンのための統合管理ソリューション
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const imageFiles = [
                "/image/スクリーンショット 2025-06-18 23.54.59.png",
                "/image/スクリーンショット 2025-06-18 23.55.09.png",
                "/image/スクリーンショット 2025-06-18 23.55.30.png",
                "/image/スクリーンショット 2025-06-18 23.56.01.png",
                "/image/スクリーンショット 2025-06-18 23.56.23.png",
                "/image/スクリーンショット 2025-06-18 23.56.39.png"
              ];
              return (
                <div 
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105"
                >
                  <img 
                    src={imageFiles[index] || imageFiles[0]} 
                    alt={`${feature.title}の画面`} 
                    className="w-full h-32 object-contain bg-gray-800 rounded-lg mb-4"
                  />
                  <div className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 mb-4">
                    {feature.description}
                  </p>
                  <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg p-3">
                    <span className="text-cyan-300 font-semibold tracking-wide">
                      {feature.benefit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* スクリーンショット・デモセクション */}
      <div className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              実際の画面を見る
            </h2>
            <p className="text-xl text-gray-300">
              直感的で美しいインターフェース
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-6">
                売上分析ダッシュボード
              </h3>
              <ul className="space-y-4 text-gray-300 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  日次・月次売上データを表示
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  売上推移をグラフで可視化
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  スタッフ別実績の管理
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  期間別の売上比較機能
                </li>
              </ul>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all">
                ダッシュボードを見る
                <ArrowRight className="inline w-4 h-4 ml-2" />
              </button>
            </div>
            <div className="relative">
              <img 
                src="/image/スクリーンショット 2025-06-18 23.52.38.png" 
                alt="売上分析ダッシュボードの実際の画面" 
                className="w-full object-contain bg-gray-800 rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mt-20">
            <div className="relative md:order-2">
              <img 
                src="/image/スクリーンショット 2025-06-18 23.54.34.png" 
                alt="LINE連携機能の実際の画面" 
                className="w-full object-contain bg-gray-800 rounded-2xl shadow-2xl"
              />
            </div>
            <div className="md:order-1">
              <h3 className="text-3xl font-bold text-white mb-6">
                LINE連携機能
              </h3>
              <ul className="space-y-4 text-gray-300 mb-8">
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  LINE公式アカウントと連携
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  予約受付メッセージ機能
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  システム連携による効率化
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  48時間自動対応システム
                </li>
              </ul>
              <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all">
                LINE連携を体験
                <ArrowRight className="inline w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* システム機能紹介セクション */}
      <div className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              システムの主要機能
            </h2>
            <p className="text-xl text-gray-300">
              美容室経営に必要な機能を一つのシステムに集約
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <img 
                src="/image/スクリーンショット 2025-06-18 23.52.23.png" 
                alt="顧客管理システムの画面" 
                className="w-full h-48 object-contain bg-gray-800 rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-4">
                顧客管理システム
              </h3>
              <p className="text-gray-300">
                顧客情報を一元管理し、過去の来店履歴や好みを記録
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <img 
                src="/image/スクリーンショット 2025-06-18 23.53.44.png" 
                alt="予約管理システムの画面" 
                className="w-full h-48 object-contain bg-gray-800 rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-4">
                予約管理システム
              </h3>
              <p className="text-gray-300">
                カレンダー形式で予約状況を視覚的に管理
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <img 
                src="/image/スクリーンショット 2025-06-18 23.54.17.png" 
                alt="LINE連携機能の画面" 
                className="w-full h-48 object-contain bg-gray-800 rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-4">
                LINE連携機能
              </h3>
              <p className="text-gray-300">
                LINE公式アカウントと連携した予約受付システム
              </p>
            </div>
            
            {/* 追加のシステム機能 */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <img 
                src="/image/スクリーンショット 2025-06-18 23.56.49.png" 
                alt="設定管理機能の画面" 
                className="w-full h-48 object-contain bg-gray-800 rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-4">
                設定管理機能
              </h3>
              <p className="text-gray-300">
                システムの各種設定やカスタマイズが簡単に可能
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <img 
                src="/image/スクリーンショット 2025-06-18 23.57.02.png" 
                alt="ユーザー管理機能の画面" 
                className="w-full h-48 object-contain bg-gray-800 rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-4">
                ユーザー管理機能
              </h3>
              <p className="text-gray-300">
                スタッフのアカウント管理や権限設定の管理
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <img 
                src="/image/スクリーンショット 2025-06-18 23.57.17.png" 
                alt="モバイル対応画面" 
                className="w-full h-48 object-contain bg-gray-800 rounded-lg mb-4"
              />
              <h3 className="text-xl font-bold text-white mb-4">
                モバイル対応
              </h3>
              <p className="text-gray-300">
                スマートフォン・タブレットでの操作に最適化
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 料金プランセクション */}
      <div className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              PRICING PLANS
            </h2>
            <p className="text-xl text-gray-300">
              スケーラブルな料金体系でビジネス成長をサポート
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white/5 backdrop-blur-sm border rounded-2xl p-8 transition-all hover:scale-105 ${
                  plan.popular 
                    ? 'border-blue-500 bg-gradient-to-b from-blue-500/10 to-cyan-500/10' 
                    : 'border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded text-sm font-bold tracking-wide">
                      POPULAR
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-white">
                    {plan.price}
                    <span className="text-lg text-gray-400">{plan.period}</span>
                  </div>
                  {plan.setupFee && (
                    <div className="text-sm text-orange-400 mt-2">
                      {plan.setupFee}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  30日間無料で始める
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-4">
              ※ ライト・プレミアムプランは初期費用無料、いつでも解約可能
            </p>
            <p className="text-purple-400 font-bold">
              💡 30日間の無料トライアルでシステムをお試しください
            </p>
            
            {/* 料金表示例 */}
            <div className="mt-8 max-w-3xl mx-auto">
              <img 
                src="/image/スクリーンショット 2025-06-18 23.58.26.png" 
                alt="料金プランの詳細表示" 
                className="w-full rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* システムログインプレビュー */}
      <div className="py-20 bg-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            システムへのアクセスは簡単
          </h2>
          <img 
            src="/image/スクリーンショット 2025-06-18 23.58.36.png" 
            alt="システムログイン画面" 
            className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl"
          />
        </div>
      </div>
      
      {/* CTA セクション */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 border-t border-blue-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            START YOUR DIGITAL TRANSFORMATION
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            プロフェッショナルサポート付きでスムーズな導入を実現
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="group bg-white text-blue-600 px-8 py-4 rounded text-lg font-bold hover:scale-105 transition-all shadow-2xl border border-white">
              <Zap className="inline w-5 h-5 mr-2" />
              START FREE TRIAL
              <ArrowRight className="inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="bg-blue-800/60 backdrop-blur-sm text-white px-8 py-4 rounded text-lg font-semibold border border-blue-400/50 hover:bg-blue-700/60 transition-all">
              <PlayCircle className="inline w-5 h-5 mr-2" />
              BOOK DEMO
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-blue-100">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              30日間無料
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              初期費用0円
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              専任サポート付き
            </div>
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
              美容室統合管理システム
            </h3>
            <p className="text-gray-400 mb-8">
              顧客管理・予約管理・売上分析を統合した美容室経営システム
            </p>
            
            <div className="flex justify-center space-x-8 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">利用規約</a>
              <a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a>
              <a href="#" className="hover:text-white transition-colors">サポート</a>
              <a href="#" className="hover:text-white transition-colors">お問い合わせ</a>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-800">
              <p className="text-gray-500">
                © 2024 美容室統合管理システム. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;