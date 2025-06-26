/**
 * 📱 レスポンシブモバイルメニュー
 * スマートフォン・タブレット対応のナビゲーション
 */

import React, { useState, useEffect } from 'react'
import { 
  Menu, 
  X, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  MessageSquare,
  Home,
  Phone,
  Mail,
  Scissors,
  Clock,
  Shield
} from 'lucide-react'
import { getEnvironmentConfig } from '../../utils/environment'
import DemoBanner from '../Demo/DemoBanner'

interface ResponsiveMobileMenuProps {
  currentView: string
  setCurrentView: (view: string) => void
  currentPage?: string
}

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<any>
  color: string
  description?: string
  mobileOnly?: boolean
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'ダッシュボード',
    icon: Home,
    color: 'text-blue-600',
    description: 'ホーム画面'
  },
  {
    id: 'calendar',
    label: '予約管理',
    icon: Calendar,
    color: 'text-green-600',
    description: 'カレンダー・予約'
  },
  {
    id: 'customers',
    label: '顧客管理',
    icon: Users,
    color: 'text-purple-600',
    description: '顧客情報・履歴'
  },
  {
    id: 'messages',
    label: 'メッセージ',
    icon: MessageSquare,
    color: 'text-orange-600',
    description: 'LINE・Instagram'
  },
  {
    id: 'analytics',
    label: '分析・レポート',
    icon: BarChart3,
    color: 'text-indigo-600',
    description: '売上・分析'
  },
  {
    id: 'settings',
    label: '設定',
    icon: Settings,
    color: 'text-gray-600',
    description: 'システム設定'
  }
]

const quickActions: MenuItem[] = [
  {
    id: 'new-reservation',
    label: '新規予約',
    icon: Clock,
    color: 'text-green-600',
    mobileOnly: true
  },
  {
    id: 'new-customer',
    label: '新規顧客',
    icon: Users,
    color: 'text-blue-600',
    mobileOnly: true
  },
  {
    id: 'quick-message',
    label: 'メッセージ',
    icon: MessageSquare,
    color: 'text-purple-600',
    mobileOnly: true
  }
]

export const ResponsiveMobileMenu: React.FC<ResponsiveMobileMenuProps> = ({
  currentView,
  setCurrentView,
  currentPage
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const config = getEnvironmentConfig()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getCurrentMenuItem = () => {
    return menuItems.find(item => item.id === currentView) || menuItems[0]
  }

  const handleMenuItemClick = (itemId: string) => {
    setCurrentView(itemId)
    setIsMenuOpen(false)
  }

  const currentItem = getCurrentMenuItem()

  return (
    <>
      {/* デモバナー */}
      {config.isDemoMode && <DemoBanner currentPage={currentPage} />}

      {/* モバイルヘッダー */}
      <div className="md:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          {/* 現在のページ情報 */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center`}>
                <currentItem.icon className={`w-5 h-5 ${currentItem.color}`} />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 text-sm">{currentItem.label}</h1>
                {currentItem.description && (
                  <p className="text-xs text-gray-500">{currentItem.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* ステータス表示 */}
          <div className="flex items-center gap-2">
            {config.isDemoMode && (
              <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">
                🎭 デモ
              </div>
            )}
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* タブレット用ヘッダー */}
      <div className="hidden md:block lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">SMS</h1>
                  <p className="text-sm text-gray-500">美容室管理システム</p>
                </div>
              </div>
            </div>

            {config.isDemoMode && (
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                🎭 デモモード
              </div>
            )}
          </div>

          {/* タブレット用ナビゲーション */}
          <div className="flex gap-1 mt-4 overflow-x-auto scrollbar-hide">
            {menuItems.map((item) => {
              const isActive = currentView === item.id
              const IconComponent = item.icon
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* モバイルメニューオーバーレイ */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* 背景オーバーレイ */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* メニューパネル */}
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl">
            <div className="flex flex-col h-full">
              {/* ヘッダー */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Scissors className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">SMS</h2>
                    <p className="text-sm text-gray-500">美容室管理システム</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* クイックアクション（モバイル専用） */}
              <div className="p-4 border-b bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">クイックアクション</h3>
                <div className="grid grid-cols-3 gap-2">
                  {quickActions.map((action) => {
                    const IconComponent = action.icon
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleMenuItemClick(action.id)}
                        className="flex flex-col items-center gap-1 p-3 rounded-lg bg-white border hover:bg-gray-50 transition-colors"
                      >
                        <IconComponent className={`w-5 h-5 ${action.color}`} />
                        <span className="text-xs font-medium text-gray-600">{action.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* メインメニュー */}
              <div className="flex-1 p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">メインメニュー</h3>
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = currentView === item.id
                    const IconComponent = item.icon
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuItemClick(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border border-blue-200'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className={`w-5 h-5 ${isActive ? 'text-blue-600' : item.color}`} />
                        <div className="flex-1">
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* フッター */}
              <div className="p-4 border-t bg-gray-50">
                {config.isDemoMode && (
                  <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg mb-3">
                    <div className="flex items-center gap-2 text-purple-700">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">デモモード</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      制限機能あり・実データ登録可能
                    </p>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    SMS v1.0.0
                  </p>
                  <p className="text-xs text-gray-400">
                    美容室統合管理システム
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ボトムナビゲーション（モバイル専用） */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="grid grid-cols-4 gap-1 p-2">
          {menuItems.slice(0, 4).map((item) => {
            const isActive = currentView === item.id
            const IconComponent = item.icon
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default ResponsiveMobileMenu