import React, { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { PermissionAction } from '../../types/auth'
import LoginForm from './LoginForm'
import { Shield, AlertCircle } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requiredResource?: string
  requiredAction?: PermissionAction
  fallback?: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredResource,
  requiredAction,
  fallback
}) => {
  const { isAuthenticated, isLoading, hasPermission, user } = useAuth()

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">システムを初期化中...</p>
        </div>
      </div>
    )
  }

  // 認証が必要だが未認証の場合
  if (requireAuth && !isAuthenticated) {
    return <LoginForm />
  }

  // 特定の権限が必要な場合
  if (requiredResource && requiredAction && !hasPermission(requiredResource, requiredAction)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              アクセス権限がありません
            </h2>
            <div className="flex items-center justify-center space-x-2 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">
                この機能にアクセスする権限がありません
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-2">
              <p>現在のユーザー: <span className="font-medium">{user?.profile.name}</span></p>
              <p>ロール: <span className="font-medium">{user?.role}</span></p>
              <p>必要な権限: <span className="font-medium">{requiredResource}:{requiredAction}</span></p>
            </div>
            {fallback && (
              <div className="mt-6">
                {fallback}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 権限チェックを通過した場合、子コンポーネントを表示
  return <>{children}</>
}

export default ProtectedRoute