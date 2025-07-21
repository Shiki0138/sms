export const adminAccounts = [
  {
    id: 'admin',
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: '管理者'
  },
  {
    id: 'staff',
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    name: 'スタッフ'
  },
  {
    id: 'demo',
    username: 'demo',
    password: 'demo123',
    role: 'demo',
    name: 'デモユーザー'
  }
]

export const adminTestAccounts = adminAccounts.map(acc => ({
  ...acc,
  salonInfo: {
    name: 'テストサロン',
    address: '東京都渋谷区',
    type: 'hair',
    location: '東京都渋谷区'
  }
}))

export const loginTestInstructions = {
  admin: '管理者としてログイン',
  staff: 'スタッフとしてログイン',
  demo: 'デモユーザーとしてログイン',
  commonPassword: 'test123'
}