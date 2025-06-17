// 認証関連の型定義

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'staff' | 'demo'
  permissions: Permission[]
  profile: UserProfile
  createdAt: string
  lastLoginAt?: string
  isActive: boolean
}

export interface UserProfile {
  name: string
  avatar?: string
  phone?: string
  staffId?: string // スタッフの場合のみ
  department?: string
  position?: string
}

export interface Permission {
  resource: string // 'customers', 'reservations', 'messages', 'analytics', 'settings', etc.
  actions: PermissionAction[]
}

export type PermissionAction = 'read' | 'write' | 'delete' | 'admin'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  permissions: Permission[]
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresIn: number
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
  hasPermission: (resource: string, action: PermissionAction) => boolean
  refreshToken: () => Promise<boolean>
}

// 事前定義されたロール
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    {
      resource: '*',
      actions: ['read', 'write', 'delete', 'admin']
    }
  ],
  staff: [
    {
      resource: 'customers',
      actions: ['read', 'write']
    },
    {
      resource: 'reservations',
      actions: ['read', 'write']
    },
    {
      resource: 'messages',
      actions: ['read', 'write']
    },
    {
      resource: 'analytics',
      actions: ['read']
    },
    {
      resource: 'settings',
      actions: ['read']
    }
  ],
  demo: [
    {
      resource: 'customers',
      actions: ['read']
    },
    {
      resource: 'reservations',
      actions: ['read']
    },
    {
      resource: 'messages',
      actions: ['read']
    },
    {
      resource: 'analytics',
      actions: ['read']
    },
    {
      resource: 'settings',
      actions: ['read']
    }
  ]
}

// テストユーザーデータ
export const TEST_USERS: User[] = [
  {
    id: 'demo_001',
    username: 'salon_demo_001',
    email: 'demo@salon.example.com',
    role: 'demo',
    permissions: ROLE_PERMISSIONS.demo,
    profile: {
      name: 'デモユーザー',
      avatar: undefined,
      phone: '03-0000-0000',
      position: 'デモアカウント'
    },
    createdAt: '2024-06-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'admin_001',
    username: 'admin_system',
    email: 'admin@salon.example.com',
    role: 'admin',
    permissions: ROLE_PERMISSIONS.admin,
    profile: {
      name: 'システム管理者',
      avatar: undefined,
      phone: '03-0000-0001',
      position: 'システム管理者'
    },
    createdAt: '2024-06-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'staff_001',
    username: 'tanaka_misaki',
    email: 'tanaka@salon.example.com',
    role: 'staff',
    permissions: ROLE_PERMISSIONS.staff,
    profile: {
      name: '田中 美咲',
      avatar: undefined,
      phone: '03-0000-0002',
      staffId: 'staff1',
      department: '美容部',
      position: 'スタイリスト'
    },
    createdAt: '2024-06-01T00:00:00Z',
    isActive: true
  },
  {
    id: 'staff_002',
    username: 'sato_chinatsu',
    email: 'sato@salon.example.com',
    role: 'staff',
    permissions: ROLE_PERMISSIONS.staff,
    profile: {
      name: '佐藤 千夏',
      avatar: undefined,
      phone: '03-0000-0003',
      staffId: 'staff2',
      department: '美容部',
      position: 'スタイリスト'
    },
    createdAt: '2024-06-01T00:00:00Z',
    isActive: true
  }
]

// テスト用のログイン情報
export const TEST_LOGIN_CREDENTIALS = {
  demo: { username: 'salon_demo_001', password: 'Demo2024Salon!' },
  admin: { username: 'admin_system', password: 'AdminSalon2024!System' },
  staff1: { username: 'tanaka_misaki', password: 'Staff2024Tanaka!' },
  staff2: { username: 'sato_chinatsu', password: 'Staff2024Sato!' }
}