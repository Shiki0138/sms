import React from 'react'

const TestSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">設定（テスト版）</h2>
      
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">基本設定</h3>
        <p className="text-gray-600">設定画面が正常に表示されています。</p>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">営業時間設定</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              開店時間
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="9">9:00</option>
              <option value="10">10:00</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestSettings