import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  componentName?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('エラーバウンダリーがエラーをキャッチしました:', error, errorInfo)
    if (this.props.componentName) {
      console.error(`コンポーネント: ${this.props.componentName}`)
    }
    console.error('エラースタック:', error.stack)
    console.error('コンポーネントスタック:', errorInfo.componentStack)
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                {this.props.componentName 
                  ? `${this.props.componentName}の読み込みエラー`
                  : 'エラーが発生しました'
                }
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {this.state.error?.message || '予期しないエラーが発生しました'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <pre className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded overflow-x-auto">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary