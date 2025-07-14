import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import SettingsPage from './pages/SettingsPage';
import CalendarDemoPage from './pages/CalendarDemoPage';
import { Calendar, Settings, Home } from 'lucide-react';

function DemoApp() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* ナビゲーションバー */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold">美容室管理システム</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
                  >
                    <Home className="w-4 h-4 mr-1" />
                    ホーム
                  </Link>
                  <Link
                    to="/calendar"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    カレンダー
                  </Link>
                  <Link
                    to="/settings"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-gray-300"
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    設定
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* ルーティング */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarDemoPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>

        {/* トースト通知 */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#4ade80',
              },
            },
            error: {
              style: {
                background: '#ef4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

// ホームページコンポーネント
const HomePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          営業時間・休日設定デモ
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/settings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <Settings className="w-8 h-8 text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold">営業時間・休日設定</h2>
            </div>
            <p className="text-gray-600">
              美容室の営業時間と休日を細かく設定できます。
              毎週の定休日、隔週休日、特別休業日など柔軟な設定が可能です。
            </p>
          </Link>

          <Link
            to="/calendar"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <Calendar className="w-8 h-8 text-green-500 mr-3" />
              <h2 className="text-xl font-semibold">カレンダー表示</h2>
            </div>
            <p className="text-gray-600">
              設定した休日がカレンダー上でグレイアウト表示されます。
              休日でも警告付きで予約を受け付けることができます。
            </p>
          </Link>
        </div>

        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3">実装された機能</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✅ 曜日別営業時間の設定</li>
            <li>✅ 毎週の定休日設定（例：毎週月曜日）</li>
            <li>✅ 隔週・第N週の定休日設定（例：第2・第4火曜日）</li>
            <li>✅ 特別休業日の設定（年末年始、GW、お盆など）</li>
            <li>✅ 休日のグレイアウト表示</li>
            <li>✅ 休日・営業時間外予約時の警告機能</li>
            <li>✅ カスタマイズ可能な警告メッセージ</li>
            <li>✅ 3ヶ月先までの休日プレビュー</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DemoApp;