import React, { useState } from 'react'
import { 
  MessageCircle, 
  Instagram, 
  Calendar,
  CreditCard,
  TestTube,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase-client'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'

interface TestResult {
  service: string
  status: 'pending' | 'testing' | 'success' | 'error'
  message: string
  details?: any
}

const ExternalAPITestPanel: React.FC = () => {
  const { user } = useAuth()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isTestingAll, setIsTestingAll] = useState(false)
  
  const services = [
    { id: 'line', name: 'LINE', icon: MessageCircle, color: 'text-green-600' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'google', name: 'Google Calendar', icon: Calendar, color: 'text-blue-600' },
    { id: 'stripe', name: 'Stripe', icon: CreditCard, color: 'text-purple-600' }
  ]
  
  const testLINEConnection = async (): Promise<TestResult> => {
    try {
      // API設定を取得
      const { data: settings } = await supabase
        .from('api_settings')
        .select('credentials')
        .eq('tenantId', user?.id)
        .eq('service', 'line')
        .single()
      
      if (!settings?.credentials?.channelAccessToken) {
        return {
          service: 'LINE',
          status: 'error',
          message: 'API認証情報が設定されていません'
        }
      }
      
      // LINE APIのテスト（チャンネル情報取得）
      const response = await axios.get('/api/v1/external/line/verify', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.data.success) {
        return {
          service: 'LINE',
          status: 'success',
          message: '接続成功',
          details: response.data.channelInfo
        }
      } else {
        return {
          service: 'LINE',
          status: 'error',
          message: response.data.error || '接続失敗'
        }
      }
    } catch (error: any) {
      return {
        service: 'LINE',
        status: 'error',
        message: error.message || '接続テスト中にエラーが発生しました'
      }
    }
  }
  
  const testInstagramConnection = async (): Promise<TestResult> => {
    try {
      const { data: settings } = await supabase
        .from('api_settings')
        .select('credentials')
        .eq('tenantId', user?.id)
        .eq('service', 'instagram')
        .single()
      
      if (!settings?.credentials?.accessToken) {
        return {
          service: 'Instagram',
          status: 'error',
          message: 'API認証情報が設定されていません'
        }
      }
      
      // Instagram APIのテスト実装は準備中
      return {
        service: 'Instagram',
        status: 'error',
        message: 'Instagram API連携は現在準備中です'
      }
    } catch (error: any) {
      return {
        service: 'Instagram',
        status: 'error',
        message: error.message || '接続テスト中にエラーが発生しました'
      }
    }
  }
  
  const testGoogleConnection = async (): Promise<TestResult> => {
    try {
      const { data: settings } = await supabase
        .from('api_settings')
        .select('credentials')
        .eq('tenantId', user?.id)
        .eq('service', 'google')
        .single()
      
      if (!settings?.credentials?.clientId) {
        return {
          service: 'Google Calendar',
          status: 'error',
          message: 'API認証情報が設定されていません'
        }
      }
      
      // Google Calendar APIのテスト
      const response = await axios.get('/api/v1/external/google/verify', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.data.success) {
        return {
          service: 'Google Calendar',
          status: 'success',
          message: '接続成功',
          details: response.data.calendarInfo
        }
      } else {
        return {
          service: 'Google Calendar',
          status: 'error',
          message: response.data.error || '接続失敗'
        }
      }
    } catch (error: any) {
      return {
        service: 'Google Calendar',
        status: 'error',
        message: error.message || '接続テスト中にエラーが発生しました'
      }
    }
  }
  
  const testStripeConnection = async (): Promise<TestResult> => {
    try {
      // Stripe公開可能キーの確認
      const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      
      if (!stripeKey) {
        return {
          service: 'Stripe',
          status: 'error',
          message: 'Stripe公開可能キーが設定されていません'
        }
      }
      
      // バックエンドでStripe秘密キーの検証
      const response = await axios.get('/api/v1/payment/stripe/verify', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.data.success) {
        return {
          service: 'Stripe',
          status: 'success',
          message: '接続成功',
          details: {
            accountId: response.data.accountId,
            testMode: response.data.testMode
          }
        }
      } else {
        return {
          service: 'Stripe',
          status: 'error',
          message: response.data.error || '接続失敗'
        }
      }
    } catch (error: any) {
      return {
        service: 'Stripe',
        status: 'error',
        message: error.message || '接続テスト中にエラーが発生しました'
      }
    }
  }
  
  const testAllConnections = async () => {
    setIsTestingAll(true)
    setTestResults([])
    
    const tests = [
      { id: 'line', test: testLINEConnection },
      { id: 'instagram', test: testInstagramConnection },
      { id: 'google', test: testGoogleConnection },
      { id: 'stripe', test: testStripeConnection }
    ]
    
    for (const { id, test } of tests) {
      const service = services.find(s => s.id === id)!
      
      // テスト開始を表示
      setTestResults(prev => [...prev, {
        service: service.name,
        status: 'testing',
        message: 'テスト中...'
      }])
      
      // テスト実行
      const result = await test()
      
      // 結果を更新
      setTestResults(prev => 
        prev.map(r => r.service === service.name ? result : r)
      )
    }
    
    setIsTestingAll(false)
    toast.success('全ての接続テストが完了しました')
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'testing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold flex items-center">
            <TestTube className="w-5 h-5 mr-2 text-blue-600" />
            外部API接続テスト
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            各サービスの接続状態を確認できます
          </p>
        </div>
        <button
          onClick={testAllConnections}
          disabled={isTestingAll}
          className="btn btn-primary flex items-center"
        >
          {isTestingAll ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              テスト中...
            </>
          ) : (
            <>
              <TestTube className="w-4 h-4 mr-2" />
              全てテスト
            </>
          )}
        </button>
      </div>
      
      {/* テスト結果 */}
      {testResults.length > 0 && (
        <div className="space-y-3">
          {testResults.map((result, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${
                result.status === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : result.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium">{result.service}</p>
                    <p className={`text-sm ${
                      result.status === 'success' 
                        ? 'text-green-700' 
                        : result.status === 'error'
                        ? 'text-red-700'
                        : 'text-gray-600'
                    }`}>
                      {result.message}
                    </p>
                  </div>
                </div>
                {result.details && (
                  <div className="text-xs text-gray-500">
                    {result.details.testMode && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        テストモード
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* サービス一覧（テスト前） */}
      {testResults.length === 0 && (
        <div className="grid grid-cols-2 gap-4">
          {services.map(service => {
            const Icon = service.icon
            return (
              <div 
                key={service.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-6 h-6 ${service.color}`} />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-gray-500">未テスト</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">テストについて</p>
            <ul className="space-y-1 text-xs">
              <li>• 各サービスのAPI認証情報が正しく設定されているか確認します</li>
              <li>• 実際の接続テストを行い、APIが正常に動作するか検証します</li>
              <li>• エラーが表示された場合は、設定を確認してください</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExternalAPITestPanel