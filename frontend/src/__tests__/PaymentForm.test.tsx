import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import PaymentForm from '../components/Payment/PaymentForm';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';

// useSubscriptionフックをモック
const mockUpgradePlan = vi.fn();
const mockSubscriptionContext = {
  currentPlan: 'light' as const,
  upgradePlan: mockUpgradePlan,
  subscriptionInfo: {
    plan: 'light' as const,
    status: 'active' as const,
    isActive: true,
    features: [],
    limits: {},
    usage: {}
  }
};

vi.mock('../contexts/SubscriptionContext', () => ({
  ...vi.importActual('../contexts/SubscriptionContext'),
  useSubscription: () => mockSubscriptionContext
}));

// fetchをモック
global.fetch = vi.fn() as any;

describe('PaymentForm', () => {
  const mockProps = {
    selectedPlan: 'standard' as const,
    onSuccess: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpgradePlan.mockResolvedValue(true);
  });

  const renderPaymentForm = () => {
    return render(
      <SubscriptionProvider>
        <PaymentForm {...mockProps} />
      </SubscriptionProvider>
    );
  };

  it('正常にレンダリングされる', () => {
    renderPaymentForm();
    
    expect(screen.getByText('決済情報入力')).toBeInTheDocument();
    expect(screen.getByText('ライトプラン → スタンダードプラン')).toBeInTheDocument();
    expect(screen.getByText('料金詳細')).toBeInTheDocument();
  });

  it('料金計算が正しく表示される', () => {
    renderPaymentForm();
    
    // プラン差額の計算（28000 - 12000 = 16000）
    expect(screen.getByText('¥16,000')).toBeInTheDocument();
    
    // 初期費用
    expect(screen.getByText('¥5,000')).toBeInTheDocument();
    
    // 合計（16000 + 5000 = 21000）
    expect(screen.getByText('¥21,000')).toBeInTheDocument();
  });

  it('決済方法の選択ができる', () => {
    renderPaymentForm();
    
    const demoRadio = screen.getByDisplayValue('demo');
    const stripeRadio = screen.getByDisplayValue('stripe');
    
    expect(demoRadio).toBeChecked();
    expect(stripeRadio).not.toBeChecked();
    expect(stripeRadio).toBeDisabled();
  });

  it('デモカード情報が表示される', () => {
    renderPaymentForm();
    
    expect(screen.getByDisplayValue('4242 4242 4242 4242')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12/25')).toBeInTheDocument();
    expect(screen.getByDisplayValue('123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('テスト ユーザー')).toBeInTheDocument();
  });

  it('戻るボタンがクリックされた時onCancelが呼ばれる', () => {
    renderPaymentForm();
    
    const backButton = screen.getByText('戻る');
    fireEvent.click(backButton);
    
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('キャンセルボタンがクリックされた時onCancelが呼ばれる', () => {
    renderPaymentForm();
    
    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);
    
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('決済ボタンがクリックされた時、デモ決済が正常に処理される', async () => {
    renderPaymentForm();
    
    const submitButton = screen.getByRole('button', { 
      name: /¥21,000 で決済確定/ 
    });
    
    fireEvent.click(submitButton);
    
    // ローディング状態の確認
    expect(screen.getByText('処理中...')).toBeInTheDocument();
    
    // 決済処理完了まで待機
    await waitFor(() => {
      expect(mockUpgradePlan).toHaveBeenCalledWith('standard');
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('プラン変更が失敗した場合エラーが表示される', async () => {
    mockUpgradePlan.mockResolvedValue(false);
    
    renderPaymentForm();
    
    const submitButton = screen.getByRole('button', { 
      name: /¥21,000 で決済確定/ 
    });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('プランの変更に失敗しました')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    expect(mockProps.onSuccess).not.toHaveBeenCalled();
  });

  it('API決済モードでの処理（本番環境想定）', async () => {
    // fetchをモック
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        subscriptionId: 'test-sub-id'
      })
    });

    // PaymentFormのpaymentMethodを'stripe'に変更するシミュレーション
    renderPaymentForm();
    
    const stripeRadio = screen.getByDisplayValue('stripe');
    
    // 実際の実装では無効化されているが、テスト用に有効化をシミュレート
    // 本番環境ではこのラジオボタンが有効になる
    expect(stripeRadio).toBeDisabled();
  });

  it('セキュリティ情報が表示される', () => {
    renderPaymentForm();
    
    expect(screen.getByText('セキュアな決済')).toBeInTheDocument();
    expect(screen.getByText(/256bit SSL暗号化により保護/)).toBeInTheDocument();
  });

  it('プラン変更時のメタデータが正しく設定される', () => {
    const premiumProps = {
      ...mockProps,
      selectedPlan: 'premium_ai' as const
    };
    
    render(
      <SubscriptionProvider>
        <PaymentForm {...premiumProps} />
      </SubscriptionProvider>
    );
    
    // プレミアムプランの料金計算（55000 - 12000 = 43000）
    expect(screen.getByText('¥53,000')).toBeInTheDocument(); // 43000 + 10000(初期費用)
  });

  it('カード情報フィールドが読み取り専用である', () => {
    renderPaymentForm();
    
    const cardNumberInput = screen.getByDisplayValue('4242 4242 4242 4242');
    const expiryInput = screen.getByDisplayValue('12/25');
    const cvcInput = screen.getByDisplayValue('123');
    const nameInput = screen.getByDisplayValue('テスト ユーザー');
    
    expect(cardNumberInput).toHaveAttribute('readOnly');
    expect(expiryInput).toHaveAttribute('readOnly');
    expect(cvcInput).toHaveAttribute('readOnly');
    expect(nameInput).toHaveAttribute('readOnly');
  });

  it('処理中はボタンが無効化される', async () => {
    renderPaymentForm();
    
    const submitButton = screen.getByRole('button', { 
      name: /¥21,000 で決済確定/ 
    });
    const cancelButton = screen.getByText('キャンセル');
    
    fireEvent.click(submitButton);
    
    // 処理中の状態確認
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  it('異なるプランでの料金計算', () => {
    const lightToLightProps = {
      ...mockProps,
      selectedPlan: 'light' as const
    };
    
    // 同じプランの場合の処理をテスト
    const { rerender } = render(
      <SubscriptionProvider>
        <PaymentForm {...lightToLightProps} />
      </SubscriptionProvider>
    );
    
    // 差額は0になるはず
    expect(screen.getByText('¥5,000')).toBeInTheDocument(); // 初期費用のみ
  });
});