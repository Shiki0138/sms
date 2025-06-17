export interface ServiceMenu {
  id: string
  name: string
  description?: string
  price: number
  duration: number // 分単位
  category: 'cut' | 'color' | 'perm' | 'treatment' | 'spa' | 'styling' | 'other'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MenuCategory {
  key: 'cut' | 'color' | 'perm' | 'treatment' | 'spa' | 'styling' | 'other'
  label: string
  icon: string
  color: string
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { key: 'cut', label: 'カット', icon: '✂️', color: 'blue' },
  { key: 'color', label: 'カラー', icon: '🎨', color: 'purple' },
  { key: 'perm', label: 'パーマ', icon: '💫', color: 'pink' },
  { key: 'treatment', label: 'トリートメント', icon: '✨', color: 'green' },
  { key: 'spa', label: 'ヘッドスパ', icon: '🧖‍♀️', color: 'indigo' },
  { key: 'styling', label: 'スタイリング', icon: '💇‍♀️', color: 'orange' },
  { key: 'other', label: 'その他', icon: '⭐', color: 'gray' }
]