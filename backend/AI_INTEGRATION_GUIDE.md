# 🤖 AI機能統合ガイド - Team A向け

## 📋 概要

Team Bが実装したAI駆動の新機能をフロントエンドに統合するための完全ガイドです。

### 🎯 実装済みAI機能
1. **お問い合わせフォーム自動応答システム**
2. **経営戦略分析・提案システム**

---

## 🏗️ アーキテクチャ概要

```
Frontend (Team A) ←→ Backend API ←→ AI Services (OpenAI GPT-4)
                                   ↓
                               Database (Prisma)
```

### AI サービス構成
- **OpenAI GPT-4**: 自然言語処理・分析
- **Contact Form Service**: 問い合わせ自動応答
- **Business Strategy Service**: 経営分析・戦略提案

---

## 🔧 環境設定要件

### 必要な環境変数
```env
# OpenAI API設定 (必須)
OPENAI_API_KEY=sk-xxx...

# メール送信設定 (問い合わせ機能用)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# 緊急時通知設定
EMERGENCY_SUPPORT_EMAIL=emergency@salon-system.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/xxx (オプション)
```

---

## 📡 API エンドポイント一覧

### 1. お問い合わせフォーム API

#### POST `/api/contact/submit` (パブリック)
```typescript
// リクエスト
interface ContactFormRequest {
  name: string;                    // 名前 (必須)
  email: string;                   // メールアドレス (必須)
  company?: string;                // 会社名 (オプション)
  category: 'technical' | 'billing' | 'feature' | 'emergency' | 'general';
  subject: string;                 // 件名 (必須, max: 200文字)
  message: string;                 // メッセージ (必須, min: 10文字, max: 2000文字)
  urgency: 'low' | 'medium' | 'high' | 'critical';
  tenantId?: string;               // テナントID (ログイン時のみ)
  userId?: string;                 // ユーザーID (ログイン時のみ)
}

// レスポンス
interface ContactFormResponse {
  success: true;
  data: {
    inquiryId: string;             // 問い合わせID
    estimatedResponseTime: string; // 予想応答時間 
    autoResponse: {                // AI自動応答
      message: string;             // AI応答メッセージ
      confidence: number;          // 信頼度 (0-1)
      needsHumanReview: boolean;   // 人間レビュー要否
      relatedDocuments: string[];  // 関連ドキュメント
    } | null;
  };
  message: string;
}
```

#### GET `/api/contact/inquiries` (管理者専用)
```typescript
// クエリパラメータ
interface InquiryListQuery {
  page?: number;        // ページ番号 (デフォルト: 1)
  limit?: number;       // 件数 (デフォルト: 20)
  status?: string;      // ステータスフィルタ
  category?: string;    // カテゴリフィルタ
  urgency?: string;     // 緊急度フィルタ
}

// レスポンス
interface InquiryListResponse {
  success: true;
  data: ContactInquiry[];
  pagination: {
    current: number;
    total: number;
    totalCount: number;
  };
}
```

#### GET `/api/contact/statistics` (管理者専用)
```typescript
// クエリパラメータ
interface ContactStatsQuery {
  period?: string;  // 日数 (デフォルト: 30)
}

// レスポンス - 問い合わせ統計
interface ContactStatsResponse {
  success: true;
  data: {
    period: number;
    totalInquiries: number;
    resolvedInquiries: number;
    resolutionRate: number;
    avgResponseTime: number;
    categoryBreakdown: Record<string, number>;
    urgencyBreakdown: Record<string, number>;
  };
}
```

### 2. 経営戦略分析 API

#### POST `/api/business-strategy/analysis/comprehensive` (分析権限必要)
```typescript
// リクエスト
interface BusinessAnalysisRequest {
  startDate: string;               // 開始日 (ISO string)
  endDate: string;                 // 終了日 (ISO string)
  analysisType?: 'comprehensive' | 'revenue' | 'customer' | 'operations' | 'marketing';
  includeForecasting?: boolean;    // 予測含む (デフォルト: true)
  includeRecommendations?: boolean; // 推奨含む (デフォルト: true)
}

// レスポンス
interface BusinessAnalysisResponse {
  success: true;
  data: {
    metrics: BusinessMetrics;
    recommendations: StrategicRecommendation[];
    insights: string[];
    competitiveAnalysis: CompetitiveAnalysis;
    generatedAt: string;
    period: {
      startDate: Date;
      endDate: Date;
    };
  };
  message: string;
}
```

#### GET `/api/business-strategy/dashboard/real-time` (分析権限必要)
```typescript
// レスポンス - リアルタイムダッシュボード
interface RealTimeDashboardResponse {
  success: true;
  data: {
    today: {
      revenue: number;      // 本日の売上
      bookings: number;     // 本日の予約数
      dailyGrowth: number;  // 前日比成長率
    };
    monthly: {
      revenue: number;      // 月間売上
      activeCustomers: number; // アクティブ顧客数
    };
    pending: {
      bookings: number;     // 未確定予約数
    };
    lastUpdated: string;
  };
}
```

#### GET `/api/business-strategy/analysis/customer-segments` (分析権限必要)
```typescript
// クエリパラメータ
interface CustomerSegmentQuery {
  startDate: string;    // 開始日
  endDate: string;      // 終了日
}

// レスポンス - 顧客セグメント分析
interface CustomerSegmentResponse {
  success: true;
  data: {
    segments: RFMSegment[];
    totalCustomers: number;
    analysis: string;
  };
  message: string;
}
```

---

## 🎨 フロントエンド実装例

### 1. お問い合わせフォームコンポーネント

```tsx
import React, { useState } from 'react';

interface ContactFormProps {
  tenantId?: string;
  userId?: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ tenantId, userId }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    category: 'general' as const,
    subject: '',
    message: '',
    urgency: 'medium' as const
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tenantId,
          userId
        })
      });
      
      const result = await res.json();
      
      if (result.success) {
        setResponse(result);
        // フォームリセット
        setFormData({
          name: '', email: '', company: '', 
          category: 'general', subject: '', message: '', urgency: 'medium'
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form">
      {response ? (
        <div className="success-message">
          <h3>お問い合わせを受け付けました</h3>
          <p>問い合わせ番号: {response.data.inquiryId}</p>
          <p>予想応答時間: {response.data.estimatedResponseTime}</p>
          
          {response.data.autoResponse && (
            <div className="ai-response">
              <h4>🤖 自動応答</h4>
              <p>{response.data.autoResponse.message}</p>
              <small>信頼度: {Math.round(response.data.autoResponse.confidence * 100)}%</small>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* フォームフィールド実装 */}
          <input
            type="text"
            placeholder="お名前"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          
          <input
            type="email"
            placeholder="メールアドレス"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value as any})}
          >
            <option value="general">一般的な質問</option>
            <option value="technical">技術的な問題</option>
            <option value="billing">請求に関する問題</option>
            <option value="feature">機能要望</option>
            <option value="emergency">緊急の問題</option>
          </select>
          
          <input
            type="text"
            placeholder="件名"
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
            required
          />
          
          <textarea
            placeholder="詳細なメッセージをご記入ください（10文字以上）"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            rows={5}
            minLength={10}
            maxLength={2000}
            required
          />
          
          <select
            value={formData.urgency}
            onChange={(e) => setFormData({...formData, urgency: e.target.value as any})}
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
            <option value="critical">緊急</option>
          </select>
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '送信中...' : '送信'}
          </button>
        </form>
      )}
    </div>
  );
};
```

### 2. 経営戦略ダッシュボードコンポーネント

```tsx
import React, { useEffect, useState } from 'react';

export const BusinessStrategyDashboard: React.FC = () => {
  const [realTimeData, setRealTimeData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // リアルタイムデータ取得
  useEffect(() => {
    const fetchRealTimeData = async () => {
      try {
        const res = await fetch('/api/business-strategy/dashboard/real-time', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const result = await res.json();
        if (result.success) {
          setRealTimeData(result.data);
        }
      } catch (error) {
        console.error('Real-time data fetch error:', error);
      }
    };

    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 300000); // 5分ごと更新
    return () => clearInterval(interval);
  }, []);

  // 包括的分析データ取得
  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // 1ヶ月前

      const res = await fetch('/api/business-strategy/analysis/comprehensive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          analysisType: 'comprehensive'
        })
      });

      const result = await res.json();
      if (result.success) {
        setAnalysisData(result.data);
      }
    } catch (error) {
      console.error('Analysis generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="business-strategy-dashboard">
      <h1>📊 経営戦略ダッシュボード</h1>
      
      {/* リアルタイム指標 */}
      {realTimeData && (
        <div className="real-time-metrics">
          <h2>📈 リアルタイム業績</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>本日の売上</h3>
              <p className="metric-value">¥{realTimeData.today.revenue.toLocaleString()}</p>
              <p className="metric-growth">
                前日比: {realTimeData.today.dailyGrowth > 0 ? '+' : ''}{realTimeData.today.dailyGrowth}%
              </p>
            </div>
            
            <div className="metric-card">
              <h3>本日の予約</h3>
              <p className="metric-value">{realTimeData.today.bookings}件</p>
            </div>
            
            <div className="metric-card">
              <h3>月間売上</h3>
              <p className="metric-value">¥{realTimeData.monthly.revenue.toLocaleString()}</p>
            </div>
            
            <div className="metric-card">
              <h3>アクティブ顧客</h3>
              <p className="metric-value">{realTimeData.monthly.activeCustomers}人</p>
            </div>
          </div>
        </div>
      )}
      
      {/* AI分析セクション */}
      <div className="analysis-section">
        <div className="section-header">
          <h2>🤖 AI戦略分析</h2>
          <button onClick={generateAnalysis} disabled={loading}>
            {loading ? 'AI分析中...' : '分析実行'}
          </button>
        </div>
        
        {analysisData && (
          <div className="analysis-results">
            {/* 重要インサイト */}
            <div className="insights">
              <h3>💡 重要インサイト</h3>
              {analysisData.insights.map((insight: string, index: number) => (
                <div key={index} className="insight-item">
                  {insight}
                </div>
              ))}
            </div>
            
            {/* AI戦略提案 */}
            <div className="recommendations">
              <h3>🎯 AI戦略提案</h3>
              {analysisData.recommendations.map((rec: any, index: number) => (
                <div key={index} className={`recommendation priority-${rec.priority}`}>
                  <h4>{rec.title}</h4>
                  <p>{rec.description}</p>
                  <div className="rec-details">
                    <span className="expected-impact">期待効果: {rec.expectedImpact}</span>
                    <span className="timeframe">期間: {rec.timeframe}</span>
                  </div>
                  <div className="action-items">
                    <h5>アクション項目:</h5>
                    <ul>
                      {rec.actionItems.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🔐 認証・権限設定

### 必要な権限
```typescript
// 権限定義 (src/utils/auth.ts)
export const PERMISSIONS = {
  // お問い合わせ管理
  ADMIN: 'admin',                    // 問い合わせ閲覧・回答
  SUPER_ADMIN: 'super_admin',        // AI設定変更
  
  // 経営分析
  ANALYTICS: 'analytics',            // 分析閲覧・実行
  MANAGER: 'manager',                // KPI設定・目標管理
};
```

### 認証ヘッダー例
```typescript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

---

## 🚀 デプロイ・統合チェックリスト

### 1. 環境設定確認
- [ ] `OPENAI_API_KEY` 設定済み
- [ ] メール送信設定済み
- [ ] 権限システム設定済み

### 2. フロントエンド統合
- [ ] お問い合わせフォームコンポーネント実装
- [ ] 経営戦略ダッシュボード実装
- [ ] エラーハンドリング実装
- [ ] ローディング状態管理

### 3. UX最適化
- [ ] レスポンシブデザイン対応
- [ ] アクセシビリティ対応
- [ ] 多言語対応 (必要に応じて)

### 4. テスト
- [ ] API統合テスト
- [ ] フォーム送信テスト
- [ ] AI応答品質テスト
- [ ] 権限制御テスト

---

## 📞 技術サポート

### Team B連絡先
- **技術的質問**: backend-team@salon-system.com
- **緊急問題**: 24/7サポート対応

### 実装支援
- API仕様詳細説明
- フロントエンド統合支援
- カスタマイズ対応

---

**🎉 このガイドでTeam AはAI機能を完全に統合できます！**

*最終更新: 2024年12月17日*  
*Team B - Backend Development Team*