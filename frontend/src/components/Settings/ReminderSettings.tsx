import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageCircle, Calendar, Clock, TestTube2, Settings, Save } from 'lucide-react';

interface ReminderSettings {
  emailEnabled: boolean;
  lineEnabled: boolean;
  weekBeforeEnabled: boolean;
  threeDaysBeforeEnabled: boolean;
  followUpEnabled: boolean;
  emailTemplates: {
    weekBefore: string;
    threeDays: string;
    followUp: string;
  };
}

interface Card {
  children: React.ReactNode;
  className?: string;
}

interface CardHeader {
  children: React.ReactNode;
}

interface CardContent {
  children: React.ReactNode;
  className?: string;
}

interface Switch {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

interface Button {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}

// カード コンポーネント
const Card: React.FC<Card> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardHeader> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardContent: React.FC<CardContent> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

// スイッチ コンポーネント
const Switch: React.FC<Switch> = ({ checked, onChange, className = '' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`
      relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
      transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
      ${checked ? 'bg-indigo-600' : 'bg-gray-200'}
      ${className}
    `}
  >
    <span
      className={`
        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
        transition duration-200 ease-in-out
        ${checked ? 'translate-x-5' : 'translate-x-0'}
      `}
    />
  </button>
);

// ボタン コンポーネント
const Button: React.FC<Button> = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  loading = false, 
  disabled = false 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizeClasses = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export const ReminderSettings: React.FC = () => {
  const [settings, setSettings] = useState<ReminderSettings>({
    emailEnabled: true,
    lineEnabled: true,
    weekBeforeEnabled: true,
    threeDaysBeforeEnabled: true,
    followUpEnabled: true,
    emailTemplates: {
      weekBefore: '{customerName}様、{reservationDate}のご予約確認です。1週間前のリマインドをお送りします。',
      threeDays: '{customerName}様、{reservationDate}のご予約まで3日となりました。お待ちしております。',
      followUp: '{customerName}様、いつもありがとうございます。お元気でしょうか？特別なご提案をお送りします。'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchReminderSettings();
  }, []);

  const fetchReminderSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/settings/reminders');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch reminder settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaveLoading(true);
    try {
      const response = await fetch('/api/v1/settings/reminders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        alert('リマインド設定を保存しました');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save reminder settings:', error);
      alert('保存に失敗しました');
    } finally {
      setSaveLoading(false);
    }
  };

  const testReminder = async (type: string) => {
    try {
      const response = await fetch(`/api/v1/reminders/test/${type}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('テストメールを送信しました');
      } else {
        throw new Error('Failed to send test reminder');
      }
    } catch (error) {
      console.error('Failed to send test reminder:', error);
      alert('テスト送信に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Bell className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">自動リマインド設定</h1>
          <p className="text-gray-600">予約のリマインドとフォローアップメッセージを自動送信します</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">基本設定</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            メール・LINEでの自動リマインド機能を設定します
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基本設定 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <label className="text-sm font-medium text-gray-900">メールリマインド</label>
                  <p className="text-xs text-gray-500">メールでの自動送信</p>
                </div>
              </div>
              <Switch
                checked={settings.emailEnabled}
                onChange={(checked) => 
                  setSettings(prev => ({ ...prev, emailEnabled: checked }))
                }
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-green-600" />
                <div>
                  <label className="text-sm font-medium text-gray-900">LINEリマインド</label>
                  <p className="text-xs text-gray-500">LINEでの自動送信</p>
                </div>
              </div>
              <Switch
                checked={settings.lineEnabled}
                onChange={(checked) => 
                  setSettings(prev => ({ ...prev, lineEnabled: checked }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">送信タイミング設定</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            いつリマインドメッセージを送信するかを設定します
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* 1週間前リマインド */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <label className="text-sm font-medium text-gray-900">1週間前リマインド</label>
                  <p className="text-xs text-gray-500">予約日の7日前に自動送信</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={settings.weekBeforeEnabled}
                  onChange={(checked) => 
                    setSettings(prev => ({ ...prev, weekBeforeEnabled: checked }))
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testReminder('week')}
                  className="flex items-center space-x-1"
                >
                  <TestTube2 className="h-3 w-3" />
                  <span>テスト送信</span>
                </Button>
              </div>
            </div>

            {/* 3日前リマインド */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-orange-600" />
                <div>
                  <label className="text-sm font-medium text-gray-900">3日前リマインド</label>
                  <p className="text-xs text-gray-500">予約日の3日前に自動送信</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={settings.threeDaysBeforeEnabled}
                  onChange={(checked) => 
                    setSettings(prev => ({ ...prev, threeDaysBeforeEnabled: checked }))
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testReminder('3days')}
                  className="flex items-center space-x-1"
                >
                  <TestTube2 className="h-3 w-3" />
                  <span>テスト送信</span>
                </Button>
              </div>
            </div>

            {/* フォローアップメッセージ */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-indigo-600" />
                <div>
                  <label className="text-sm font-medium text-gray-900">フォローアップメッセージ</label>
                  <p className="text-xs text-gray-500">長期未来店のお客様への案内</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Switch
                  checked={settings.followUpEnabled}
                  onChange={(checked) => 
                    setSettings(prev => ({ ...prev, followUpEnabled: checked }))
                  }
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testReminder('followup')}
                  className="flex items-center space-x-1"
                >
                  <TestTube2 className="h-3 w-3" />
                  <span>テスト送信</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold">メッセージテンプレート</h3>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            自動送信されるメッセージの内容を編集できます
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                1週間前メッセージ
              </label>
              <textarea
                value={settings.emailTemplates?.weekBefore || ''}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    emailTemplates: { ...prev.emailTemplates, weekBefore: e.target.value }
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="1週間前のリマインドメッセージ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                3日前メッセージ
              </label>
              <textarea
                value={settings.emailTemplates?.threeDays || ''}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    emailTemplates: { ...prev.emailTemplates, threeDays: e.target.value }
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="3日前のリマインドメッセージ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                フォローアップメッセージ
              </label>
              <textarea
                value={settings.emailTemplates?.followUp || ''}
                onChange={(e) => 
                  setSettings(prev => ({
                    ...prev,
                    emailTemplates: { ...prev.emailTemplates, followUp: e.target.value }
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="フォローアップメッセージ"
              />
            </div>

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">利用可能な変数:</p>
              <ul className="space-y-1">
                <li><code>{'{customerName}'}</code> - お客様のお名前</li>
                <li><code>{'{reservationDate}'}</code> - 予約日</li>
                <li><code>{'{reservationTime}'}</code> - 予約時間</li>
                <li><code>{'{menuContent}'}</code> - 予約メニュー</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 保存ボタン */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={saveSettings}
          loading={saveLoading}
          className="flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>設定を保存</span>
        </Button>
      </div>
    </div>
  );
};