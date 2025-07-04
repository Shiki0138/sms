import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useState, useEffect } from 'react'

const TestEnvironmentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true)
  const [isTestMode, setIsTestMode] = useState(false)

  useEffect(() => {
    // 環境変数またはドメインでテストモードを判定
    const isTest = 
      import.meta.env.VITE_TEST_MODE === 'true' ||
      window.location.hostname.includes('test') ||
      window.location.hostname.includes('staging')
    
    setIsTestMode(isTest)
  }, [])

  if (!isTestMode || !isVisible) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5" />
            <div className="text-sm font-medium">
              <span className="font-bold">テスト環境</span>
              <span className="ml-2">
                これはテスト環境です。実際のデータは保存されません。
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-orange-600 rounded transition-colors"
            aria-label="バナーを閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TestEnvironmentBanner