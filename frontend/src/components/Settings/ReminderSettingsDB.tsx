import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageCircle, Calendar, Clock, TestTube2, Settings, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { loadReminderSettings, saveReminderSettings } from '../../lib/settings-manager';
import { useAuth } from '../../contexts/AuthContext';

interface ReminderSettingsData {
  enableReminders: boolean;
  reminderTiming: number;
  reminderChannels: string[];
  reminderTemplate?: string;
  enableConfirmation: boolean;
  confirmationTiming: number;
  enableFollowUp: boolean;
  followUpTiming: number;
}

export const ReminderSettingsDB: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const [settings, setSettings] = useState<ReminderSettingsData>({
    enableReminders: true,
    reminderTiming: 24,
    reminderChannels: ['email'],
    reminderTemplate: '',
    enableConfirmation: true,
    confirmationTiming: 0,
    enableFollowUp: false,
    followUpTiming: 24
  });

  // データベースから設定を読み込み
  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const loadedSettings = await loadReminderSettings(user);
      
      if (loadedSettings) {
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.error('リマインダー設定の読み込みに失敗しました:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaveStatus('saving');
      const success = await saveReminderSettings(user, settings);
      
      if (success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('リマインダー設定の保存に失敗しました:', error);
      setSaveStatus('error');
    }
  };

  const toggleChannel = (channel: string) => {
    setSettings(prev => {
      const channels = prev.reminderChannels.includes(channel)
        ? prev.reminderChannels.filter(c => c !== channel)
        : [...prev.reminderChannels, channel];
      return { ...prev, reminderChannels: channels };
    });
  };

  const testReminder = () => {
    // テスト送信機能の実装
    alert('テストリマインダーを送信しました！');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">設定を読み込んでいます...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">リマインダー設定</h3>
          <p className="text-sm text-gray-600">予約確認やリマインダーの自動送信を設定します</p>
        </div>
        <div className="flex items-center space-x-2">
          {saveStatus === 'success' && (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">保存しました</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center space-x-1 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">エラーが発生しました</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Settings */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">基本設定</h3>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableReminders}
                onChange={(e) => setSettings(prev => ({ ...prev, enableReminders: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">リマインダーを有効にする</span>
            </label>
          </div>
        </div>

        {settings.enableReminders && (
          <div className="p-6 space-y-6">
            {/* 送信チャンネル */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">送信方法</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.reminderChannels.includes('email')}
                    onChange={() => toggleChannel('email')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Mail className="w-4 h-4 text-gray-500 ml-2 mr-1" />
                  <span className="text-sm text-gray-700">メール</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.reminderChannels.includes('sms')}
                    onChange={() => toggleChannel('sms')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <MessageCircle className="w-4 h-4 text-gray-500 ml-2 mr-1" />
                  <span className="text-sm text-gray-700">SMS</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.reminderChannels.includes('line')}
                    onChange={() => toggleChannel('line')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <MessageCircle className="w-4 h-4 text-green-500 ml-2 mr-1" />
                  <span className="text-sm text-gray-700">LINE</span>
                </label>
              </div>
            </div>

            {/* タイミング設定 */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">送信タイミング</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 予約確認 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={settings.enableConfirmation}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableConfirmation: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900">予約確認</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-2">予約後すぐに送信</p>
                  <select
                    value={settings.confirmationTiming}
                    onChange={(e) => setSettings(prev => ({ ...prev, confirmationTiming: parseInt(e.target.value) }))}
                    disabled={!settings.enableConfirmation}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="0">即時送信</option>
                    <option value="30">30分後</option>
                    <option value="60">1時間後</option>
                  </select>
                </div>

                {/* リマインダー */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">リマインダー</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-2">予約日の前に送信</p>
                  <select
                    value={settings.reminderTiming}
                    onChange={(e) => setSettings(prev => ({ ...prev, reminderTiming: parseInt(e.target.value) }))}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="12">12時間前</option>
                    <option value="24">1日前</option>
                    <option value="48">2日前</option>
                    <option value="72">3日前</option>
                    <option value="168">1週間前</option>
                  </select>
                </div>

                {/* フォローアップ */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={settings.enableFollowUp}
                      onChange={(e) => setSettings(prev => ({ ...prev, enableFollowUp: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900">フォローアップ</span>
                  </label>
                  <p className="text-xs text-gray-600 mb-2">来店後に送信</p>
                  <select
                    value={settings.followUpTiming}
                    onChange={(e) => setSettings(prev => ({ ...prev, followUpTiming: parseInt(e.target.value) }))}
                    disabled={!settings.enableFollowUp}
                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="24">1日後</option>
                    <option value="72">3日後</option>
                    <option value="168">1週間後</option>
                  </select>
                </div>
              </div>
            </div>

            {/* メッセージテンプレート */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">メッセージテンプレート</h4>
              <textarea
                value={settings.reminderTemplate}
                onChange={(e) => setSettings(prev => ({ ...prev, reminderTemplate: e.target.value }))}
                placeholder="[お客様名]様、[予約日時]のご予約をお待ちしております。"
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="mt-2 text-xs text-gray-600">
                使用可能な変数: [お客様名], [予約日時], [メニュー名], [担当者名], [店舗名]
              </p>
            </div>

            {/* アクションボタン */}
            <div className="flex justify-between pt-4">
              <button
                onClick={testReminder}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <TestTube2 className="w-4 h-4" />
                <span>テスト送信</span>
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={saveStatus === 'saving'}
                className="btn btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saveStatus === 'saving' ? '保存中...' : '設定を保存'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 送信履歴 */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">送信履歴</h3>
        </div>
        <div className="p-6">
          <p className="text-sm text-gray-600 text-center py-8">
            送信履歴はまだありません
          </p>
        </div>
      </div>
    </div>
  );
};