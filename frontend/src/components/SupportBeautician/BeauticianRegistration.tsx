import React, { useState } from 'react'
import { 
  User, 
  MapPin, 
  Clock, 
  DollarSign, 
  Award, 
  Sparkles,
  Calendar,
  Star,
  Heart,
  Camera,
  Plus,
  X,
  Check
} from 'lucide-react'

interface BeauticianRegistrationProps {
  onComplete?: () => void
}

const BeauticianRegistration: React.FC<BeauticianRegistrationProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // 基本情報
    name: '',
    email: '',
    phone: '',
    profilePhoto: '',
    
    // プロフェッショナル情報
    experience: '',
    licenses: [] as string[],
    skills: [] as string[],
    specialties: '',
    portfolioImages: [] as string[],
    
    // 勤務条件
    workAreas: [] as string[],
    maxDistance: 20,
    workDays: [] as string[],
    workHours: {
      morning: false,
      afternoon: false,
      evening: false,
      flexible: false
    },
    minHourlyRate: '',
    preferredSalons: [] as string[],
    
    // アピールポイント
    strongPoints: '',
    workStyle: '',
    customerService: '',
    achievements: '',
    whyMe: '',
    
    // その他
    availableFrom: '',
    urgentAvailable: false,
    shortNotice: false,
    holidayWork: false,
    introduction: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const skillOptions = [
    'カット', 'カラー', 'パーマ', 'ストレート', 'トリートメント',
    'ヘッドスパ', 'アップスタイル', 'メイク', 'ネイル', 'まつエク',
    'エステ', '着付け', 'ブライダル', 'メンズカット', 'キッズカット'
  ]

  const workAreaOptions = [
    '渋谷・原宿', '新宿・代々木', '池袋', '銀座・有楽町', '六本木・赤坂',
    '表参道・青山', '恵比寿・代官山', '品川・目黒', '上野・浅草', '吉祥寺・三鷹',
    '立川・八王子', '横浜', '川崎', '大宮', '千葉', 'その他'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // エラーをクリア
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleArrayToggle = (field: string, value: string) => {
    const array = formData[field as keyof typeof formData] as string[]
    if (array.includes(value)) {
      handleInputChange(field, array.filter(item => item !== value))
    } else {
      handleInputChange(field, [...array, value])
    }
  }

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (stepNumber) {
      case 1:
        if (!formData.name) newErrors.name = '名前を入力してください'
        if (!formData.email) newErrors.email = 'メールアドレスを入力してください'
        if (!formData.phone) newErrors.phone = '電話番号を入力してください'
        break
      case 2:
        if (!formData.experience) newErrors.experience = '経験年数を選択してください'
        if (formData.skills.length === 0) newErrors.skills = 'スキルを1つ以上選択してください'
        break
      case 3:
        if (formData.workAreas.length === 0) newErrors.workAreas = '勤務可能エリアを選択してください'
        if (!formData.minHourlyRate) newErrors.minHourlyRate = '希望時給を入力してください'
        break
      case 4:
        if (!formData.strongPoints) newErrors.strongPoints = '強みを入力してください'
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleSubmit = () => {
    if (validateStep(4)) {
      console.log('登録データ:', formData)
      // ここで実際の登録処理を行う
      if (onComplete) {
        onComplete()
      }
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">基本情報</h2>
            
            {/* プロフィール写真 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                  {formData.profilePhoto ? (
                    <img src={formData.profilePhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600">プロフィール写真をアップロード</p>
            </div>

            {/* 名前 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="山田 花子"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="example@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* 電話番号 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="090-1234-5678"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">スキル・経験</h2>

            {/* 経験年数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                美容師経験年数 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.experience ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">選択してください</option>
                <option value="1">1年未満</option>
                <option value="1-3">1〜3年</option>
                <option value="3-5">3〜5年</option>
                <option value="5-10">5〜10年</option>
                <option value="10+">10年以上</option>
              </select>
              {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
            </div>

            {/* スキル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                対応可能な施術 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {skillOptions.map(skill => (
                  <button
                    key={skill}
                    onClick={() => handleArrayToggle('skills', skill)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      formData.skills.includes(skill)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {errors.skills && <p className="text-red-500 text-sm mt-1">{errors.skills}</p>}
            </div>

            {/* 資格 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                保有資格
              </label>
              <textarea
                value={formData.licenses.join('\n')}
                onChange={(e) => handleInputChange('licenses', e.target.value.split('\n').filter(l => l))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="美容師免許&#10;管理美容師&#10;色彩検定1級"
              />
            </div>

            {/* 得意分野 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                得意分野・専門技術
              </label>
              <textarea
                value={formData.specialties}
                onChange={(e) => handleInputChange('specialties', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="ブリーチワーク、外国人風カラー、ショートカットが得意です"
              />
            </div>

            {/* ポートフォリオ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作品写真（任意）
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer">
                    <Plus className="w-6 h-6 text-gray-400" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">あなたの技術をアピールできる写真を追加</p>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">勤務条件</h2>

            {/* 勤務可能エリア */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                勤務可能エリア <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {workAreaOptions.map(area => (
                  <button
                    key={area}
                    onClick={() => handleArrayToggle('workAreas', area)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      formData.workAreas.includes(area)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
              {errors.workAreas && <p className="text-red-500 text-sm mt-1">{errors.workAreas}</p>}
            </div>

            {/* 最大移動距離 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最大移動距離
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={formData.maxDistance}
                  onChange={(e) => handleInputChange('maxDistance', parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm font-medium w-16 text-right">{formData.maxDistance}km</span>
              </div>
            </div>

            {/* 勤務可能時間帯 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                勤務可能時間帯
              </label>
              <div className="space-y-2">
                {[
                  { key: 'morning', label: '午前（9:00-12:00）' },
                  { key: 'afternoon', label: '午後（12:00-18:00）' },
                  { key: 'evening', label: '夜間（18:00-21:00）' },
                  { key: 'flexible', label: '時間は相談可能' }
                ].map(time => (
                  <label key={time.key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.workHours[time.key as keyof typeof formData.workHours]}
                      onChange={(e) => handleInputChange('workHours', {
                        ...formData.workHours,
                        [time.key]: e.target.checked
                      })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{time.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 希望時給 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最低希望時給 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={formData.minHourlyRate}
                  onChange={(e) => handleInputChange('minHourlyRate', e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.minHourlyRate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2,500"
                />
              </div>
              {errors.minHourlyRate && <p className="text-red-500 text-sm mt-1">{errors.minHourlyRate}</p>}
            </div>

            {/* 特別対応 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                特別対応可能
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.urgentAvailable}
                    onChange={(e) => handleInputChange('urgentAvailable', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">緊急対応可能（当日依頼OK）</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.shortNotice}
                    onChange={(e) => handleInputChange('shortNotice', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">前日連絡でも対応可能</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.holidayWork}
                    onChange={(e) => handleInputChange('holidayWork', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">土日祝日も勤務可能</span>
                </label>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">アピールポイント</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 ヒント：</strong>あなたの個性や強みを自由にアピールしてください。
                経営者様があなたを選びたくなる理由を具体的に書きましょう！
              </p>
            </div>

            {/* 強み・特徴 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                あなたの強み・特徴 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.strongPoints}
                onChange={(e) => handleInputChange('strongPoints', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.strongPoints ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                placeholder="例：10年以上の経験で、どんな髪質のお客様にも対応できます。特にダメージヘアの改善が得意で、多くのお客様から喜びの声をいただいています。"
              />
              {errors.strongPoints && <p className="text-red-500 text-sm mt-1">{errors.strongPoints}</p>}
            </div>

            {/* 仕事への姿勢 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                仕事への姿勢・こだわり
              </label>
              <textarea
                value={formData.workStyle}
                onChange={(e) => handleInputChange('workStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="例：お客様一人ひとりとしっかり向き合い、その方に最適な施術を提供することを心がけています。"
              />
            </div>

            {/* 接客スタイル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                接客スタイル
              </label>
              <textarea
                value={formData.customerService}
                onChange={(e) => handleInputChange('customerService', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="例：明るく親しみやすい接客を心がけており、初めてのお客様でもリラックスしていただけます。"
              />
            </div>

            {/* 実績・成果 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                これまでの実績・成果
              </label>
              <textarea
                value={formData.achievements}
                onChange={(e) => handleInputChange('achievements', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="例：前職では指名率80%以上を維持。SNSでの作品投稿により新規顧客獲得にも貢献しました。"
              />
            </div>

            {/* なぜ私を選ぶべきか */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                私を選ぶメリット
              </label>
              <textarea
                value={formData.whyMe}
                onChange={(e) => handleInputChange('whyMe', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="例：即戦力として貢献できます。幅広い技術と経験により、どんなオーダーにも対応可能です。また、明るい性格でサロンの雰囲気作りにも貢献します。"
              />
            </div>

            {/* 自己紹介 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                自由にメッセージをどうぞ
              </label>
              <textarea
                value={formData.introduction}
                onChange={(e) => handleInputChange('introduction', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="サロン経営者様へのメッセージや、追加のアピールポイントなど、自由にお書きください。"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              className={`flex items-center ${num < 4 ? 'flex-1' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= num
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > num ? <Check className="w-5 h-5" /> : num}
              </div>
              {num < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > num ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm">
          <span className={step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            基本情報
          </span>
          <span className={step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            スキル・経験
          </span>
          <span className={step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            勤務条件
          </span>
          <span className={step >= 4 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
            アピール
          </span>
        </div>
      </div>

      {/* フォーム内容 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        {renderStep()}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={step === 1}
          className={`px-6 py-2 rounded-lg font-medium ${
            step === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          前へ
        </button>

        {step < 4 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
          >
            <span>次へ</span>
            <Sparkles className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center space-x-2"
          >
            <span>登録を完了する</span>
            <Heart className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default BeauticianRegistration