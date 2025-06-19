import React from 'react'
import { Shield, Calendar, Users, MessageSquare, BarChart3, Settings } from 'lucide-react'

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">美容室管理システム</h1>
            </div>
            
            <nav className="flex space-x-6">
              <a href="/lp/realistic" className="text-gray-600 hover:text-gray-900">
                ランディングページ
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ダッシュボード</h2>
          <p className="text-gray-600">美容室管理システムへようこそ</p>
        </div>

        {/* 機能メニュー */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Calendar className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">予約管理</h3>
            </div>
            <p className="text-gray-600 mb-4">カレンダー形式での予約管理システム</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
              予約管理へ
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">顧客管理</h3>
            </div>
            <p className="text-gray-600 mb-4">顧客情報と履歴の一元管理</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
              顧客管理へ
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <MessageSquare className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">メッセージ管理</h3>
            </div>
            <p className="text-gray-600 mb-4">LINE・Instagram統合メッセージ</p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors">
              メッセージへ
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-8 h-8 text-orange-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">分析ダッシュボード</h3>
            </div>
            <p className="text-gray-600 mb-4">売上・顧客データの可視化</p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors">
              分析へ
            </button>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <Settings className="w-8 h-8 text-gray-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">設定</h3>
            </div>
            <p className="text-gray-600 mb-4">システム設定とカスタマイズ</p>
            <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors">
              設定へ
            </button>
          </div>
        </div>

        {/* 最近の活動 */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最近の活動</h3>
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <p className="text-gray-600">システムが正常に動作しています。</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard