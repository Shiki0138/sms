// メニューデータテンプレート
export interface MenuTemplate {
  id: string
  name: string
  category: string
  price: number
  duration: number // minutes
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  popularity: 'high' | 'medium' | 'low'
  season?: string
  targetGender?: 'male' | 'female' | 'unisex'
  ageGroup?: string
}

export const menuTemplates: MenuTemplate[] = [
  // カット系
  {
    id: 'cut-001',
    name: 'レディースカット',
    category: 'カット',
    price: 4500,
    duration: 60,
    description: '髪質・骨格・ライフスタイルに合わせたオーダーメイドカット',
    difficulty: 'intermediate',
    popularity: 'high',
    targetGender: 'female',
    ageGroup: '20-50代'
  },
  {
    id: 'cut-002',
    name: 'メンズカット',
    category: 'カット',
    price: 3500,
    duration: 45,
    description: 'ビジネスシーンからカジュアルまで対応するメンズカット',
    difficulty: 'intermediate',
    popularity: 'high',
    targetGender: 'male',
    ageGroup: '20-40代'
  },
  {
    id: 'cut-003',
    name: 'キッズカット（小学生以下）',
    category: 'カット',
    price: 2500,
    duration: 30,
    description: 'お子様にやさしい雰囲気で丁寧にカット',
    difficulty: 'beginner',
    popularity: 'medium',
    targetGender: 'unisex',
    ageGroup: '3-12歳'
  },
  {
    id: 'cut-004',
    name: 'シニアカット',
    category: 'カット',
    price: 3800,
    duration: 50,
    description: '年齢に応じた上品で扱いやすいスタイル',
    difficulty: 'intermediate',
    popularity: 'medium',
    targetGender: 'unisex',
    ageGroup: '60歳以上'
  },
  {
    id: 'cut-005',
    name: 'ショートレイヤー',
    category: 'カット',
    price: 5000,
    duration: 70,
    description: '軽やかで動きのあるショートスタイル',
    difficulty: 'advanced',
    popularity: 'high',
    targetGender: 'female',
    ageGroup: '20-40代'
  },

  // カラー系
  {
    id: 'color-001',
    name: 'リタッチカラー',
    category: 'カラー',
    price: 5500,
    duration: 90,
    description: '根元の新生部分のみのカラーリング',
    difficulty: 'beginner',
    popularity: 'high',
    targetGender: 'unisex',
    ageGroup: '20-50代'
  },
  {
    id: 'color-002',
    name: 'フルカラー',
    category: 'カラー',
    price: 8500,
    duration: 120,
    description: '全体カラーで髪全体に均一な色味を',
    difficulty: 'intermediate',
    popularity: 'high',
    targetGender: 'unisex',
    ageGroup: '20-40代'
  },
  {
    id: 'color-003',
    name: 'ハイライト',
    category: 'カラー',
    price: 12000,
    duration: 150,
    description: '立体感と透明感を演出するハイライトカラー',
    difficulty: 'advanced',
    popularity: 'medium',
    targetGender: 'female',
    ageGroup: '20-35歳'
  },
  {
    id: 'color-004',
    name: 'イルミナカラー',
    category: 'カラー',
    price: 9500,
    duration: 130,
    description: '透明感とツヤを追求したプレミアムカラー',
    difficulty: 'advanced',
    popularity: 'high',
    targetGender: 'female',
    ageGroup: '20-40代'
  },
  {
    id: 'color-005',
    name: 'グラデーションカラー',
    category: 'カラー',
    price: 15000,
    duration: 180,
    description: '根元から毛先にかけて色の変化を楽しむスタイル',
    difficulty: 'advanced',
    popularity: 'medium',
    targetGender: 'female',
    ageGroup: '20-30代'
  },

  // パーマ系
  {
    id: 'perm-001',
    name: 'デジタルパーマ',
    category: 'パーマ',
    price: 12000,
    duration: 180,
    description: '形状記憶パーマで再現性の高いスタイリング',
    difficulty: 'advanced',
    popularity: 'high',
    targetGender: 'female',
    ageGroup: '20-40代'
  },
  {
    id: 'perm-002',
    name: 'エアウェーブ',
    category: 'パーマ',
    price: 10000,
    duration: 150,
    description: '低温で髪にやさしいふんわりパーマ',
    difficulty: 'intermediate',
    popularity: 'medium',
    targetGender: 'female',
    ageGroup: '30-50代'
  },
  {
    id: 'perm-003',
    name: 'ツイストスパイラル',
    category: 'パーマ',
    price: 11000,
    duration: 160,
    description: '動きのあるメンズパーマスタイル',
    difficulty: 'advanced',
    popularity: 'medium',
    targetGender: 'male',
    ageGroup: '20-35歳'
  },

  // ストレート系
  {
    id: 'straight-001',
    name: '縮毛矯正',
    category: 'ストレート',
    price: 15000,
    duration: 240,
    description: 'クセ毛を半永久的にストレートに',
    difficulty: 'advanced',
    popularity: 'high',
    targetGender: 'unisex',
    ageGroup: '20-50代'
  },
  {
    id: 'straight-002',
    name: 'ストレートパーマ',
    category: 'ストレート',
    price: 8000,
    duration: 120,
    description: '自然なストレートヘアに',
    difficulty: 'intermediate',
    popularity: 'medium',
    targetGender: 'unisex',
    ageGroup: '20-40代'
  },

  // トリートメント系
  {
    id: 'treatment-001',
    name: 'サイエンスアクア',
    category: 'トリートメント',
    price: 8000,
    duration: 90,
    description: '髪質改善トリートメントで健康的なツヤ髪に',
    difficulty: 'intermediate',
    popularity: 'high',
    targetGender: 'unisex',
    ageGroup: '20-50代'
  },
  {
    id: 'treatment-002',
    name: 'オーガニックトリートメント',
    category: 'トリートメント',
    price: 6000,
    duration: 60,
    description: '天然成分100%で髪と頭皮をケア',
    difficulty: 'beginner',
    popularity: 'medium',
    targetGender: 'unisex',
    ageGroup: '全年代'
  },
  {
    id: 'treatment-003',
    name: 'ケラチントリートメント',
    category: 'トリートメント',
    price: 10000,
    duration: 120,
    description: '髪の内部から補修する高濃度ケラチン',
    difficulty: 'advanced',
    popularity: 'medium',
    targetGender: 'unisex',
    ageGroup: '30-50代'
  },

  // ヘッドスパ系
  {
    id: 'spa-001',
    name: 'クレンジングスパ',
    category: 'ヘッドスパ',
    price: 4500,
    duration: 45,
    description: '毛穴の汚れを除去し頭皮環境を整える',
    difficulty: 'beginner',
    popularity: 'high',
    targetGender: 'unisex',
    ageGroup: '全年代'
  },
  {
    id: 'spa-002',
    name: 'アロマヘッドスパ',
    category: 'ヘッドスパ',
    price: 6000,
    duration: 60,
    description: '香りに包まれながらリラックスタイム',
    difficulty: 'intermediate',
    popularity: 'high',
    targetGender: 'female',
    ageGroup: '20-50代'
  },
  {
    id: 'spa-003',
    name: '炭酸ヘッドスパ',
    category: 'ヘッドスパ',
    price: 5500,
    duration: 50,
    description: '炭酸の力で血行促進・頭皮ケア',
    difficulty: 'intermediate',
    popularity: 'medium',
    targetGender: 'unisex',
    ageGroup: '30-60代'
  },

  // セット・その他
  {
    id: 'set-001',
    name: 'ヘアセット',
    category: 'セット',
    price: 3500,
    duration: 45,
    description: '結婚式・パーティーなど特別な日のセット',
    difficulty: 'intermediate',
    popularity: 'medium',
    targetGender: 'female',
    ageGroup: '20-40代'
  },
  {
    id: 'set-002',
    name: 'メンズセット',
    category: 'セット',
    price: 2000,
    duration: 20,
    description: 'ビジネス・プライベートに最適なスタイリング',
    difficulty: 'beginner',
    popularity: 'medium',
    targetGender: 'male',
    ageGroup: '20-50代'
  },
  {
    id: 'shave-001',
    name: 'シェービング',
    category: 'シェービング',
    price: 2500,
    duration: 30,
    description: '丁寧な手技による本格シェービング',
    difficulty: 'intermediate',
    popularity: 'medium',
    targetGender: 'male',
    ageGroup: '20-60代'
  },
  {
    id: 'eyebrow-001',
    name: '眉カット',
    category: '眉カット',
    price: 1500,
    duration: 15,
    description: '顔の印象を変える眉デザイン',
    difficulty: 'beginner',
    popularity: 'high',
    targetGender: 'unisex',
    ageGroup: '20-50代'
  }
]

// セットメニューテンプレート
export const setMenuTemplates = [
  {
    id: 'set-menu-001',
    name: 'カット + カラー',
    items: ['cut-001', 'color-002'],
    originalPrice: 13000,
    setPrice: 11500,
    discount: 1500,
    duration: 180,
    description: '人気No.1のセットメニュー',
    popularity: 'high'
  },
  {
    id: 'set-menu-002',
    name: 'カット + パーマ',
    items: ['cut-001', 'perm-001'],
    originalPrice: 16500,
    setPrice: 14500,
    discount: 2000,
    duration: 240,
    description: 'スタイルチェンジにおすすめ',
    popularity: 'medium'
  },
  {
    id: 'set-menu-003',
    name: 'カット + トリートメント',
    items: ['cut-001', 'treatment-001'],
    originalPrice: 12500,
    setPrice: 11000,
    discount: 1500,
    duration: 150,
    description: '髪質改善コース',
    popularity: 'high'
  },
  {
    id: 'set-menu-004',
    name: 'カット + カラー + トリートメント',
    items: ['cut-001', 'color-002', 'treatment-001'],
    originalPrice: 21000,
    setPrice: 18000,
    discount: 3000,
    duration: 210,
    description: 'フルコースで理想のスタイルに',
    popularity: 'medium'
  },
  {
    id: 'set-menu-005',
    name: 'メンズカット + シェービング',
    items: ['cut-002', 'shave-001'],
    originalPrice: 6000,
    setPrice: 5500,
    discount: 500,
    duration: 75,
    description: 'スッキリ清潔感コース',
    popularity: 'high'
  }
]

// 季節限定メニュー
export const seasonalMenus = [
  {
    id: 'seasonal-001',
    name: '春のパステルカラー',
    category: 'カラー',
    price: 9000,
    duration: 120,
    description: '春らしいパステルトーンのカラーリング',
    difficulty: 'advanced',
    popularity: 'high',
    season: 'spring',
    targetGender: 'female',
    ageGroup: '20-35歳',
    period: '3月-5月'
  },
  {
    id: 'seasonal-002',
    name: '夏のクールカラー',
    category: 'カラー', 
    price: 8500,
    duration: 110,
    description: '暑い夏を涼しく演出するクールトーン',
    difficulty: 'intermediate',
    popularity: 'high',
    season: 'summer',
    targetGender: 'unisex',
    ageGroup: '20-40代',
    period: '6月-8月'
  },
  {
    id: 'seasonal-003',
    name: '秋のグラデーションカラー',
    category: 'カラー',
    price: 13000,
    duration: 150,
    description: '秋らしい深みのあるグラデーション',
    difficulty: 'advanced',
    popularity: 'medium',
    season: 'autumn',
    targetGender: 'female',
    ageGroup: '20-40代',
    period: '9月-11月'
  },
  {
    id: 'seasonal-004',
    name: '冬のボリュームパーマ',
    category: 'パーマ',
    price: 11000,
    duration: 170,
    description: '寒い冬にふんわりボリューム感',
    difficulty: 'intermediate',
    popularity: 'medium',
    season: 'winter',
    targetGender: 'female',
    ageGroup: '20-50代',
    period: '12月-2月'
  }
]

// メニューカテゴリー設定
export const menuCategories = [
  { id: 'cut', name: 'カット', color: '#3B82F6', icon: '✂️' },
  { id: 'color', name: 'カラー', color: '#EC4899', icon: '🎨' },
  { id: 'perm', name: 'パーマ', color: '#8B5CF6', icon: '🌀' },
  { id: 'straight', name: 'ストレート', color: '#06B6D4', icon: '📏' },
  { id: 'treatment', name: 'トリートメント', color: '#10B981', icon: '✨' },
  { id: 'spa', name: 'ヘッドスパ', color: '#F59E0B', icon: '💆' },
  { id: 'set', name: 'セット', color: '#EF4444', icon: '💄' },
  { id: 'shaving', name: 'シェービング', color: '#6B7280', icon: '🪒' },
  { id: 'eyebrow', name: '眉カット', color: '#84CC16', icon: '👁️' },
  { id: 'other', name: 'その他', color: '#64748B', icon: '🔧' }
]