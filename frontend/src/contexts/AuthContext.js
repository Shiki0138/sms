import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { TEST_USERS, TEST_LOGIN_CREDENTIALS } from '../types/auth';
// JWT トークンのデコード（簡易版）
const decodeJWT = (token) => {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    }
    catch {
        return null;
    }
};
// トークンの有効性チェック
const isTokenValid = (token) => {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp)
        return false;
    return decoded.exp * 1000 > Date.now();
};
// 簡易JWT生成（実際の本番環境では適切なJWTライブラリを使用）
const generateDemoJWT = (user) => {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        sub: user.id,
        username: user.username,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8時間有効
    };
    // Base64エンコード（デモ用、実際の本番環境では適切な署名が必要）
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(`demo_signature_${user.id}`);
    return `${encodedHeader}.${encodedPayload}.${signature}`;
};
// 認証状態の初期値
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    permissions: []
};
// 認証リデューサー
const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                isLoading: true
            };
        case 'LOGIN_SUCCESS':
            return {
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                permissions: action.payload.user.permissions
            };
        case 'LOGIN_FAILURE':
            return {
                ...initialState,
                isLoading: false
            };
        case 'LOGOUT':
            return {
                ...initialState,
                isLoading: false
            };
        case 'INIT_COMPLETE':
            if (action.payload) {
                return {
                    user: action.payload.user,
                    token: action.payload.token,
                    isAuthenticated: true,
                    isLoading: false,
                    permissions: action.payload.user.permissions
                };
            }
            return {
                ...initialState,
                isLoading: false
            };
        default:
            return state;
    }
};
// 認証コンテキスト
const AuthContext = createContext(null);
// 認証プロバイダー
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);
    // 初期化時にローカルストレージからトークンを確認
    useEffect(() => {
        const initAuth = () => {
            const storedToken = localStorage.getItem('salon_auth_token');
            const storedUser = localStorage.getItem('salon_auth_user');
            if (storedToken && storedUser && isTokenValid(storedToken)) {
                try {
                    const user = JSON.parse(storedUser);
                    dispatch({
                        type: 'INIT_COMPLETE',
                        payload: { user, token: storedToken }
                    });
                }
                catch (error) {
                    console.error('Failed to parse stored user data:', error);
                    localStorage.removeItem('salon_auth_token');
                    localStorage.removeItem('salon_auth_user');
                    dispatch({ type: 'INIT_COMPLETE' });
                }
            }
            else {
                if (storedToken) {
                    localStorage.removeItem('salon_auth_token');
                    localStorage.removeItem('salon_auth_user');
                }
                dispatch({ type: 'INIT_COMPLETE' });
            }
        };
        initAuth();
    }, []);
    // ログイン
    const login = async (credentials) => {
        dispatch({ type: 'LOGIN_START' });
        try {
            // デモ環境では事前定義されたユーザーをチェック
            await new Promise(resolve => setTimeout(resolve, 800)); // ログイン処理をシミュレート
            // テストユーザーの認証
            const user = TEST_USERS.find(u => u.username === credentials.username);
            if (!user) {
                dispatch({ type: 'LOGIN_FAILURE' });
                return false;
            }
            // パスワードチェック（デモ用）
            const validCredentials = Object.values(TEST_LOGIN_CREDENTIALS).find(cred => cred.username === credentials.username && cred.password === credentials.password);
            if (!validCredentials) {
                dispatch({ type: 'LOGIN_FAILURE' });
                return false;
            }
            // JWTトークン生成
            const token = generateDemoJWT(user);
            // ローカルストレージに保存
            localStorage.setItem('salon_auth_token', token);
            localStorage.setItem('salon_auth_user', JSON.stringify(user));
            // 最終ログイン時間を更新
            const updatedUser = {
                ...user,
                lastLoginAt: new Date().toISOString()
            };
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: updatedUser, token }
            });
            return true;
        }
        catch (error) {
            console.error('Login failed:', error);
            dispatch({ type: 'LOGIN_FAILURE' });
            return false;
        }
    };
    // ログアウト
    const logout = () => {
        localStorage.removeItem('salon_auth_token');
        localStorage.removeItem('salon_auth_user');
        dispatch({ type: 'LOGOUT' });
    };
    // 権限チェック
    const hasPermission = (resource, action) => {
        if (!state.user || !state.isAuthenticated)
            return false;
        // 管理者は全権限を持つ
        if (state.user.role === 'admin')
            return true;
        // ワイルドカード権限をチェック
        const wildcardPermission = state.permissions.find(p => p.resource === '*');
        if (wildcardPermission && wildcardPermission.actions.includes(action)) {
            return true;
        }
        // 特定リソースの権限をチェック
        const permission = state.permissions.find(p => p.resource === resource);
        return permission ? permission.actions.includes(action) : false;
    };
    // トークンリフレッシュ
    const refreshToken = async () => {
        if (!state.token || !state.user)
            return false;
        try {
            // 実際の本番環境ではサーバーAPIを呼び出し
            // デモ環境では新しいトークンを生成
            const newToken = generateDemoJWT(state.user);
            localStorage.setItem('salon_auth_token', newToken);
            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: { user: state.user, token: newToken }
            });
            return true;
        }
        catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return false;
        }
    };
    const contextValue = {
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        login,
        logout,
        hasPermission,
        refreshToken
    };
    return (_jsx(AuthContext.Provider, { value: contextValue, children: children }));
};
// カスタムフック
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
export default AuthContext;
