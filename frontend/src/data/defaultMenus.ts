import { ServiceMenu } from '../types/menu'

export const defaultMenus: ServiceMenu[] = [
  // カット
  {
    id: 'menu_001',
    name: 'カット',
    description: 'シャンプー・ブロー込み',
    price: 4500,
    duration: 60,
    category: 'cut',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'menu_002',
    name: 'カット＋シャンプー',
    description: 'カット・シャンプー・ブロー',
    price: 5000,
    duration: 75,
    category: 'cut',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'menu_003',
    name: 'メンズカット',
    description: 'シャンプー・スタイリング込み',
    price: 3500,
    duration: 45,
    category: 'cut',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // カラー
  {
    id: 'menu_004',
    name: 'カラー（リタッチ）',
    description: '根元のみのカラーリング',
    price: 6000,
    duration: 90,
    category: 'color',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'menu_005',
    name: 'カラー（フル）',
    description: '全体カラーリング',
    price: 8500,
    duration: 120,
    category: 'color',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'menu_006',
    name: 'ハイライト',
    description: '部分的なハイライトカラー',
    price: 7500,
    duration: 100,
    category: 'color',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'menu_007',
    name: 'カット＋カラー',
    description: 'カット・カラー・シャンプー・ブロー',
    price: 12000,
    duration: 150,
    category: 'color',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // パーマ
  {
    id: 'menu_008',
    name: 'パーマ',
    description: 'デジタルパーマ・シャンプー・ブロー込み',
    price: 9500,
    duration: 120,
    category: 'perm',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'menu_009',
    name: 'カット＋パーマ',
    description: 'カット・パーマ・シャンプー・ブロー',
    price: 13500,
    duration: 180,
    category: 'perm',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'menu_010',
    name: 'ストレートパーマ',
    description: 'ストレートパーマ・シャンプー・ブロー込み',
    price: 11000,
    duration: 150,
    category: 'perm',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // トリートメント
  {
    id: 'menu_011',
    name: 'トリートメント',
    description: '集中補修トリートメント',
    price: 3000,
    duration: 30,
    category: 'treatment',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'menu_012',
    name: 'プレミアムトリートメント',
    description: '最高級トリートメント・マッサージ込み',
    price: 5500,
    duration: 45,
    category: 'treatment',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ヘッドスパ
  {
    id: 'menu_013',
    name: 'ヘッドスパ',
    description: 'リラクゼーションヘッドスパ',
    price: 4000,
    duration: 60,
    category: 'spa',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'menu_014',
    name: 'プレミアムヘッドスパ',
    description: 'アロマオイルを使用した上級ヘッドスパ',
    price: 6500,
    duration: 90,
    category: 'spa',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // スタイリング
  {
    id: 'menu_015',
    name: 'セット・ブロー',
    description: 'ヘアセット・ブロー',
    price: 2500,
    duration: 30,
    category: 'styling',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'menu_016',
    name: '結婚式セット',
    description: '特別な日のためのヘアセット',
    price: 8000,
    duration: 90,
    category: 'styling',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]