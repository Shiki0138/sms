import React, { useState, useCallback } from 'react'
import { 
  Upload, 
  FileText, 
  Download, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  Calendar,
  Users,
  Settings,
  Info,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface HotPepperData {
  id: string
  reservationDate: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  serviceType: string
  serviceDetails: string
  price: number
  staffName: string
  status: 'completed' | 'cancelled' | 'no_show'
  referralSource: 'hotpepper' | 'repeat' | 'walk_in'
  memo?: string
}

interface HotPepperIntegrationProps {
  onDataImport: (data: HotPepperData[]) => void
}

const HotPepperIntegration: React.FC<HotPepperIntegrationProps> = ({ onDataImport }) => {
  const [importedData, setImportedData] = useState<HotPepperData[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importStats, setImportStats] = useState<{
    total: number
    hotpepperReservations: number
    dateRange: { start: string; end: string } | null
  } | null>(null)

  // CSVファイルの処理
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setImportStatus('idle')

    try {
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      const parsedData: HotPepperData[] = []
      let hotpepperCount = 0
      let earliestDate = ''
      let latestDate = ''

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        
        // サロンボードからのCSVエクスポート形式に対応
        const data: HotPepperData = {
          id: values[0] || `import_${Date.now()}_${i}`,
          reservationDate: values[1] || '',
          customerName: values[2] || '',
          customerPhone: values[3] || '',
          customerEmail: values[4] || '',
          serviceType: values[5] || '',
          serviceDetails: values[6] || '',
          price: parseInt(values[7]) || 0,
          staffName: values[8] || '',
          status: (values[9]?.toLowerCase() as any) || 'completed',
          referralSource: values[10]?.includes('ホットペッパー') || values[10]?.includes('hotpepper') ? 'hotpepper' : 'repeat',
          memo: values[11] || ''
        }

        // 日付範囲の追跡
        if (data.reservationDate) {
          if (!earliestDate || data.reservationDate < earliestDate) {
            earliestDate = data.reservationDate
          }
          if (!latestDate || data.reservationDate > latestDate) {
            latestDate = data.reservationDate
          }
        }

        if (data.referralSource === 'hotpepper') {
          hotpepperCount++
        }

        parsedData.push(data)
      }

      setImportedData(parsedData)
      setImportStats({
        total: parsedData.length,
        hotpepperReservations: hotpepperCount,
        dateRange: earliestDate && latestDate ? { start: earliestDate, end: latestDate } : null
      })
      setImportStatus('success')
      
      // 親コンポーネントにデータを送信
      onDataImport(parsedData)

    } catch (error) {
      console.error('CSV import error:', error)
      setImportStatus('error')
    } finally {
      setIsProcessing(false)
    }
  }, [onDataImport])

  // サンプルCSVのダウンロード
  const downloadSampleCSV = useCallback(() => {
    const sampleData = [
      ['予約ID', '予約日時', '顧客名', '電話番号', 'メールアドレス', 'サービス種別', 'サービス詳細', '料金', 'スタッフ名', 'ステータス', '集客経路', 'メモ'],
      ['R001', '2024-01-15 10:00', '田中 花子', '090-1234-5678', 'tanaka@example.com', 'カット+カラー', 'ショートボブ+グレージュカラー', '8500', '佐藤 美咲', 'completed', 'ホットペッパービューティー', '初回来店'],
      ['R002', '2024-01-15 14:00', '山田 太郎', '080-9876-5432', '', 'カット', 'メンズカット', '4500', '田中 健太', 'completed', 'リピート', ''],
      ['R003', '2024-01-16 11:30', '鈴木 愛', '070-5555-1234', 'suzuki@example.com', 'トリートメント', 'ヘアケアトリートメント', '6000', '佐藤 美咲', 'completed', 'ホットペッパービューティー', 'カラー後のケア'],
    ]

    const csvContent = sampleData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'hotpepper_sample.csv'
    link.click()
  }, [])

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <FileSpreadsheet className="w-6 h-6 mr-2 text-orange-600" />
              ホットペッパービューティー連携
            </h2>
            <p className="text-gray-600 mt-1">
              施術履歴データのCSVインポート（最大1年分対応）
            </p>
          </div>
          <a
            href="https://beauty.hotpepper.jp/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            ホットペッパービューティー
          </a>
        </div>

        {/* API廃止に関する重要な注意事項 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-2">重要なお知らせ</h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>• ホットペッパービューティーの公式APIは2017年に提供終了となりました</p>
                <p>• 現在は手動でのCSVエクスポート・インポートが主な連携方法です</p>
                <p>• サロンボード（無料予約管理システム）経由でのデータ取得を推奨します</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* データ取得方法の説明 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          データ取得手順
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">📊 サロンボードからのエクスポート</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start">
                <span className="font-medium text-blue-600 mr-2">1.</span>
                <span>サロンボードにログイン</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium text-blue-600 mr-2">2.</span>
                <span>「分析（オーナー）」→「顧客分析」→「顧客検索」</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium text-blue-600 mr-2">3.</span>
                <span>期間を指定（最大1年分）</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium text-blue-600 mr-2">4.</span>
                <span>「CSVエクスポート」をクリック</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium text-blue-600 mr-2">5.</span>
                <span>ダウンロードしたCSVファイルをここにアップロード</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">⚠️ 注意事項</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div>• CSVエクスポートには適切な権限設定が必要です</div>
              <div>• 最大1年分のデータを取得可能です</div>
              <div>• 手動予約分は他システムとの同期ができません</div>
              <div>• データ形式はサロンボードの標準フォーマットに準拠してください</div>
            </div>
          </div>
        </div>
      </div>

      {/* CSVアップロード */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">CSVファイルのインポート</h3>
        
        <div className="space-y-4">
          {/* サンプルファイルダウンロード */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">サンプルCSVファイル</h4>
              <p className="text-sm text-gray-600">正しいデータ形式の参考用サンプルファイル</p>
            </div>
            <button
              onClick={downloadSampleCSV}
              className="btn btn-secondary btn-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              サンプルDL
            </button>
          </div>

          {/* ファイルアップロード */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={isProcessing}
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mr-3" />
                  <span className="text-lg text-gray-600">処理中...</span>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">CSVファイルをドラッグ&ドロップ</p>
                  <p className="text-sm text-gray-500">または、クリックしてファイルを選択</p>
                </div>
              )}
            </label>
          </div>

          {/* インポート結果 */}
          {importStatus === 'success' && importStats && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-800">インポート完了</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-700">総データ数:</span>
                  <span className="font-medium ml-2">{importStats.total}件</span>
                </div>
                <div>
                  <span className="text-green-700">ホットペッパー経由:</span>
                  <span className="font-medium ml-2">{importStats.hotpepperReservations}件</span>
                </div>
                {importStats.dateRange && (
                  <div>
                    <span className="text-green-700">期間:</span>
                    <span className="font-medium ml-2">
                      {format(new Date(importStats.dateRange.start), 'M/d', { locale: ja })} - 
                      {format(new Date(importStats.dateRange.end), 'M/d', { locale: ja })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <span className="font-medium text-red-800">インポートエラー</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                CSVファイルの形式を確認してください。サンプルファイルを参考にしてください。
              </p>
            </div>
          )}
        </div>
      </div>

      {/* インポートデータプレビュー */}
      {importedData.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">インポートデータプレビュー</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">予約日</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">顧客名</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">サービス</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">料金</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">集客経路</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {importedData.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {item.reservationDate ? format(new Date(item.reservationDate), 'M/d HH:mm', { locale: ja }) : '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.customerName}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.serviceType}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">¥{item.price.toLocaleString()}</td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.referralSource === 'hotpepper' 
                          ? 'bg-orange-100 text-orange-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.referralSource === 'hotpepper' ? 'ホットペッパー' : 'リピート'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : item.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status === 'completed' ? '完了' : item.status === 'cancelled' ? 'キャンセル' : '未来店'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {importedData.length > 10 && (
              <div className="text-center py-3 text-sm text-gray-500">
                他 {importedData.length - 10}件のデータ
              </div>
            )}
          </div>
        </div>
      )}

      {/* 代替連携オプション */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          代替連携オプション
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📱 サロンボード連携</h4>
            <p className="text-sm text-gray-600 mb-3">
              ホットペッパービューティーの公式予約管理システム
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 無料で利用可能</li>
              <li>• リアルタイム予約管理</li>
              <li>• CSVエクスポート機能</li>
            </ul>
          </div>
          
          <div className="bg-white p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">🔄 定期インポート</h4>
            <p className="text-sm text-gray-600 mb-3">
              月次・週次での手動データ同期
            </p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 月1回のデータ同期</li>
              <li>• 分析精度の向上</li>
              <li>• 履歴データの蓄積</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HotPepperIntegration