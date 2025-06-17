import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PaymentMethodSettings from '../components/Settings/PaymentMethodSettings';
// fetchをモック
global.fetch = jest.fn();
describe('PaymentMethodSettings', () => {
    const mockPaymentMethods = [
        {
            id: 'pm-1',
            provider: 'stripe',
            type: 'card',
            last4: '4242',
            brand: 'visa',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true,
            createdAt: new Date()
        },
        {
            id: 'pm-2',
            provider: 'square',
            type: 'card',
            last4: '1234',
            brand: 'mastercard',
            expiryMonth: 6,
            expiryYear: 2026,
            isDefault: false,
            createdAt: new Date()
        }
    ];
    const mockProviderSettings = {
        provider: 'stripe',
        availableProviders: [
            { id: 'stripe', name: 'Stripe', available: true },
            { id: 'square', name: 'Square', available: true },
            { id: 'paypal', name: 'PayPal', available: false },
            { id: 'payjp', name: 'PAY.JP', available: true }
        ]
    };
    beforeEach(() => {
        jest.clearAllMocks();
        // fetchのデフォルトレスポンスを設定
        global.fetch.mockImplementation((url) => {
            if (url.includes('payment-methods')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockPaymentMethods)
                });
            }
            if (url.includes('provider-settings')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockProviderSettings)
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        });
    });
    it('正常にレンダリングされる', async () => {
        render(_jsx(PaymentMethodSettings, {}));
        // ローディング表示が最初に表示される
        expect(screen.getByText('読み込み中...')).toBeInTheDocument();
        // データ読み込み後の表示
        await waitFor(() => {
            expect(screen.getByText('決済設定')).toBeInTheDocument();
        });
        expect(screen.getByText('決済プロバイダー')).toBeInTheDocument();
        expect(screen.getByText('登録済み決済方法')).toBeInTheDocument();
    });
    it('決済プロバイダーが正しく表示される', async () => {
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            expect(screen.getByText('Stripe')).toBeInTheDocument();
            expect(screen.getByText('Square')).toBeInTheDocument();
            expect(screen.getByText('PayPal')).toBeInTheDocument();
            expect(screen.getByText('PAY.JP')).toBeInTheDocument();
        });
        // 現在選択されているプロバイダーが正しく表示される
        const stripeProvider = screen.getByText('Stripe').closest('div');
        expect(stripeProvider).toHaveClass('border-blue-500');
    });
    it('利用可能/不可のプロバイダーが正しく表示される', async () => {
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            // 利用可能なプロバイダー
            expect(screen.getAllByText('利用可能')).toHaveLength(3); // Stripe, Square, PAY.JP
            // 設定が必要なプロバイダー
            expect(screen.getByText('設定が必要')).toBeInTheDocument(); // PayPal
        });
    });
    it('登録済み決済方法が正しく表示される', async () => {
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            expect(screen.getByText('VISA •••• 4242')).toBeInTheDocument();
            expect(screen.getByText('MASTERCARD •••• 1234')).toBeInTheDocument();
            expect(screen.getByText('有効期限: 12/2025')).toBeInTheDocument();
            expect(screen.getByText('有効期限: 6/2026')).toBeInTheDocument();
            expect(screen.getByText('デフォルト')).toBeInTheDocument();
        });
    });
    it('決済方法がない場合の表示', async () => {
        // 空の決済方法配列を返すようにモック
        global.fetch.mockImplementation((url) => {
            if (url.includes('payment-methods')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([])
                });
            }
            if (url.includes('provider-settings')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockProviderSettings)
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        });
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            expect(screen.getByText('登録済みの決済方法がありません')).toBeInTheDocument();
            expect(screen.getByText('最初の決済方法を追加')).toBeInTheDocument();
        });
    });
    it('プロバイダー変更ができる', async () => {
        global.fetch.mockImplementation((url, options) => {
            if (url.includes('payment-methods')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockPaymentMethods)
                });
            }
            if (url.includes('provider-settings')) {
                if (options?.method === 'PATCH') {
                    return Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({ success: true, provider: 'square' })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockProviderSettings)
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        });
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            expect(screen.getByText('Square')).toBeInTheDocument();
        });
        // Squareプロバイダーをクリック
        const squareProvider = screen.getByText('Square').closest('div');
        fireEvent.click(squareProvider);
        await waitFor(() => {
            expect(screen.getByText('プロバイダーを変更中...')).toBeInTheDocument();
        });
        // API呼び出しが正しく行われることを確認
        expect(global.fetch).toHaveBeenCalledWith('/api/v1/payments/provider-settings', expect.objectContaining({
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ provider: 'square' })
        }));
    });
    it('決済方法追加モーダルが開閉できる', async () => {
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            expect(screen.getByText('追加')).toBeInTheDocument();
        });
        // モーダルを開く
        const addButton = screen.getByText('追加');
        fireEvent.click(addButton);
        await waitFor(() => {
            expect(screen.getByText('決済方法を追加')).toBeInTheDocument();
            expect(screen.getByText('デモ環境:')).toBeInTheDocument();
        });
        // モーダルを閉じる
        const closeButton = screen.getByText('閉じる');
        fireEvent.click(closeButton);
        await waitFor(() => {
            expect(screen.queryByText('決済方法を追加')).not.toBeInTheDocument();
        });
    });
    it('利用不可なプロバイダーはクリックできない', async () => {
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            expect(screen.getByText('PayPal')).toBeInTheDocument();
        });
        const paypalProvider = screen.getByText('PayPal').closest('div');
        // PayPalプロバイダーは無効化されている
        expect(paypalProvider).toHaveClass('opacity-50');
        expect(paypalProvider).toHaveClass('cursor-not-allowed');
    });
    it('セキュリティ情報が表示される', async () => {
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            expect(screen.getByText('セキュリティについて')).toBeInTheDocument();
            expect(screen.getByText(/業界標準のセキュリティで保護/)).toBeInTheDocument();
        });
    });
    it('API エラーハンドリング', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        // API エラーをシミュレート
        global.fetch.mockRejectedValue(new Error('API Error'));
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load payment data:', expect.any(Error));
        });
        consoleErrorSpy.mockRestore();
    });
    it('プロバイダー変更エラー時のアラート', async () => {
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
        global.fetch.mockImplementation((url, options) => {
            if (url.includes('payment-methods')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockPaymentMethods)
                });
            }
            if (url.includes('provider-settings')) {
                if (options?.method === 'PATCH') {
                    return Promise.resolve({
                        ok: false,
                        json: () => Promise.resolve({ error: 'Update failed' })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockProviderSettings)
                });
            }
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({})
            });
        });
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            expect(screen.getByText('Square')).toBeInTheDocument();
        });
        const squareProvider = screen.getByText('Square').closest('div');
        fireEvent.click(squareProvider);
        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('決済プロバイダーの変更に失敗しました');
        });
        alertSpy.mockRestore();
    });
    it('カードブランドアイコンが正しく表示される', async () => {
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            // カードブランドに応じたアイコンが表示される（ここではemoji）
            const cardElements = screen.getAllByText('💳');
            expect(cardElements.length).toBeGreaterThan(0);
        });
    });
    it('プロバイダーアイコンが正しく表示される', async () => {
        render(_jsx(PaymentMethodSettings, {}));
        await waitFor(() => {
            // 各プロバイダーのアイコンが表示される
            expect(screen.getByText('💙')).toBeInTheDocument(); // Stripe
            expect(screen.getByText('🟫')).toBeInTheDocument(); // Square
            expect(screen.getByText('🌐')).toBeInTheDocument(); // PayPal
            expect(screen.getByText('🇯🇵')).toBeInTheDocument(); // PAY.JP
        });
    });
});
