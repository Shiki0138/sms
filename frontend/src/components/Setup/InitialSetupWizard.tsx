import React, { useState, useEffect } from 'react'
import { 
  Store, 
  Users, 
  Scissors, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  Download,
  Eye,
  EyeOff,
  Globe,
  Smartphone,
  Mail,
  CreditCard,
  Calendar,
  Shield,
  Sparkles
} from 'lucide-react'
import { salonTemplates, salonOptions, salonOptionsExtras } from '../../data/salonTemplates'
import { menuTemplates, setMenuTemplates, menuCategories } from '../../data/menuTemplates'
import { testCustomers, testStaff, initialSetupData } from '../../data/testDummyData'
import { apiTemplates, recommendedAPISetup } from '../../data/apiTemplates'
import ExternalSendRestriction from '../TestMode/ExternalSendRestriction'

interface SetupStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

interface SalonSetupData {
  name: string
  type: string
  address: string
  phone: string
  email: string
  prefecture: string
  capacity: number
  priceRange: string
  services: string[]
  businessHours: {
    [key: string]: { open: string; close: string; closed: boolean }
  }
}

const InitialSetupWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [setupData, setSetupData] = useState<SalonSetupData>({
    name: '',
    type: '',
    address: '',
    phone: '',
    email: '',
    prefecture: '東京都',
    capacity: 6,
    priceRange: '¥3,000 - ¥8,000',
    services: [],
    businessHours: {
      monday: { open: '10:00', close: '19:00', closed: true },
      tuesday: { open: '10:00', close: '19:00', closed: false },
      wednesday: { open: '10:00', close: '19:00', closed: false },
      thursday: { open: '10:00', close: '19:00', closed: false },
      friday: { open: '10:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '19:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false }
    }
  })
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [selectedMenus, setSelectedMenus] = useState<string[]>([])
  const [selectedAPIs, setSelectedAPIs] = useState<string[]>([])
  const [testMode, setTestMode] = useState(true)
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({})

  const steps: SetupStep[] = [
    {
      id: 'salon-info',
      title: '店舗情報設定',
      description: '基本的な店舗情報を設定します',
      icon: <Store className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'menu-setup',
      title: 'メニュー設定',
      description: '提供するサービスメニューを選択します',
      icon: <Scissors className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'staff-setup',
      title: 'スタッフ情報',
      description: 'スタッフ情報を登録します',
      icon: <Users className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'api-setup',
      title: 'API連携設定',
      description: '外部サービスとの連携を設定します',
      icon: <Globe className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'test-data',
      title: 'テストデータ設定',
      description: 'サンプルデータで動作確認します',
      icon: <Eye className="w-6 h-6" />,
      completed: false
    },
    {
      id: 'complete',
      title: '設定完了',
      description: 'セットアップが完了しました',
      icon: <CheckCircle className="w-6 h-6" />,
      completed: false
    }
  ]

  // テンプレート適用
  const applyTemplate = (templateId: string) => {
    const template = salonTemplates.find(t => t.id === templateId)
    if (template) {
      setSetupData({
        ...setupData,
        name: template.name,
        type: template.type || 'hair', // デフォルトタイプ
        address: (template as any).address || '',
        phone: (template as any).phone || '',
        email: (template as any).email || '',
        capacity: (template as any).capacity || 5,
        priceRange: (template as any).priceRange || '',
        services: (template as any).services || [],
        businessHours: (template as any).openHours || '10:00-20:00'
      })
    }
    setSelectedTemplate(templateId)
  }

  // メニュー選択の切り替え
  const toggleMenuSelection = (menuId: string) => {
    setSelectedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    )
  }

  // API選択の切り替え
  const toggleAPISelection = (apiId: string) => {
    setSelectedAPIs(prev => 
      prev.includes(apiId) 
        ? prev.filter(id => id !== apiId)
        : [...prev, apiId]
    )
  }

  // 次のステップに進む
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // 前のステップに戻る
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // テストデータの読み込み
  const loadTestData = () => {
    console.log('テストデータを読み込みました:', initialSetupData)
    alert(`テストデータを読み込みました！\n\n・顧客データ: ${initialSetupData.customers.length}名\n・予約データ: ${initialSetupData.reservations.length}件\n・メッセージ: ${initialSetupData.messages.length}件\n・スタッフ: ${initialSetupData.staff.length}名`)
  }

  // セットアップ完了
  const completeSetup = () => {
    const setupResult = {
      salonInfo: setupData,
      selectedMenus: selectedMenus,
      selectedAPIs: selectedAPIs,
      testMode: testMode,
      testData: initialSetupData,
      timestamp: new Date().toISOString()
    }
    
    console.log('セットアップ完了:', setupResult)
    alert('セットアップが完了しました！\n美容室管理システムをお楽しみください。')
  }

  // パスワード表示切り替え
  const togglePasswordVisibility = (apiId: string, fieldName: string) => {
    const key = `${apiId}-${fieldName}`
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'salon-info':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">店舗テンプレートから選択（任意）</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {salonTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => applyTemplate(template.id)}
                  >
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{(template as any).description || ''}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {(template as any).priceRange || ''} | {(template as any).capacity || ''}席 | {((template as any).services || []).slice(0, 3).join('・')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={setupData.name}
                  onChange={(e) => setSetupData({...setupData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Hair Studio TOKYO"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  店舗タイプ
                </label>
                <select
                  value={setupData.type}
                  onChange={(e) => setSetupData({...setupData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {salonOptionsExtras.salonTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  都道府県
                </label>
                <select
                  value={setupData.prefecture}
                  onChange={(e) => setSetupData({...setupData, prefecture: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {salonOptionsExtras.prefectures.map((prefecture) => (
                    <option key={prefecture} value={prefecture}>{prefecture}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  value={setupData.phone}
                  onChange={(e) => setSetupData({...setupData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="03-1234-5678"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住所
                </label>
                <input
                  type="text"
                  value={setupData.address}
                  onChange={(e) => setSetupData({...setupData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="東京都渋谷区..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={setupData.email}
                  onChange={(e) => setSetupData({...setupData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="info@salon.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  席数
                </label>
                <select
                  value={setupData.capacity}
                  onChange={(e) => setSetupData({...setupData, capacity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {salonOptionsExtras.capacityOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )

      case 'menu-setup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">提供するメニューを選択してください</h3>
              <p className="text-sm text-gray-600 mb-6">
                後から追加・編集も可能です。まずは主要なメニューを選択しましょう。
              </p>
            </div>

            {menuCategories.map((category) => {
              const categoryMenus = (menuTemplates as any)[category.id] || []
              
              return (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">{category.icon}</span>
                    <h4 className="text-lg font-medium text-gray-900">{category.name}</h4>
                    <span className="ml-auto text-sm text-gray-500">
                      {categoryMenus.filter((menu: any) => selectedMenus.includes(menu.id)).length} / {categoryMenus.length} 選択中
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryMenus.map((menu: any) => (
                      <div
                        key={menu.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedMenus.includes(menu.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleMenuSelection(menu.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 text-sm">{menu.name}</h5>
                          <span className="text-sm font-bold text-blue-600">¥{menu.price.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{menu.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{menu.duration}分</span>
                          <span className={`px-2 py-1 rounded-full ${
                            menu.popularity === 'high' ? 'bg-red-100 text-red-600' :
                            menu.popularity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {menu.popularity === 'high' ? '人気' : 
                             menu.popularity === 'medium' ? '標準' : '基本'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">選択されたメニュー: {selectedMenus.length}件</h4>
              <p className="text-sm text-blue-700">
                価格帯: ¥{selectedMenus.length > 0 ? '3,000' : '0'} - 
                ¥{selectedMenus.length > 0 ? '12,000' : '0'}
              </p>
            </div>
          </div>
        )

      case 'staff-setup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">スタッフ情報</h3>
              <p className="text-sm text-gray-600 mb-6">
                テストデータとして3名のサンプルスタッフが用意されています。実際の運用時に変更できます。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {testStaff.map((staff) => (
                <div key={staff.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{staff.name}</h4>
                      <p className="text-sm text-gray-600">{staff.position}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">専門分野:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {staff.specialties.map((specialty) => (
                          <span key={specialty} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      <p>入社: {new Date(staff.joinDate).getFullYear()}年</p>
                      <p>レビュー: {staff.performance.rating}/5.0</p>
                      <p>評価数: {staff.performance.reviews}件</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">スタッフデータ準備完了</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                テスト用のスタッフデータが設定されています。後からスタッフの追加・編集が可能です。
              </p>
            </div>
          </div>
        )

      case 'api-setup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">API連携設定</h3>
              <p className="text-sm text-gray-600 mb-6">
                外部サービスとの連携設定です。テストモードでは実際の送信は行われません。
              </p>
            </div>

            <ExternalSendRestriction 
              isTestMode={testMode}
              onModeChange={setTestMode}
            />

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">利用するAPI（推奨設定済み）</h4>
              
              {apiTemplates.map((api) => (
                <div
                  key={api.id}
                  className={`border rounded-lg p-4 ${
                    selectedAPIs.includes(api.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                        {api.type === 'line' && <Smartphone className="w-5 h-5 text-green-600" />}
                        {api.type === 'instagram' && <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded" />}
                        {api.type === 'google' && <Calendar className="w-5 h-5 text-blue-600" />}
                        {api.type === 'stripe' && <CreditCard className="w-5 h-5 text-purple-600" />}
                        {api.type === 'email' && <Mail className="w-5 h-5 text-gray-600" />}
                        {api.type === 'sms' && <Smartphone className="w-5 h-5 text-orange-600" />}
                      </div>
                      <div>
                        <h5 className="font-medium text-gray-900">{api.name}</h5>
                        <p className="text-sm text-gray-600">{api.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleAPISelection(api.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        selectedAPIs.includes(api.id) ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          selectedAPIs.includes(api.id) ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {selectedAPIs.includes(api.id) && (
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <p className="text-sm text-gray-600 mb-3">
                        接続設定（テストモードでは実際の設定は不要です）
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(api.fields || []).map((field: any) => (
                          <div key={field.key}>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              {field.label}
                              {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            <div className="relative">
                              <input
                                type={field.type === 'password' && !showPasswords[`${api.id}-${field.key}`] ? 'password' : 'text'}
                                placeholder={field.label}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50"
                                disabled={testMode}
                              />
                              {field.type === 'password' && (
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(api.id, field.key)}
                                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                                >
                                  {showPasswords[`${api.id}-${field.key}`] ? 
                                    <EyeOff className="w-4 h-4" /> : 
                                    <Eye className="w-4 h-4" />
                                  }
                                </button>
                              )}
                            </div>
                            {field.description && <p className="text-xs text-gray-500 mt-1">{field.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-medium text-yellow-900">テストモードについて</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    テストモードが有効な間は、実際の外部送信は行われません。API設定の動作確認のみ可能です。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'test-data':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">テストデータ設定</h3>
              <p className="text-sm text-gray-600 mb-6">
                システムの動作確認用のサンプルデータを読み込みます。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-900">顧客データ</h4>
                <p className="text-2xl font-bold text-blue-600">{testCustomers.length}名</p>
                <p className="text-sm text-blue-700">サンプル顧客</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-green-900">予約データ</h4>
                <p className="text-2xl font-bold text-green-600">{initialSetupData.reservations.length}件</p>
                <p className="text-sm text-green-700">サンプル予約</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <Mail className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-purple-900">メッセージ</h4>
                <p className="text-2xl font-bold text-purple-600">{initialSetupData.messages.length}件</p>
                <p className="text-sm text-purple-700">サンプルメッセージ</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <Scissors className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-medium text-orange-900">メニュー</h4>
                <p className="text-2xl font-bold text-orange-600">{selectedMenus.length}種類</p>
                <p className="text-sm text-orange-700">選択済みメニュー</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">テストデータの読み込み</h4>
                  <p className="text-sm text-gray-600">システムの動作確認用データを準備します</p>
                </div>
                <button
                  onClick={loadTestData}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  データ読み込み
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">含まれるデータ:</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 多様な顧客プロフィール（年齢・性別・来店履歴）</li>
                    <li>• 実際の予約パターン（過去・未来）</li>
                    <li>• LINE・Instagramメッセージサンプル</li>
                    <li>• 各種メニューと料金設定</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">安全性:</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 全て架空のデータです</li>
                    <li>• 外部送信は制限されています</li>
                    <li>• いつでもデータをリセット可能</li>
                    <li>• 個人情報は含まれません</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">セットアップ完了！</h3>
              <p className="text-gray-600">
                美容室管理システムの初期設定が完了しました。
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
              <h4 className="font-medium text-gray-900 mb-4">設定内容サマリー</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-left">
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">店舗情報:</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 店舗名: {setupData.name || '未設定'}</li>
                    <li>• タイプ: {setupData.type || '未設定'}</li>
                    <li>• 席数: {setupData.capacity}席</li>
                    <li>• 電話: {setupData.phone || '未設定'}</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">システム設定:</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• メニュー数: {selectedMenus.length}種類</li>
                    <li>• API連携: {selectedAPIs.length}サービス</li>
                    <li>• テストモード: {testMode ? '有効' : '無効'}</li>
                    <li>• テストデータ: 準備完了</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={completeSetup}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center justify-center"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                システムを開始する
              </button>
              
              <p className="text-sm text-gray-500">
                後からすべての設定を変更・追加することができます
              </p>
            </div>
          </div>
        )

      default:
        return <div>ステップが見つかりません</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            美容室管理システム初期設定
          </h1>
          <p className="text-gray-600">
            ステップ {currentStep + 1} / {steps.length}: {steps[currentStep].title}
          </p>
        </div>

        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step.icon
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-center ${index < steps.length - 1 ? 'flex-1' : ''} ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div className="font-medium">{step.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ステップコンテンツ */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {renderStepContent()}
        </div>

        {/* ナビゲーションボタン */}
        <div className="flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            前のステップ
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={nextStep}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              次のステップ
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InitialSetupWizard