import React, { useState, useEffect } from 'react'
import { 
  Database, 
  Download, 
  Upload, 
  Calendar, 
  Clock, 
  Save,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Settings,
  HardDrive,
  Cloud
} from 'lucide-react'

interface BackupConfig {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  retentionDays: number
  includeTables: string[]
  compressionEnabled: boolean
}

interface BackupHistory {
  id: string
  createdAt: string
  size: string
  status: 'success' | 'failed' | 'running'
  type: 'auto' | 'manual'
  location: string
}

const DataBackupSettings: React.FC = () => {
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    enabled: true,
    frequency: 'daily',
    time: '03:00',
    retentionDays: 30,
    includeTables: ['customers', 'reservations', 'services', 'messages', 'staff'],
    compressionEnabled: true
  })

  const [backupHistory, setBackupHistory] = useState<BackupHistory[]>([
    {
      id: 'backup_001',
      createdAt: '2024-06-14T03:00:00',
      size: '2.4 MB',
      status: 'success',
      type: 'auto',
      location: 'cloud://backup/salon_2024-06-14.sql.gz'
    },
    {
      id: 'backup_002',
      createdAt: '2024-06-13T03:00:00',
      size: '2.3 MB',
      status: 'success',
      type: 'auto',
      location: 'cloud://backup/salon_2024-06-13.sql.gz'
    },
    {
      id: 'backup_003',
      createdAt: '2024-06-12T03:00:00',
      size: '2.3 MB',
      status: 'success',
      type: 'auto',
      location: 'cloud://backup/salon_2024-06-12.sql.gz'
    },
    {
      id: 'backup_004',
      createdAt: '2024-06-11T15:30:00',
      size: '2.3 MB',
      status: 'success',
      type: 'manual',
      location: 'local://backup/manual_backup_2024-06-11.sql.gz'
    },
    {
      id: 'backup_005',
      createdAt: '2024-06-11T03:00:00',
      size: '2.2 MB',
      status: 'success',
      type: 'auto',
      location: 'cloud://backup/salon_2024-06-11.sql.gz'
    }
  ])

  const [isSaving, setIsSaving] = useState(false)
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [lastBackupCheck, setLastBackupCheck] = useState<string | null>(null)

  const availableTables = [
    { id: 'customers', name: '顧客データ', description: '顧客情報、連絡先、履歴' },
    { id: 'reservations', name: '予約データ', description: '予約情報、スケジュール' },
    { id: 'services', name: '施術履歴', description: '過去の施術記録、料金' },
    { id: 'messages', name: 'メッセージ', description: 'LINE/Instagram連携メッセージ' },
    { id: 'staff', name: 'スタッフ情報', description: 'スタッフデータ、権限設定' },
    { id: 'settings', name: '設定データ', description: 'システム設定、API設定' }
  ]

  useEffect(() => {
    loadBackupSettings()
  }, [])

  const loadBackupSettings = async () => {
    try {
      console.log('バックアップ設定を読み込みました')
      setLastBackupCheck(new Date().toISOString())
    } catch (error) {
      console.error('Failed to load backup settings:', error)
    }
  }

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('バックアップ設定を保存:', backupConfig)
      alert('バックアップ設定を保存しました')
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const performManualBackup = async () => {
    setIsBackingUp(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const newBackup: BackupHistory = {
        id: `backup_${Date.now()}`,
        createdAt: new Date().toISOString(),
        size: '2.4 MB',
        status: 'success',
        type: 'manual',
        location: `local://backup/manual_backup_${new Date().toISOString().split('T')[0]}.sql.gz`
      }
      
      setBackupHistory(prev => [newBackup, ...prev])
      alert('手動バックアップが完了しました')
    } catch (error) {
      console.error('Backup error:', error)
      alert('バックアップに失敗しました')
    } finally {
      setIsBackingUp(false)
    }
  }

  const downloadBackup = async (backup: BackupHistory) => {
    try {
      alert(`バックアップファイル ${backup.id} のダウンロードを開始します`)
    } catch (error) {
      alert('ダウンロードに失敗しました')
    }
  }

  const restoreFromBackup = async (backup: BackupHistory) => {
    if (!confirm(`${backup.createdAt}のバックアップからデータを復元しますか？\n現在のデータは上書きされます。`)) {
      return
    }
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('データ復元が完了しました')
    } catch (error) {
      alert('復元に失敗しました')
    }
  }

  const updateTableSelection = (tableId: string, checked: boolean) => {
    setBackupConfig(prev => ({
      ...prev,
      includeTables: checked 
        ? [...prev.includeTables, tableId]
        : prev.includeTables.filter(id => id !== tableId)
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
      case 'running': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <AlertCircle className="w-4 h-4" />
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">データバックアップ</h3>
          <p className="text-sm text-gray-600">定期的なデータバックアップを設定します</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>設定を保存</span>
        </button>
      </div>

      {/* 自動バックアップ設定 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">自動バックアップ設定</h4>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="backup-enabled"
              checked={backupConfig.enabled}
              onChange={(e) => setBackupConfig(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="backup-enabled" className="text-sm font-medium text-gray-700">
              自動バックアップを有効にする
            </label>
          </div>

          {backupConfig.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  バックアップ頻度
                </label>
                <select
                  value={backupConfig.frequency}
                  onChange={(e) => setBackupConfig(prev => ({ 
                    ...prev, 
                    frequency: e.target.value as 'daily' | 'weekly' | 'monthly' 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">毎日</option>
                  <option value="weekly">毎週</option>
                  <option value="monthly">毎月</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  実行時刻
                </label>
                <input
                  type="time"
                  value={backupConfig.time}
                  onChange={(e) => setBackupConfig(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  保存期間（日）
                </label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={backupConfig.retentionDays}
                  onChange={(e) => setBackupConfig(prev => ({ 
                    ...prev, 
                    retentionDays: parseInt(e.target.value) 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* バックアップ対象選択 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">バックアップ対象データ</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableTables.map((table) => (
            <label key={table.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={backupConfig.includeTables.includes(table.id)}
                onChange={(e) => updateTableSelection(table.id, e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{table.name}</div>
                <div className="text-xs text-gray-500">{table.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={backupConfig.compressionEnabled}
              onChange={(e) => setBackupConfig(prev => ({ ...prev, compressionEnabled: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">データ圧縮を有効にする（推奨）</span>
          </label>
        </div>
      </div>

      {/* 手動バックアップ */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">手動バックアップ</h4>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              即座にデータベース全体のバックアップを作成します
            </p>
            {lastBackupCheck && (
              <p className="text-xs text-gray-500 mt-1">
                最終確認: {new Date(lastBackupCheck).toLocaleString('ja-JP')}
              </p>
            )}
          </div>
          <button
            onClick={performManualBackup}
            disabled={isBackingUp}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isBackingUp ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Database className="w-4 h-4" />
            )}
            <span>{isBackingUp ? 'バックアップ中...' : '今すぐバックアップ'}</span>
          </button>
        </div>
      </div>

      {/* バックアップ履歴 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-md font-medium text-gray-900 mb-4">バックアップ履歴</h4>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作成日時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  サイズ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  種別
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backupHistory.map((backup) => (
                <tr key={backup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(backup.createdAt).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      backup.type === 'auto' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {backup.type === 'auto' ? '自動' : '手動'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                      {getStatusIcon(backup.status)}
                      <span>{backup.status === 'success' ? '成功' : backup.status === 'failed' ? '失敗' : '実行中'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => downloadBackup(backup)}
                      disabled={backup.status !== 'success'}
                      className="text-blue-600 hover:text-blue-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => restoreFromBackup(backup)}
                      disabled={backup.status !== 'success'}
                      className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h5 className="text-sm font-medium text-yellow-900 mb-1">重要な注意事項</h5>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• バックアップファイルは機密情報を含むため、適切に管理してください</li>
              <li>• 復元操作は現在のデータを完全に上書きします</li>
              <li>• 定期バックアップは設定した時刻に自動実行されます</li>
              <li>• 保存期間を過ぎたバックアップは自動削除されます</li>
              <li>• 大容量データの場合、バックアップに時間がかかる場合があります</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DataBackupSettings