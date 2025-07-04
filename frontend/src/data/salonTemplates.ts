// 店舗情報テンプレート
export interface SalonInfo {
  id: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  website?: string
  openHours: {
    [key: string]: { open: string; close: string; closed: boolean }
  }
  services: string[]
  priceRange: string
  capacity: number
  founded: string
}

export const salonTemplates: SalonInfo[] = [
  {
    id: 'template-1',
    name: 'Hair Studio TOKYO',
    description: '東京都心にある洗練されたヘアサロン。最新トレンドと技術で、あなたの魅力を最大限に引き出します。',
    address: '東京都渋谷区神宮前3-15-7 ビューティービル2F',
    phone: '03-1234-5678',
    email: 'info@hairstudio-tokyo.com',
    website: 'https://hairstudio-tokyo.com',
    openHours: {
      monday: { open: '10:00', close: '19:00', closed: true },
      tuesday: { open: '10:00', close: '19:00', closed: false },
      wednesday: { open: '10:00', close: '19:00', closed: false },
      thursday: { open: '10:00', close: '19:00', closed: false },
      friday: { open: '10:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '19:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false }
    },
    services: ['カット', 'カラー', 'パーマ', 'トリートメント', 'ヘッドスパ'],
    priceRange: '¥3,000 - ¥15,000',
    capacity: 12,
    founded: '2018'
  },
  {
    id: 'template-2',
    name: 'Salon de Belle',
    description: '女性専用のプライベートサロン。リラックスできる空間で、上質なビューティーサービスをご提供。',
    address: '東京都新宿区西新宿1-8-3 小田急南新宿ビル5F',
    phone: '03-2345-6789',
    email: 'contact@salon-de-belle.jp',
    website: 'https://salon-de-belle.jp',
    openHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: true },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '19:00', closed: false },
      saturday: { open: '08:30', close: '18:00', closed: false },
      sunday: { open: '08:30', close: '17:00', closed: false }
    },
    services: ['カット', 'カラー', 'パーマ', 'ストレート', 'エクステ', 'ヘッドスパ', 'フェイシャル'],
    priceRange: '¥4,000 - ¥20,000',
    capacity: 8,
    founded: '2020'
  },
  {
    id: 'template-3',
    name: 'Men\'s Grooming Lab',
    description: '男性専用理容室。ビジネスマンから学生まで、幅広い年代の男性に愛されるサロン。',
    address: '東京都千代田区丸の内2-4-1 丸の内ビルディング1F',
    phone: '03-3456-7890',
    email: 'info@mens-grooming-lab.com',
    openHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '17:00', closed: true }
    },
    services: ['カット', 'シェービング', 'ヘッドスパ', '眉カット', 'ヒゲデザイン'],
    priceRange: '¥2,500 - ¥8,000',
    capacity: 6,
    founded: '2019'
  },
  {
    id: 'template-4',
    name: 'Family Hair Plus',
    description: 'ファミリー向けヘアサロン。お子様からご年配の方まで、家族みんなでご利用いただけます。',
    address: '東京都世田谷区三軒茶屋2-11-20 サンタワーズセンタービル3F',
    phone: '03-4567-8901',
    email: 'info@family-hair-plus.net',
    openHours: {
      monday: { open: '09:00', close: '19:00', closed: true },
      tuesday: { open: '09:00', close: '19:00', closed: false },
      wednesday: { open: '09:00', close: '19:00', closed: false },
      thursday: { open: '09:00', close: '19:00', closed: false },
      friday: { open: '09:00', close: '19:00', closed: false },
      saturday: { open: '08:30', close: '19:00', closed: false },
      sunday: { open: '08:30', close: '18:00', closed: false }
    },
    services: ['カット', 'カラー', 'パーマ', 'キッズカット', 'シニアカット', 'ヘッドスパ'],
    priceRange: '¥1,800 - ¥12,000',
    capacity: 10,
    founded: '2015'
  },
  {
    id: 'template-5',
    name: 'Premium Beauty Lounge',
    description: '完全個室のプレミアムサロン。VIP空間で最高級のビューティーサービスをお楽しみください。',
    address: '東京都港区六本木7-14-10 誠志堂ビル4F',
    phone: '03-5678-9012',
    email: 'concierge@premium-beauty-lounge.com',
    website: 'https://premium-beauty-lounge.com',
    openHours: {
      monday: { open: '10:00', close: '21:00', closed: false },
      tuesday: { open: '10:00', close: '21:00', closed: false },
      wednesday: { open: '10:00', close: '21:00', closed: true },
      thursday: { open: '10:00', close: '21:00', closed: false },
      friday: { open: '10:00', close: '21:00', closed: false },
      saturday: { open: '09:00', close: '20:00', closed: false },
      sunday: { open: '09:00', close: '19:00', closed: false }
    },
    services: ['カット', 'カラー', 'パーマ', 'ストレート', 'トリートメント', 'ヘッドスパ', 'マッサージ', 'ネイル'],
    priceRange: '¥8,000 - ¥30,000',
    capacity: 4,
    founded: '2021'
  }
]

// 店舗設定用の選択肢
export const salonOptions = {
  prefectures: [
    '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
    '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
    '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
    '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
    '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
    '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
    '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
  ],
  salonTypes: [
    'ヘアサロン',
    '美容室',
    '理容室',
    'ネイルサロン',
    'エステサロン',
    'アイラッシュサロン',
    'メンズサロン',
    'キッズサロン',
    'ファミリーサロン',
    'プライベートサロン'
  ],
  serviceCategories: [
    'カット',
    'カラー',
    'パーマ',
    'ストレート',
    'トリートメント',
    'ヘッドスパ',
    'シェービング',
    '眉カット',
    'ヒゲデザイン',
    'エクステンション',
    'ネイル',
    'フェイシャル',
    'マッサージ',
    'ヘアセット',
    'ブライダル',
    'ヘアケア相談'
  ],
  priceRanges: [
    '¥1,000 - ¥3,000',
    '¥2,000 - ¥5,000', 
    '¥3,000 - ¥8,000',
    '¥5,000 - ¥12,000',
    '¥8,000 - ¥20,000',
    '¥15,000 - ¥30,000',
    '¥25,000以上'
  ],
  capacityOptions: [
    { value: 2, label: '2席（小規模）' },
    { value: 4, label: '4席（アットホーム）' },
    { value: 6, label: '6席（標準）' },
    { value: 8, label: '8席（中規模）' },
    { value: 10, label: '10席（大規模）' },
    { value: 12, label: '12席（大型店）' },
    { value: 15, label: '15席以上（超大型店）' }
  ]
}