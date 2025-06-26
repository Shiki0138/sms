import { useState, useEffect } from 'react'

function App() {
  const [data, setData] = useState<unknown>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('App component mounted')
    fetch('http://localhost:4002/api/v1/customers')
      .then(response => {
        console.log('API response received:', response.status)
        return response.json()
      })
      .then(data => {
        console.log('Data received:', data)
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('API error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  console.log('App render - loading:', loading, 'error:', error, 'data:', data)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">🔄 読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-500">❌ エラー: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          🏪 美容室統合管理システム
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 システム状況</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium">フロントエンド</span>
              </div>
              <div className="text-sm text-green-700 mt-1">
                http://localhost:4003/ ✅ 稼働中
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium">バックエンドAPI</span>
              </div>
              <div className="text-sm text-blue-700 mt-1">
                http://localhost:4002/ ✅ 稼働中
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium mb-3">📋 顧客データ取得結果:</h3>
            <div className="text-sm bg-white border rounded p-3 overflow-auto max-h-64">
              <div className="mb-2 font-medium text-green-600">
                ✅ データベース接続成功 - {(data as any)?.customers?.length || 0}件の顧客データを取得
              </div>
              <pre className="whitespace-pre-wrap">
{JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🧪 テスト操作</h2>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 再読み込み
            </button>
            
            <button 
              onClick={() => {
                window.location.href = './App-full.tsx'
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              🚀 フル機能版に戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App