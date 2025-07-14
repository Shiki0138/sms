// Mock Authentication Service for Testing
interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
  plan: 'FREE' | 'STANDARD' | 'PREMIUM';
  phoneNumber?: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

// Mock users database
const mockUsers = [
  {
    id: '1',
    email: 'admin@salon-system.com',
    password: 'admin123',
    name: 'システム管理者',
    role: 'ADMIN' as const,
    plan: 'PREMIUM' as const,
    phoneNumber: '090-1234-5678'
  }
];

// Mock authentication service
export const mockAuthService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
      
      // Store auth data in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      
      return {
        success: true,
        token,
        user: userWithoutPassword
      };
    }
    
    return {
      success: false,
      error: 'メールアドレスまたはパスワードが正しくありません'
    };
  },
  
  logout: async (): Promise<void> => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },
  
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  }
};