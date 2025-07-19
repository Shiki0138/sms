import React, { useState } from 'react'
import { User, LogOut, Settings, Shield, Clock, Phone, Mail, ChevronDown } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const UserProfile: React.FC = () => {
  const { user, logout, hasPermission } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'staff':
        return 'bg-blue-100 text-blue-800'
      case 'demo':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理者'
      case 'staff':
        return 'スタッフ'
      case 'demo':
        return 'デモユーザー'
      default:
        return role
    }
  }

  return (
    <div className="relative">
      {/* プロファイルボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex-shrink-0">
          {user.profile.avatar ? (
            <img
              src={user.profile.avatar}
              alt={user.profile.name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.profile.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {getRoleLabel(user.role)}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* ユーザー情報 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {user.profile.avatar ? (
                  <img
                    src={user.profile.avatar}
                    alt={user.profile.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {user.profile.name}
                </p>
                <p className="text-xs text-gray-500">
                  @{user.username}
                </p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    <Shield className="h-3 w-3 mr-1" />
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 詳細情報 */}
          <div className="px-4 py-3 space-y-2 border-b border-gray-100">
            {user.email && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Mail className="h-3 w-3" />
                <span>{user.email}</span>
              </div>
            )}
            {user.profile.phone && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Phone className="h-3 w-3" />
                <span>{user.profile.phone}</span>
              </div>
            )}
            {user.profile.position && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <User className="h-3 w-3" />
                <span>{user.profile.position}</span>
              </div>
            )}
            {user.lastLoginAt && (
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Clock className="h-3 w-3" />
                <span>
                  最終ログイン: {format(new Date(user.lastLoginAt), 'M月d日 HH:mm', { locale: ja })}
                </span>
              </div>
            )}
          </div>

          {/* 権限一覧 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-700 mb-2">権限</p>
            <div className="space-y-1">
              {user.permissions.map((permission, index) => (
                <div key={index} className="text-xs text-gray-600">
                  <span className="font-medium">{permission.resource}</span>
                  <span className="text-gray-400 mx-1">:</span>
                  <span>{permission.actions.join(', ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* アクションメニュー */}
          <div className="py-1">
            {hasPermission('settings', 'read') && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  // 設定画面への遷移処理をここに追加
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>設定</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(false)
                logout()
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile