import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  BarChart3,
  Settings,
  Shield,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Clock,
  Star,
  Menu,
  X,
  Eye,
  EyeOff,
  Scissors,
  Palette,
  FileText,
  Zap,
  RefreshCw
} from 'lucide-react'

const RealisticLandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const features = [
    {
      icon: <MessageSquare className="w-8 h-8 text-slate-400" />,
      title: "統合メッセージ管理",
      description: "LINE・Instagram・メールを一箇所で管理。顧客との連絡を効率化します。",
      screenshots: [
        "./image/スクリーンショット 2025-06-18 23.52.38.png",
        "./image/スクリーンショット 2025-06-18 23.53.44.png",
        "./image/スクリーンショット 2025-06-18 23.54.17.png",
        "./image/スクリーンショット 2025-06-18 23.54.34.png"
      ],
      details: [
        "複数SNS統合管理",
        "フィルタリング機能",
        "テンプレート送信",
        "一斉送信対応"
      ]
    },
    {
      icon: <Calendar className="w-8 h-8 text-slate-400" />,
      title: "予約管理システム",
      description: "カレンダー形式での直感的な予約管理。新規作成から詳細設定まで。",
      screenshots: [
        "./image/スクリーンショット 2025-06-18 23.54.59.png",
        "./image/スクリーンショット 2025-06-18 23.55.09.png"
      ],
      details: [
        "週間カレンダー表示",
        "新規予約フォーム",
        "メニュー選択機能",
        "時間管理"
      ]
    },
    {
      icon: <Users className="w-8 h-8 text-slate-400" />,
      title: "顧客情報・履歴管理",
      description: "詳細な顧客プロフィールと施術履歴を一元管理。",
      screenshots: [
        "./image/スクリーンショット 2025-06-18 23.55.30.png",
        "./image/スクリーンショット 2025-06-18 23.56.01.png"
      ],
      details: [
        "顧客詳細情報",
        "来店履歴管理",
        "施術記録",
        "写真管理機能"
      ]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-slate-400" />,
      title: "分析ダッシュボード",
      description: "顧客データと売上を視覚的に分析。経営判断をサポートします。",
      screenshots: [
        "./image/スクリーンショット 2025-06-18 23.56.23.png"
      ],
      details: [
        "顧客セグメント分析",
        "来店頻度グラフ",
        "売上データ表示",
        "リピート率計算"
      ]
    },
    {
      icon: <Scissors className="w-8 h-8 text-slate-400" />,
      title: "メニュー・設定管理",
      description: "サービスメニューから各種設定まで、運営に必要な機能を集約。",
      screenshots: [
        "./image/スクリーンショット 2025-06-18 23.56.39.png",
        "./image/スクリーンショット 2025-06-18 23.56.49.png",
        "./image/スクリーンショット 2025-06-18 23.57.02.png"
      ],
      details: [
        "メニュー価格設定",
        "機能改善要望",
        "営業時間設定",
        "プラン管理"
      ]
    },
    {
      icon: <Settings className="w-8 h-8 text-slate-400" />,
      title: "外部連携・データ管理",
      description: "外部サービス連携とデータインポート機能で業務を効率化。",
      screenshots: [
        "./image/スクリーンショット 2025-06-18 23.57.17.png",
        "./image/スクリーンショット 2025-06-18 23.58.02.png",
        "./image/スクリーンショット 2025-06-18 23.58.26.png",
        "./image/スクリーンショット 2025-06-18 23.58.36.png"
      ],
      details: [
        "自動リマインド設定",
        "LINE/Instagram API",
        "Google Calendar連携",
        "CSVインポート"
      ]
    }
  ]

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
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* ヘッダー */}
      <header className="bg-gray-900 shadow-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-slate-400 mr-2" />
              <h1 className="text-xl font-bold text-white">美容室管理システム</h1>
            </div>
            
            {/* デスクトップメニュー */}
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white">機能</a>
              <a href="#testimonials" className="text-gray-300 hover:text-white">導入事例</a>
              <a href="#contact" className="text-gray-300 hover:text-white">お問い合わせ</a>
            </nav>

            {/* モバイルメニューボタン */}
            <button 
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>

          {/* モバイルメニュー */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-slate-700">
              <nav className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-300">機能</a>
                <a href="#testimonials" className="text-gray-300">導入事例</a>
                <a href="#contact" className="text-gray-300">お問い合わせ</a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="bg-gray-900 py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              美容室経営を
              <span className="text-slate-300">シンプルに</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              予約管理、顧客管理、メッセージ対応を一つのシステムで。
              <br className="hidden sm:block" />
              美容室の日常業務をサポートする実用的な管理システムです。
            </p>

            {/* 実際のシステム画面 */}
            <div className="mb-8">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.52.23.png" 
                alt="ログイン画面"
                className="mx-auto rounded-lg shadow-lg max-w-full h-auto"
                style={{ maxWidth: '500px' }}
              />
              <p className="text-sm text-gray-400 mt-2">実際のシステム画面（ログイン）</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                デモを見る
              </button>
              
              <button className="border border-slate-500 hover:border-slate-400 text-slate-300 font-medium py-3 px-8 rounded-lg transition-colors">
                資料ダウンロード
              </button>
            </div>

            {/* 基本情報 */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">シンプル</div>
                <div className="text-sm text-gray-400">直感的な操作</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">統合管理</div>
                <div className="text-sm text-gray-400">一元的な情報管理</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">実用的</div>
                <div className="text-sm text-gray-400">美容室の実務に特化</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 機能紹介セクション */}
      <section id="features" className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              美容室の業務をサポートする機能
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              日々の予約管理から顧客対応まで、実際に使える機能を搭載
            </p>
          </div>

          {/* タブナビゲーション */}
          <div className="mb-8">
            <div className="flex flex-wrap justify-center gap-2">
              {features.map((feature, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === index
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {feature.title}
                </button>
              ))}
            </div>
          </div>

          {/* 選択された機能の詳細 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-4">
                {features[activeTab].icon}
                <h4 className="text-2xl font-bold text-white ml-3">
                  {features[activeTab].title}
                </h4>
              </div>
              
              <p className="text-gray-300 mb-6 text-lg">
                {features[activeTab].description}
              </p>

              <ul className="space-y-3">
                {features[activeTab].details.map((detail, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:order-last">
              <div className="space-y-4">
                {features[activeTab].screenshots.map((screenshot, index) => (
                  <div key={index}>
                    <img 
                      src={screenshot}
                      alt={`${features[activeTab].title} - 画面${index + 1}`}
                      className="rounded-lg shadow-lg w-full h-auto"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400 mt-4 text-center">
                実際のシステム画面（全{features[activeTab].screenshots.length}枚）
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 全機能画面ギャラリー */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              実際のシステム画面
            </h3>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              導入前にすべての機能を確認いただけます。実際の操作画面をご覧ください。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* ログイン画面 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.52.23.png"
                alt="ログイン画面"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">ログイン画面</h4>
              <p className="text-sm text-gray-400">デモアカウント完備</p>
            </div>

            {/* メッセージ管理 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.52.38.png"
                alt="メッセージ管理"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">メッセージ管理</h4>
              <p className="text-sm text-gray-400">LINE・Instagram統合</p>
            </div>

            {/* 顧客フィルタリング */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.53.44.png"
                alt="顧客フィルタリング"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">顧客フィルタリング</h4>
              <p className="text-sm text-gray-400">来店頻度別絞り込み</p>
            </div>

            {/* メッセージ作成 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.54.17.png"
                alt="メッセージ作成"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">メッセージ作成</h4>
              <p className="text-sm text-gray-400">テンプレート機能</p>
            </div>

            {/* 送信確認 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.54.34.png"
                alt="送信確認"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">送信確認</h4>
              <p className="text-sm text-gray-400">対象顧客・送信方法確認</p>
            </div>

            {/* 予約管理 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.54.59.png"
                alt="予約管理"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">予約管理</h4>
              <p className="text-sm text-gray-400">カレンダー形式</p>
            </div>

            {/* 新規予約作成 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.55.09.png"
                alt="新規予約作成"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">新規予約作成</h4>
              <p className="text-sm text-gray-400">詳細フォーム</p>
            </div>

            {/* 顧客詳細 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.55.30.png"
                alt="顧客詳細"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">顧客詳細</h4>
              <p className="text-sm text-gray-400">基本情報・来店履歴</p>
            </div>

            {/* 施術履歴 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.56.01.png"
                alt="施術履歴"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">施術履歴</h4>
              <p className="text-sm text-gray-400">詳細記録・写真管理</p>
            </div>

            {/* 分析ダッシュボード */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.56.23.png"
                alt="分析ダッシュボード"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">分析ダッシュボード</h4>
              <p className="text-sm text-gray-400">顧客セグメント・売上</p>
            </div>

            {/* メニュー管理 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.56.39.png"
                alt="メニュー管理"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">メニュー管理</h4>
              <p className="text-sm text-gray-400">価格・時間設定</p>
            </div>

            {/* 機能改善要望 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.56.49.png"
                alt="機能改善要望"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">機能改善要望</h4>
              <p className="text-sm text-gray-400">ユーザーフィードバック</p>
            </div>

            {/* 設定画面 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.57.02.png"
                alt="設定画面"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">設定画面</h4>
              <p className="text-sm text-gray-400">営業時間・休日設定</p>
            </div>

            {/* 自動リマインド設定 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.57.17.png"
                alt="自動リマインド設定"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">自動リマインド設定</h4>
              <p className="text-sm text-gray-400">メール・LINE通知</p>
            </div>

            {/* 外部API連携 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.58.02.png"
                alt="外部API連携"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">外部API連携</h4>
              <p className="text-sm text-gray-400">LINE・Instagram設定</p>
            </div>

            {/* カレンダー連携 */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.58.26.png"
                alt="カレンダー連携"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">Google Calendar連携</h4>
              <p className="text-sm text-gray-400">双方向同期機能</p>
            </div>

            {/* データインポート */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <img 
                src="./image/スクリーンショット 2025-06-18 23.58.36.png"
                alt="データインポート"
                className="w-full h-auto rounded-lg shadow-md mb-3"
              />
              <h4 className="font-medium text-white mb-1">CSVインポート</h4>
              <p className="text-sm text-gray-400">既存データ移行</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-300">
              全17画面 - 実際のシステムですべての機能をご確認いただけます
            </p>
          </div>
        </div>
      </section>

      {/* 導入事例セクション */}
      <section id="testimonials" className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              ご利用いただいているサロンの声
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-900 rounded-lg p-6 border border-slate-700">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">
                  "{testimonial.comment}"
                </p>
                <p className="text-white font-medium">
                  {testimonial.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section id="contact" className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            まずはデモでお試しください
          </h3>
          <p className="text-gray-300 mb-8 text-lg">
            実際の機能をご確認いただけます。お気軽にお問い合わせください。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-slate-700 text-white font-medium py-3 px-8 rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center">
              <Calendar className="w-5 h-5 mr-2" />
              デモ予約
            </button>
            
            <button className="border border-slate-500 text-slate-300 font-medium py-3 px-8 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center">
              <FileText className="w-5 h-5 mr-2" />
              資料請求
            </button>
          </div>

          <div className="mt-8 text-gray-400 text-sm">
            <p>導入相談・操作説明も承っております</p>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-black text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-slate-500 mr-2" />
              <span className="font-bold text-white">美容室管理システム</span>
            </div>
            <p className="text-sm">
              美容室の業務効率化をサポートする実用的なシステム
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default RealisticLandingPage