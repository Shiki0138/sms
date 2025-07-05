export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // テスト用ユーザー
  const testUsers = [
    {
      id: 'admin-001',
      email: 'admin@salon.com',
      password: 'admin123',
      username: 'admin',
      role: 'admin',
      isActive: true,
      permissions: [
        { resource: 'all', actions: ['read', 'write', 'delete', 'admin'] }
      ],
      profile: {
        name: '管理者',
        department: '管理部',
        position: 'システム管理者'
      }
    },
    {
      id: 'staff-001',
      email: 'staff@salon.com',
      password: 'staff123',
      username: 'staff',
      role: 'staff',
      isActive: true,
      permissions: [
        { resource: 'appointments', actions: ['read', 'write'] },
        { resource: 'customers', actions: ['read', 'write'] }
      ],
      profile: {
        name: 'スタッフ',
        department: '営業部',
        position: 'スタッフ'
      }
    }
  ];

  // ユーザー認証
  const user = testUsers.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ 
      error: 'Invalid credentials',
      message: 'メールアドレスまたはパスワードが正しくありません' 
    });
  }

  // パスワードを除いたユーザー情報を返す
  const { password: _, ...userWithoutPassword } = user;

  // JWTトークンの代わりにシンプルなトークンを生成
  const token = `token-${user.id}-${Date.now()}`;

  res.status(200).json({
    success: true,
    user: {
      ...userWithoutPassword,
      createdAt: new Date().toISOString()
    },
    token,
    message: 'ログインに成功しました'
  });
}