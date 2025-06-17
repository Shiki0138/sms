import React, { useState, useMemo } from 'react'
import { 
  Send, 
  Users, 
  Filter, 
  Calendar, 
  MessageCircle, 
  Instagram, 
  Mail, 
  X, 
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare
} from 'lucide-react'
import { format, differenceInMonths, differenceInDays } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useExternalMessaging } from '../hooks/useExternalMessaging'
import ProductionWarningModal from './Common/ProductionWarningModal'
import FeatureGate from './Common/FeatureGate'
import LimitWarning from './Common/LimitWarning'
import { useSubscription } from '../contexts/SubscriptionContext'

interface Customer {
  id: string
  customerNumber: string
  name: string
  phone?: string
  email?: string
  instagramId?: string
  lineId?: string
  visitCount: number
  lastVisitDate?: string
  createdAt: string
}

interface BulkMessageSenderProps {
  customers: Customer[]
  onSend: (selectedCustomers: Customer[], message: string, channels: string[]) => void
  onClose: () => void
  isOpen: boolean
}

interface FilterSettings {
  lastVisitMonths: number
  excludeRecentDays: number
  minVisitCount: number
  maxVisitCount: number
  includeNoVisit: boolean
  requiredChannels: ('LINE' | 'INSTAGRAM' | 'EMAIL')[]
}

const BulkMessageSenderCore: React.FC<BulkMessageSenderProps> = ({ 
  customers, 
  onSend, 
  onClose, 
  isOpen 
}) => {
  const [step, setStep] = useState<'filter' | 'compose' | 'preview' | 'sending' | 'complete'>('filter')
  const [message, setMessage] = useState('')
  const [messageTemplate, setMessageTemplate] = useState('')
  const [filterSettings, setFilterSettings] = useState<FilterSettings>({
    lastVisitMonths: 3,
    excludeRecentDays: 7,
    minVisitCount: 1,
    maxVisitCount: 999,
    includeNoVisit: true,
    requiredChannels: []
  })

  // 環境制限フック
  const {
    attemptSendMessage,
    isSending,
    isWarningOpen,
    currentFeature,
    setIsWarningOpen,
    checkFeatureAvailability,
    isDevelopment
  } = useExternalMessaging()

  // メッセージテンプレート
  const messageTemplates = {
    campaign: {
      title: '🎉 キャンペーン情報',
      content: '【限定キャンペーンのお知らせ】\n\n{name}様、いつもご利用ありがとうございます！\n\n✨ 期間限定特別キャンペーン ✨\nカット+カラー 20%OFF\n期間：{date}まで\n\nこの機会にぜひご利用ください♪\nご予約お待ちしております！\n\n{salonName}'
    },
    holiday: {
      title: '🏮 年末年始休業案内',
      content: '【年末年始休業のお知らせ】\n\n{name}様、いつもありがとうございます。\n\n年末年始の営業について\n🎍 12/30(土) 通常営業\n🎍 12/31(日)〜1/3(水) 休業\n🎍 1/4(木) 通常営業開始\n\n新年も皆様のご来店を心よりお待ちしております✨\n\n{salonName}'
    },
    newStore: {
      title: '🎊 新店舗オープン',
      content: '【新店舗オープンのお知らせ】\n\n{name}様、いつもありがとうございます！\n\n🎉 新店舗がオープンしました！\n📍 {address}\n📞 {phone}\n\nオープン記念として初回30%OFFキャンペーン実施中✨\nぜひ新しい店舗もご利用ください♪\n\n{salonName}'
    },
    followUp: {
      title: '💌 フォローアップメッセージ',
      content: '{name}様\n\nご無沙汰しております。\nお元気でお過ごしでしょうか？\n\n最後のご来店から少しお時間が経ちましたので、\nご連絡させていただきました💕\n\nまたお会いできる日を楽しみにしております✨\nいつでもお気軽にご連絡ください♪\n\n{salonName}'
    }
  }

  // 顧客フィルタリング
  const filteredCustomers = useMemo(() => {
    const now = new Date()
    
    return customers.filter(customer => {
      // 来店回数フィルター
      if (customer.visitCount < filterSettings.minVisitCount || 
          customer.visitCount > filterSettings.maxVisitCount) {
        return false
      }

      // 来店履歴がない顧客の処理
      if (!customer.lastVisitDate) {
        return filterSettings.includeNoVisit
      }

      const lastVisit = new Date(customer.lastVisitDate)
      
      // 最終来店日フィルター（X ヶ月以上前）
      const monthsSinceLastVisit = differenceInMonths(now, lastVisit)
      if (monthsSinceLastVisit < filterSettings.lastVisitMonths) {
        return false
      }

      // 直近来店者除外フィルター
      const daysSinceLastVisit = differenceInDays(now, lastVisit)
      if (daysSinceLastVisit <= filterSettings.excludeRecentDays) {
        return false
      }

      // 連絡手段フィルター
      if (filterSettings.requiredChannels.length > 0) {
        const hasRequiredChannel = filterSettings.requiredChannels.some(channel => {
          switch (channel) {
            case 'LINE': return !!customer.lineId
            case 'INSTAGRAM': return !!customer.instagramId
            case 'EMAIL': return !!customer.email
            default: return false
          }
        })
        if (!hasRequiredChannel) {
          return false
        }
      }

      return true
    })
  }, [customers, filterSettings])

  // 各顧客の送信チャンネル決定
  const getCustomerChannel = (customer: Customer): { channel: string; address: string; icon: JSX.Element } => {
    if (customer.lineId) {
      return {
        channel: 'LINE',
        address: customer.lineId,
        icon: <MessageCircle className="w-4 h-4 text-green-500" />
      }
    }
    if (customer.instagramId) {
      return {
        channel: 'Instagram',
        address: customer.instagramId,
        icon: <Instagram className="w-4 h-4 text-pink-500" />
      }
    }
    if (customer.email) {
      return {
        channel: 'Email',
        address: customer.email,
        icon: <Mail className="w-4 h-4 text-blue-500" />
      }
    }
    return {
      channel: '連絡手段なし',
      address: '',
      icon: <X className="w-4 h-4 text-gray-400" />
    }
  }

  // メッセージの個人化
  const personalizeMessage = (template: string, customer: Customer): string => {
    return template
      .replace(/{name}/g, customer.name)
      .replace(/{date}/g, format(new Date(), 'M月d日', { locale: ja }))
      .replace(/{salonName}/g, '美容室サンプル')
      .replace(/{address}/g, '東京都新宿区1-2-3')
      .replace(/{phone}/g, '03-1234-5678')
  }

  const handleTemplateSelect = (templateKey: string) => {
    const template = messageTemplates[templateKey as keyof typeof messageTemplates]
    setMessageTemplate(templateKey)
    setMessage(template.content)
  }

  const handleSend = async () => {
    setStep('sending')
    
    try {
      // 各顧客に対して送信試行
      const sendResults = await Promise.all(
        filteredCustomers.map(async (customer) => {
          const channelInfo = getCustomerChannel(customer)
          let messageType: 'line' | 'instagram' | 'sms' | 'email'
          
          // チャンネルタイプをマッピング
          switch (channelInfo.channel) {
            case 'LINE':
              messageType = 'line'
              break
            case 'Instagram':
              messageType = 'instagram'
              break
            case 'Email':
              messageType = 'email'
              break
            default:
              messageType = 'email' // フォールバック
          }
          
          // 個人化されたメッセージを作成
          const personalizedMessage = personalizeMessage(message, customer)
          
          // 外部送信試行
          const result = await attemptSendMessage({
            type: messageType,
            recipients: [channelInfo.address],
            message: personalizedMessage,
            subject: messageTemplate ? messageTemplates[messageTemplate as keyof typeof messageTemplates].title : '美容室からのお知らせ'
          })
          
          return { customer, result }
        })
      )
      
      // 送信結果の確認
      const failedSends = sendResults.filter(({ result }) => !result.success)
      const restrictedSends = sendResults.filter(({ result }) => result.restrictedByEnvironment)
      
      if (restrictedSends.length > 0) {
        // 環境制限がある場合は警告を表示して処理を停止
        return
      }
      
      // 従来のコールバック実行（後方互換性）
      const channels = filteredCustomers.map(customer => getCustomerChannel(customer).channel)
      onSend(filteredCustomers, message, channels)
      
      setStep('complete')
    } catch (error) {
      console.error('Bulk message sending error:', error)
      setStep('preview') // エラー時は前の画面に戻る
    }
  }

  const resetAndClose = () => {
    setStep('filter')
    setMessage('')
    setMessageTemplate('')
    setFilterSettings({
      lastVisitMonths: 3,
      excludeRecentDays: 7,
      minVisitCount: 1,
      maxVisitCount: 999,
      includeNoVisit: true,
      requiredChannels: []
    })
    onClose()
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
                <Send className="w-6 h-6 mr-2 text-blue-600" />
                メッセージ一斉送信
              </h2>
              <button onClick={resetAndClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[
                  { key: 'filter', label: '対象選択', icon: Filter },
                  { key: 'compose', label: 'メッセージ作成', icon: MessageSquare },
                  { key: 'preview', label: '送信確認', icon: Eye },
                  { key: 'complete', label: '送信完了', icon: CheckCircle }
                ].map((stepItem, index) => {
                  const StepIcon = stepItem.icon
                  const isActive = step === stepItem.key
                  const isCompleted = ['filter', 'compose', 'preview'].indexOf(step) > ['filter', 'compose', 'preview'].indexOf(stepItem.key)
                  
                  return (
                    <React.Fragment key={stepItem.key}>
                      <div className={`flex items-center space-x-2 ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-blue-100' : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium hidden sm:inline">{stepItem.label}</span>
                      </div>
                      {index < 3 && (
                        <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`} />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>

            {/* Step 1: Filter Settings */}
            {step === 'filter' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 来店日フィルター */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">来店日フィルター</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最終来店から何ヶ月以上経過した顧客
                      </label>
                      <select
                        value={filterSettings.lastVisitMonths}
                        onChange={(e) => setFilterSettings(prev => ({ ...prev, lastVisitMonths: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1ヶ月以上</option>
                        <option value={2}>2ヶ月以上</option>
                        <option value={3}>3ヶ月以上</option>
                        <option value={6}>6ヶ月以上</option>
                        <option value={12}>1年以上</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        直近来店者を除外（何日以内）
                      </label>
                      <select
                        value={filterSettings.excludeRecentDays}
                        onChange={(e) => setFilterSettings(prev => ({ ...prev, excludeRecentDays: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>除外しない</option>
                        <option value={3}>3日以内</option>
                        <option value={7}>7日以内</option>
                        <option value={14}>14日以内</option>
                        <option value={30}>30日以内</option>
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filterSettings.includeNoVisit}
                          onChange={(e) => setFilterSettings(prev => ({ ...prev, includeNoVisit: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        <span className="text-sm text-gray-700">来店履歴のない顧客を含める</span>
                      </label>
                    </div>
                  </div>

                  {/* 来店回数・連絡手段フィルター */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 border-b pb-2">その他フィルター</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">最小来店回数</label>
                        <input
                          type="number"
                          min="0"
                          value={filterSettings.minVisitCount}
                          onChange={(e) => setFilterSettings(prev => ({ ...prev, minVisitCount: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">最大来店回数</label>
                        <input
                          type="number"
                          min="1"
                          value={filterSettings.maxVisitCount}
                          onChange={(e) => setFilterSettings(prev => ({ ...prev, maxVisitCount: parseInt(e.target.value) || 999 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">必要な連絡手段</label>
                      <div className="space-y-2">
                        {[
                          { key: 'LINE', label: 'LINE', icon: MessageCircle, color: 'text-green-600' },
                          { key: 'INSTAGRAM', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
                          { key: 'EMAIL', label: 'メール', icon: Mail, color: 'text-blue-600' }
                        ].map((channel) => {
                          const Icon = channel.icon
                          return (
                            <label key={channel.key} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={filterSettings.requiredChannels.includes(channel.key as any)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFilterSettings(prev => ({
                                      ...prev,
                                      requiredChannels: [...prev.requiredChannels, channel.key as any]
                                    }))
                                  } else {
                                    setFilterSettings(prev => ({
                                      ...prev,
                                      requiredChannels: prev.requiredChannels.filter(c => c !== channel.key)
                                    }))
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                              />
                              <Icon className={`w-4 h-4 mr-1 ${channel.color}`} />
                              <span className="text-sm text-gray-700">{channel.label}</span>
                            </label>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ※ 選択した連絡手段のいずれかを持つ顧客のみ対象になります
                      </p>
                    </div>
                  </div>
                </div>

                {/* Filter Results */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">
                        対象顧客: {filteredCustomers.length}名
                      </span>
                    </div>
                    <div className="text-sm text-blue-700">
                      全顧客 {customers.length}名中
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep('compose')}
                    disabled={filteredCustomers.length === 0}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次へ (メッセージ作成)
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Compose Message */}
            {step === 'compose' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    送信メッセージ作成 (対象: {filteredCustomers.length}名)
                  </h3>
                  <button
                    onClick={() => setStep('filter')}
                    className="btn btn-secondary btn-sm"
                  >
                    条件を変更
                  </button>
                </div>

                {/* Message Templates */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">テンプレート選択</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(messageTemplates).map(([key, template]) => (
                      <button
                        key={key}
                        onClick={() => handleTemplateSelect(key)}
                        className={`p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                          messageTemplate === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="font-medium text-gray-900 text-sm">{template.title}</div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {template.content.split('\n')[0]}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">メッセージ内容</label>
                  <textarea
                    rows={8}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="送信するメッセージを入力してください..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ※ {'{name}'} は顧客名に自動置換されます
                  </p>
                </div>

                {/* Message Preview */}
                {message && filteredCustomers.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">プレビュー ({filteredCustomers[0].name}様の場合)</h4>
                    <div className="bg-white p-3 rounded border text-sm whitespace-pre-line">
                      {personalizeMessage(message, filteredCustomers[0])}
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button onClick={() => setStep('filter')} className="btn btn-secondary">
                    戻る
                  </button>
                  <button
                    onClick={() => setStep('preview')}
                    disabled={!message.trim()}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    次へ (送信確認)
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Preview & Confirm */}
            {step === 'preview' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">送信確認</h3>

                {/* Sending Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">送信概要</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-blue-600 mr-2" />
                      <span>対象顧客: <strong>{filteredCustomers.length}名</strong></span>
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span>LINE: {filteredCustomers.filter(c => c.lineId).length}名</span>
                    </div>
                    <div className="flex items-center">
                      <Instagram className="w-4 h-4 text-pink-600 mr-2" />
                      <span>Instagram: {filteredCustomers.filter(c => !c.lineId && c.instagramId).length}名</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-blue-600 mr-2" />
                      <span>Email: {filteredCustomers.filter(c => !c.lineId && !c.instagramId && c.email).length}名</span>
                    </div>
                  </div>
                </div>

                {/* Customer List Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">送信対象顧客一覧</h4>
                  <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">顧客名</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">送信方法</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">最終来店</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredCustomers.map((customer) => {
                          const channelInfo = getCustomerChannel(customer)
                          return (
                            <tr key={customer.id}>
                              <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                {customer.customerNumber} {customer.name}
                              </td>
                              <td className="px-4 py-2 text-sm">
                                <div className="flex items-center">
                                  {channelInfo.icon}
                                  <span className="ml-1">{channelInfo.channel}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">
                                {customer.lastVisitDate 
                                  ? format(new Date(customer.lastVisitDate), 'M/d', { locale: ja })
                                  : '来店なし'
                                }
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 開発環境での警告表示 */}
                {isDevelopment && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-yellow-800">開発環境での制限</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          実際の外部送信は本番環境でのみ実行されます。開発環境では送信処理がシミュレーションされます。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button onClick={() => setStep('compose')} className="btn btn-secondary">
                    戻る
                  </button>
                  <button 
                    onClick={handleSend} 
                    className="btn btn-primary"
                    disabled={isSending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSending ? '送信中...' : `${filteredCustomers.length}名に一斉送信`}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Sending */}
            {step === 'sending' && (
              <div className="text-center py-8">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">送信中...</h3>
                <p className="text-gray-600">
                  {filteredCustomers.length}名の顧客にメッセージを送信しています
                </p>
              </div>
            )}

            {/* Step 5: Complete */}
            {step === 'complete' && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">送信完了！</h3>
                <p className="text-gray-600 mb-6">
                  {filteredCustomers.length}名の顧客にメッセージを送信しました
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-medium text-green-900 mb-2">送信結果</h4>
                  <div className="text-sm text-green-800 space-y-1">
                    <div>✅ LINE: {filteredCustomers.filter(c => c.lineId).length}名</div>
                    <div>✅ Instagram: {filteredCustomers.filter(c => !c.lineId && c.instagramId).length}名</div>
                    <div>✅ Email: {filteredCustomers.filter(c => !c.lineId && !c.instagramId && c.email).length}名</div>
                  </div>
                </div>

                <button
                  onClick={resetAndClose}
                  className="btn btn-primary mt-6"
                >
                  完了
                </button>
              </div>
            )}
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

// プラン制限を適用したBulkMessageSender
const BulkMessageSender: React.FC<BulkMessageSenderProps> = (props) => {
  const { subscriptionInfo } = useSubscription()
  
  if (!props.isOpen) return null
  
  return (
    <FeatureGate 
      feature="aiReplyGeneration"
      fallback={
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">機能制限</h3>
              <button onClick={props.onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* 使用量制限警告 */}
            <LimitWarning 
              limitType="maxAIRepliesPerMonth"
              currentValue={subscriptionInfo?.currentUsage.aiRepliesThisMonth || 0}
              className="mb-4"
            />
            
            <p className="text-gray-600 text-sm mb-4">
              一括メッセージ送信機能は、スタンダードプラン以上でご利用いただけます。
            </p>
            
            <div className="flex space-x-3">
              <button
                onClick={props.onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                閉じる
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                アップグレード
              </button>
            </div>
          </div>
        </div>
      }
    >
      <BulkMessageSenderCore {...props} />
    </FeatureGate>
  )
}

export default BulkMessageSender