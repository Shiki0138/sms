import React, { useState } from 'react'
import { Download, FileText, Table, Calendar, AlertTriangle, Check } from 'lucide-react'
import { isFeatureEnabled, getEnvironmentConfig } from '../../utils/environment'
import ProductionWarningModal from '../Common/ProductionWarningModal'

interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf'
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom'
  startDate?: string
  endDate?: string
  includeCustomers: boolean
  includeReservations: boolean
  includeRevenue: boolean
  includeAnalytics: boolean
}

const AnalyticsExport: React.FC = () => {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'excel',
    dateRange: 'month',
    includeCustomers: true,
    includeReservations: true,
    includeRevenue: true,
    includeAnalytics: false
  })
  
  const [isExporting, setIsExporting] = useState(false)
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const [currentFeature, setCurrentFeature] = useState('')

  const config = getEnvironmentConfig()

  const handleExport = async () => {
    // 環境制限チェック
    if (exportConfig.format === 'pdf' && !isFeatureEnabled('enablePDFReports')) {
      setCurrentFeature('pdf_reports')
      setIsWarningOpen(true)
      return
    }

    if (!isFeatureEnabled('enableAnalyticsExport')) {
      setCurrentFeature('analytics_export')
      setIsWarningOpen(true)
      return
    }

    setIsExporting(true)

    try {
      // 本番環境での実際のエクスポート処理
      if (config.isProduction) {
        await performExport()
      } else {
        // 開発環境では制限メッセージを表示
        setCurrentFeature('analytics_export')
        setIsWarningOpen(true)
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('エクスポートに失敗しました')
    } finally {
      setIsExporting(false)
    }
  }

  const performExport = async () => {
    const exportData = {
      ...exportConfig,
      timestamp: new Date().toISOString()
    }

    const response = await fetch(`${config.apiBaseURL}/api/analytics/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(exportData)
    })

    if (!response.ok) {
      throw new Error('データエクスポートに失敗しました')
    }

    // ファイルダウンロード処理
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `salon-analytics-${new Date().toISOString().slice(0, 10)}.${exportConfig.format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    alert('データエクスポートが完了しました')
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <Table className="w-4 h-4" />
      case 'excel':
        return <FileText className="w-4 h-4" />
      case 'pdf':
        return <FileText className="w-4 h-4" />
      default:
        return <Download className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">データエクスポート</h3>
          <p className="text-sm text-gray-600">分析データを様々な形式でエクスポートできます</p>
        </div>
        <Download className="w-6 h-6 text-blue-600" />
      </div>

      {/* 開発環境での警告表示 */}
      {config.isDevelopment && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <h4 className="font-medium text-yellow-800">開発環境での制限</h4>
              <p className="text-sm text-yellow-700 mt-1">
                データエクスポート機能は本番環境でのみ利用可能です。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Export Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">エクスポート形式</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'csv', label: 'CSV', description: 'テーブル形式' },
              { key: 'excel', label: 'Excel', description: 'スプレッドシート' },
              { key: 'pdf', label: 'PDF', description: 'レポート形式' }
            ].map((format) => (
              <button
                key={format.key}
                onClick={() => setExportConfig(prev => ({ ...prev, format: format.key as any }))}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  exportConfig.format === format.key
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  {getFormatIcon(format.key)}
                  <span className="font-medium">{format.label}</span>
                </div>
                <div className="text-xs text-gray-600">{format.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">対象期間</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'week', label: '過去1週間' },
              { key: 'month', label: '過去1ヶ月' },
              { key: 'quarter', label: '過去3ヶ月' },
              { key: 'year', label: '過去1年' }
            ].map((range) => (
              <button
                key={range.key}
                onClick={() => setExportConfig(prev => ({ ...prev, dateRange: range.key as any }))}
                className={`p-2 border rounded text-sm transition-colors ${
                  exportConfig.dateRange === range.key
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Export Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">エクスポート内容</label>
          <div className="space-y-3">
            {[
              { key: 'includeCustomers', label: '顧客データ', description: '顧客リスト、来店履歴' },
              { key: 'includeReservations', label: '予約データ', description: '予約情報、キャンセル履歴' },
              { key: 'includeRevenue', label: '売上データ', description: '日別・月別売上、サービス別収益' },
              { key: 'includeAnalytics', label: '分析データ', description: '顧客分析、トレンドデータ' }
            ].map((item) => (
              <label key={item.key} className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={exportConfig[item.key as keyof ExportConfig] as boolean}
                  onChange={(e) => setExportConfig(prev => ({
                    ...prev,
                    [item.key]: e.target.checked
                  }))}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>エクスポート中...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>データをエクスポート</span>
              </div>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Check className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-1">エクスポートについて</h5>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• エクスポートしたデータは個人情報を含みます</li>
                <li>• データの取り扱いには十分注意してください</li>
                <li>• 大量データの場合、処理に時間がかかる場合があります</li>
                <li>• PDFレポートは分析結果を視覚的に表示します</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 環境制限警告モーダル */}
      <ProductionWarningModal
        isOpen={isWarningOpen}
        onClose={() => setIsWarningOpen(false)}
        feature={currentFeature}
        type="warning"
        showDetails={true}
      />
    </div>
  )
}

export default AnalyticsExport