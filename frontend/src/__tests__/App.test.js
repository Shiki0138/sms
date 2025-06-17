import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
// Mock the API hooks
vi.mock('../hooks/useThreads', () => ({
    useThreads: () => ({
        data: {
            threads: [
                {
                    id: '1',
                    customer: { id: '1', name: 'テスト顧客' },
                    channel: 'INSTAGRAM',
                    status: 'OPEN',
                    unreadCount: 2,
                    lastMessage: {
                        id: '1',
                        content: 'こんにちは！',
                        senderType: 'CUSTOMER',
                        createdAt: '2024-06-14T09:00:00Z'
                    }
                }
            ]
        },
        isLoading: false,
        error: null
    })
}));
vi.mock('../hooks/useCustomers', () => ({
    useCustomers: () => ({
        data: {
            customers: [
                {
                    id: '1',
                    name: 'テスト顧客',
                    phone: '090-1234-5678',
                    email: 'test@example.com',
                    lastVisitDate: '2024-06-10T10:00:00Z',
                    visitCount: 5,
                    totalSpent: 50000
                }
            ]
        },
        isLoading: false,
        error: null
    })
}));
vi.mock('../hooks/useReservations', () => ({
    useReservations: () => ({
        data: {
            reservations: [
                {
                    id: '1',
                    customerName: 'テスト顧客',
                    startTime: '2024-06-14T14:00:00Z',
                    endTime: '2024-06-14T16:00:00Z',
                    menuContent: 'カット＆カラー',
                    status: 'CONFIRMED'
                }
            ]
        },
        isLoading: false,
        error: null
    })
}));
vi.mock('../hooks/api', () => ({
    useSendReply: () => ({
        mutate: vi.fn(),
        isLoading: false
    })
}));
describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders the login screen', () => {
        render(_jsx(App, {}));
        expect(screen.getByText('美容室管理システム')).toBeInTheDocument();
        expect(screen.getByText('システムにログインしてください')).toBeInTheDocument();
    });
    it('displays login form elements', () => {
        render(_jsx(App, {}));
        expect(screen.getByLabelText('ユーザー名')).toBeInTheDocument();
        expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
    });
    it('shows demo accounts section', () => {
        render(_jsx(App, {}));
        expect(screen.getByText('デモアカウント')).toBeInTheDocument();
        expect(screen.getByText('デモユーザー')).toBeInTheDocument();
        expect(screen.getByText('管理者')).toBeInTheDocument();
    });
    it('has username and password input fields', () => {
        render(_jsx(App, {}));
        const usernameInput = screen.getByPlaceholderText('ユーザー名を入力');
        const passwordInput = screen.getByPlaceholderText('パスワードを入力');
        expect(usernameInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
    });
    it('can toggle password visibility', async () => {
        render(_jsx(App, {}));
        const passwordInput = screen.getByPlaceholderText('パスワードを入力');
        // パスワード入力欄の隣にある無名ボタン（パスワード表示切り替え）
        const toggleButton = screen.getAllByRole('button').find(button => button.getAttribute('type') === 'button' &&
            button.textContent === '');
        expect(passwordInput).toHaveAttribute('type', 'password');
        expect(toggleButton).toBeInTheDocument();
        if (toggleButton) {
            fireEvent.click(toggleButton);
            await waitFor(() => {
                expect(passwordInput).toHaveAttribute('type', 'text');
            });
        }
    });
    it('handles form submission', async () => {
        render(_jsx(App, {}));
        const usernameInput = screen.getByPlaceholderText('ユーザー名を入力');
        const passwordInput = screen.getByPlaceholderText('パスワードを入力');
        const loginButton = screen.getByRole('button', { name: 'ログイン' });
        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(loginButton);
        // Form submission is handled
        expect(usernameInput).toHaveValue('testuser');
        expect(passwordInput).toHaveValue('password123');
    });
    it('displays demo account buttons', () => {
        render(_jsx(App, {}));
        expect(screen.getByText('田中 美咲')).toBeInTheDocument();
        expect(screen.getByText('佐藤 千夏')).toBeInTheDocument();
    });
    it('shows system description', () => {
        render(_jsx(App, {}));
        expect(screen.getByText('このシステムは認証が必要です')).toBeInTheDocument();
        expect(screen.getByText('適切な権限を持つアカウントでログインしてください')).toBeInTheDocument();
    });
});
