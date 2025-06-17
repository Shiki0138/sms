import React, { useState, useEffect } from 'react'
import { 
  Zap, 
  Mail, 
  Calendar, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  FileText,
  Clock,
  Users,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface HotpepperAutoImporterProps {
  onImport: (reservations: any[]) => void
  onClose: () => void
  isOpen: boolean
}

const HotpepperAutoImporter: React.FC<HotpepperAutoImporterProps> = ({ 
  onImport, 
  onClose, 
  isOpen 
}) => {
  const [activeMethod, setActiveMethod] = useState<'email' | 'gmail' | 'manual' | 'rpa'>('email')
  const [emailSettings, setEmailSettings] = useState({
    forwardEmail: '',
    checkInterval: 15,
    autoImport: false
  })
  const [lastImportTime, setLastImportTime] = useState<Date | null>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'checking' | 'importing' | 'success' | 'error'>('idle')

  // 自動インポート方法の説明
  const importMethods = {
    email: {
      title: '📧 メール転送方式',
      description: 'ホットペッパーの予約通知メールを専用アドレスに転送',
      pros: ['設定が簡単', 'リアルタイム性が高い', '追加費用なし'],
      cons: ['メール設定が必要', 'メールフォーマット変更に弱い'],
      setup: [
        'ホットペッパー管理画面で通知メール設定',
        'Gmail等で自動転送ルール作成',
        '転送先メールアドレスを本システムに登録',
        'システムが定期的にメールをチェック'
      ]
    },
    gmail: {
      title: '🔗 Gmail API連携',
      description: 'Gmailと連携して予約通知メールを自動取得',
      pros: ['完全自動化', '安定性が高い', '履歴管理可能'],
      cons: ['初期設定がやや複雑', 'Googleアカウント必須'],
      setup: [
        'Google Cloud Consoleでプロジェクト作成',
        'Gmail APIを有効化',
        '認証情報を取得',
        'システムに認証情報を設定'
      ]
    },
    manual: {
      title: '📋 定期CSV取込み',
      description: 'ホットペッパーから定期的にCSVをダウンロード',
      pros: ['確実性が高い', 'データが正確', '一括処理可能'],
      cons: ['手動作業が必要', 'リアルタイム性なし'],
      setup: [
        'ホットペッパー管理画面にログイン',
        '予約データをCSVエクスポート',
        'システムにCSVをアップロード',
        '差分のみ自動インポート'
      ]
    },
    rpa: {
      title: '🤖 RPA自動化',
      description: 'RPAツールでホットペッパー操作を自動化',
      pros: ['完全自動化', '柔軟性が高い', '他システムも対応可'],
      cons: ['RPA環境が必要', '保守が必要', 'コストがかかる'],
      setup: [
        'UiPath/PowerAutomate等のRPAツール導入',
        'ホットペッパーログイン・データ取得シナリオ作成',
        'APIまたはCSVでシステムに連携',
        'スケジュール実行設定'
      ]
    }
  }

  // メール解析のサンプルパターン
  const emailPatterns = {
    customerName: /お客様名[:：]\s*(.+)/,
    reservationDate: /予約日時[:：]\s*(\d{4}年\d{1,2}月\d{1,2}日)/,
    reservationTime: /(\d{1,2}[:：]\d{2})/,
    menuContent: /メニュー[:：]\s*(.+)/,
    staffName: /担当スタッフ[:：]\s*(.+)/,
    phone: /電話番号[:：]\s*([\d-]+)/,
    notes: /備考[:：]\s*(.+)/
  }

  // メール転送設定の保存
  const handleSaveEmailSettings = () => {
    // 実際の実装では、サーバーに設定を保存
    console.log('Email settings saved:', emailSettings)
    alert('メール転送設定を保存しました')
  }

  // 手動インポートチェック
  const handleManualCheck = () => {
    setImportStatus('checking')
    
    // デモ用：実際はメールサーバーをチェック
    setTimeout(() => {
      setImportStatus('importing')
      
      setTimeout(() => {
        const demoReservations = [
          {
            id: `hp_${Date.now()}_1`,
            customerName: '新規 太郎',
            phone: '090-1234-5678',
            reservationDate: format(new Date(), 'yyyy-MM-dd'),
            reservationTime: '14:00',
            menuContent: 'カット＋カラー',
            staffName: '山田 花子',
            source: 'HOTPEPPER',
            status: 'CONFIRMED',
            importedAt: new Date().toISOString()
          },
          {
            id: `hp_${Date.now()}_2`,
            customerName: '既存 花子',
            phone: '080-9876-5432',
            reservationDate: format(new Date(), 'yyyy-MM-dd'),
            reservationTime: '16:00',
            menuContent: 'パーマ',
            staffName: '佐藤 次郎',
            source: 'HOTPEPPER',
            status: 'CONFIRMED',
            importedAt: new Date().toISOString()
          }
        ]
        
        setImportStatus('success')
        setLastImportTime(new Date())
        onImport(demoReservations)
        
        alert(`${demoReservations.length}件の新規予約をインポートしました！`)
      }, 2000)
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Zap className="w-6 h-6 mr-2 text-yellow-500" />
                ホットペッパー予約自動連携
              </h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Method Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">連携方法を選択</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(importMethods).map(([key, method]) => (
                  <button
                    key={key}
                    onClick={() => setActiveMethod(key as any)}
                    className={`p-4 text-left border rounded-lg transition-colors ${
                      activeMethod === key 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{method.title}</h4>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Method Details */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {importMethods[activeMethod].title} の詳細
                </h3>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-green-800 mb-2">✅ メリット</h4>
                    <ul className="space-y-1">
                      {importMethods[activeMethod].pros.map((pro, index) => (
                        <li key={index} className="text-sm text-green-700 flex items-start">
                          <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-orange-800 mb-2">⚠️ 注意点</h4>
                    <ul className="space-y-1">
                      {importMethods[activeMethod].cons.map((con, index) => (
                        <li key={index} className="text-sm text-orange-700 flex items-start">
                          <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Setup Steps */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">📋 設定手順</h4>
                  <ol className="space-y-2">
                    {importMethods[activeMethod].setup.map((step, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-medium mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Email Method Configuration */}
              {activeMethod === 'email' && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    メール転送設定
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        転送先メールアドレス
                      </label>
                      <input
                        type="email"
                        value={emailSettings.forwardEmail}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, forwardEmail: e.target.value }))}
                        placeholder="hotpepper-import@yoursalon.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ※ このアドレスにホットペッパーの予約通知メールを転送してください
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        チェック間隔
                      </label>
                      <select
                        value={emailSettings.checkInterval}
                        onChange={(e) => setEmailSettings(prev => ({ ...prev, checkInterval: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={5}>5分ごと</option>
                        <option value={10}>10分ごと</option>
                        <option value={15}>15分ごと</option>
                        <option value={30}>30分ごと</option>
                        <option value={60}>1時間ごと</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={emailSettings.autoImport}
                          onChange={(e) => setEmailSettings(prev => ({ ...prev, autoImport: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">自動インポートを有効にする</span>
                      </label>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                      <button
                        onClick={handleSaveEmailSettings}
                        className="btn btn-primary btn-sm"
                      >
                        設定を保存
                      </button>
                      
                      <button
                        onClick={handleManualCheck}
                        disabled={importStatus !== 'idle'}
                        className="btn btn-secondary btn-sm flex items-center"
                      >
                        {importStatus === 'checking' && (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {importStatus === 'importing' && (
                          <Download className="w-4 h-4 mr-2 animate-pulse" />
                        )}
                        {importStatus === 'idle' && (
                          <RefreshCw className="w-4 h-4 mr-2" />
                        )}
                        今すぐチェック
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Status */}
              {lastImportTime && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        最終インポート: {format(lastImportTime, 'M月d日 HH:mm', { locale: ja })}
                      </span>
                    </div>
                    {importStatus === 'success' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </div>
              )}

              {/* Sample Email Format */}
              {activeMethod === 'email' && (
                <div className="border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">📧 認識可能なメール形式の例</h4>
                  <div className="bg-gray-50 p-4 rounded font-mono text-xs">
                    <pre>{`【ホットペッパービューティー】予約通知

お客様名：山田 花子
予約日時：2024年6月15日 14:00
メニュー：カット＋カラー
担当スタッフ：佐藤 美容師
電話番号：090-1234-5678
備考：初回来店、カラーは明るめ希望

---
この予約はホットペッパービューティーから送信されました`}</pre>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ※ 上記のような形式のメールを自動的に解析して予約情報を取り込みます
                  </p>
                </div>
              )}

              {/* Manual Import Instructions */}
              {activeMethod === 'manual' && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      定期CSV取込みの運用方法
                    </h4>
                    <ol className="text-sm text-yellow-800 space-y-2">
                      <li>1. 毎日決まった時間（例：朝9時）にホットペッパー管理画面にアクセス</li>
                      <li>2. 前日の予約データをCSVでダウンロード</li>
                      <li>3. 本システムの「CSVインポート」機能でアップロード</li>
                      <li>4. システムが自動的に新規予約のみを識別してインポート</li>
                    </ol>
                  </div>

                  <button
                    onClick={() => {
                      onClose()
                      // CSVインポート画面を開く処理
                    }}
                    className="btn btn-primary w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    CSVインポート画面へ
                  </button>
                </div>
              )}

              {/* RPA Information */}
              {activeMethod === 'rpa' && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-medium text-purple-900 mb-3">🤖 推奨RPAツール</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-purple-800 mb-1">無料・低コスト</h5>
                        <ul className="text-purple-700 space-y-1">
                          <li>• Power Automate Desktop (Windows)</li>
                          <li>• Selenium (プログラミング知識必要)</li>
                          <li>• AutoHotkey (Windows)</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium text-purple-800 mb-1">有料・高機能</h5>
                        <ul className="text-purple-700 space-y-1">
                          <li>• UiPath</li>
                          <li>• WinActor</li>
                          <li>• BizRobo!</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      RPA導入には専門知識が必要です。<br />
                      導入支援をご希望の場合はお問い合わせください。
                    </p>
                    <button className="btn btn-secondary">
                      <Mail className="w-4 h-4 mr-2" />
                      導入相談する
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HotpepperAutoImporter