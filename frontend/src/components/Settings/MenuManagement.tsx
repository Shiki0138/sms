import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Clock, 
  Search,
  Filter,
  Scissors,
  Palette,
  Sparkles,
  Star,
  CheckCircle
} from 'lucide-react'
import { ServiceMenu, MENU_CATEGORIES, MenuCategory } from '../../types/menu'
import { defaultMenus } from '../../data/defaultMenus'

interface MenuManagementProps {
  onMenusChange?: (menus: ServiceMenu[]) => void
}

const MenuManagement: React.FC<MenuManagementProps> = ({ onMenusChange }) => {
  const [menus, setMenus] = useState<ServiceMenu[]>(defaultMenus)
  const [filteredMenus, setFilteredMenus] = useState<ServiceMenu[]>(defaultMenus)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingMenu, setEditingMenu] = useState<ServiceMenu | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    duration: 30,
    category: 'cut' as ServiceMenu['category']
  })

  useEffect(() => {
    // メニューが変更された時の処理
    if (onMenusChange) {
      onMenusChange(menus)
    }
    
    // グローバルに登録（予約画面で使用）
    if (typeof window !== 'undefined') {
      (window as any).serviceMenus = menus.filter(m => m.isActive)
    }
  }, [menus, onMenusChange])

  useEffect(() => {
    // フィルタリング処理
    let filtered = [...menus]

    if (searchTerm) {
      filtered = filtered.filter(menu => 
        menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        menu.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(menu => menu.category === selectedCategory)
    }

    if (showActiveOnly) {
      filtered = filtered.filter(menu => menu.isActive)
    }

    setFilteredMenus(filtered)
  }, [menus, searchTerm, selectedCategory, showActiveOnly])

  const getCategoryInfo = (category: ServiceMenu['category']): MenuCategory => {
    return MENU_CATEGORIES.find(cat => cat.key === category) || MENU_CATEGORIES[MENU_CATEGORIES.length - 1]
  }

  const getCategoryIcon = (category: ServiceMenu['category']) => {
    switch (category) {
      case 'cut': return <Scissors className="w-4 h-4" />
      case 'color': return <Palette className="w-4 h-4" />
      case 'perm': return <Sparkles className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  }

  const handleCreateMenu = () => {
    const newMenu: ServiceMenu = {
      id: `menu_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      category: formData.category,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setMenus(prev => [...prev, newMenu])
    resetForm()
    setShowCreateModal(false)
  }

  const handleEditMenu = (menu: ServiceMenu) => {
    setEditingMenu(menu)
    setFormData({
      name: menu.name,
      description: menu.description || '',
      price: menu.price,
      duration: menu.duration,
      category: menu.category
    })
    setIsEditing(true)
  }

  const handleUpdateMenu = () => {
    if (!editingMenu) return

    const updatedMenu: ServiceMenu = {
      ...editingMenu,
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      category: formData.category,
      updatedAt: new Date().toISOString()
    }

    setMenus(prev => prev.map(menu => 
      menu.id === editingMenu.id ? updatedMenu : menu
    ))
    
    resetForm()
    setIsEditing(false)
    setEditingMenu(null)
  }

  const handleToggleActive = (menuId: string) => {
    setMenus(prev => prev.map(menu => 
      menu.id === menuId 
        ? { ...menu, isActive: !menu.isActive, updatedAt: new Date().toISOString() }
        : menu
    ))
  }

  const handleDeleteMenu = (menuId: string) => {
    if (window.confirm('このメニューを削除しますか？')) {
      setMenus(prev => prev.filter(menu => menu.id !== menuId))
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      duration: 30,
      category: 'cut'
    })
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`
    }
    return `${mins}分`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">メニュー管理</h3>
          <p className="text-sm text-gray-600">サービスメニューの追加・編集・削除ができます</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto min-h-[44px] touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">新規メニュー追加</span>
          <span className="sm:hidden">追加</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="メニュー名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          >
            <option value="all">全カテゴリ</option>
            {MENU_CATEGORIES.map(category => (
              <option key={category.key} value={category.key}>
                {category.icon} {category.label}
              </option>
            ))}
          </select>

          {/* Active Filter */}
          <label className="flex items-center space-x-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span className="text-sm text-gray-700">有効なメニューのみ表示</span>
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-blue-600 text-sm font-medium">総メニュー数</div>
          <div className="text-2xl font-bold text-blue-900">{menus.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-green-600 text-sm font-medium">有効メニュー</div>
          <div className="text-2xl font-bold text-green-900">{menus.filter(m => m.isActive).length}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-purple-600 text-sm font-medium">平均価格</div>
          <div className="text-2xl font-bold text-purple-900">
            ¥{Math.round(menus.filter(m => m.isActive).reduce((sum, m) => sum + m.price, 0) / menus.filter(m => m.isActive).length || 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="text-orange-600 text-sm font-medium">平均時間</div>
          <div className="text-2xl font-bold text-orange-900">
            {Math.round(menus.filter(m => m.isActive).reduce((sum, m) => sum + m.duration, 0) / menus.filter(m => m.isActive).length || 0)}分
          </div>
        </div>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">メニュー名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">カテゴリ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">価格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状態</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMenus.map((menu) => {
                const categoryInfo = getCategoryInfo(menu.category)
                return (
                  <tr key={menu.id} className={!menu.isActive ? 'opacity-60' : ''}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{menu.name}</div>
                        {menu.description && (
                          <div className="text-sm text-gray-500">{menu.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(menu.category)}
                        <span className={`text-sm font-medium text-${categoryInfo.color}-700`}>
                          {categoryInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium text-gray-900">
                          ¥{menu.price.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDuration(menu.duration)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(menu.id)}
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                          menu.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {menu.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{menu.isActive ? '有効' : '無効'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditMenu(menu)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(menu.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || isEditing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {isEditing ? 'メニュー編集' : '新規メニュー追加'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setIsEditing(false)
                    setEditingMenu(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                isEditing ? handleUpdateMenu() : handleCreateMenu()
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メニュー名 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="カット、カラーなど"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    説明
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="メニューの詳細説明"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      価格 (円) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="100"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      所要時間 (分) *
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {[15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180].map(duration => (
                        <option key={duration} value={duration}>
                          {formatDuration(duration)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    カテゴリ *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ServiceMenu['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {MENU_CATEGORIES.map(category => (
                      <option key={category.key} value={category.key}>
                        {category.icon} {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setIsEditing(false)
                      setEditingMenu(null)
                      resetForm()
                    }}
                    className="btn btn-secondary"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? '更新' : '追加'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MenuManagement