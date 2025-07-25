import React, { useState } from 'react';
import { Settings, Clock, Bell, Shield, CreditCard, Database, Users, Calendar, Globe, MessageSquare, Instagram, Smartphone, Package, Brain, Save, Menu } from 'lucide-react';
import ExternalAPISettings from '../components/Settings/ExternalAPISettings';
import AdvancedHolidaySettings from '../components/Settings/AdvancedHolidaySettings';
import HolidaySettingsDebug from '../components/Settings/HolidaySettingsDebug';
import PaymentMethodSettingsDB from '../components/Settings/PaymentMethodSettingsDB';
import { ReminderSettingsDB } from '../components/Settings/ReminderSettingsDB';
import SubscriptionManagement from '../components/Settings/SubscriptionManagement';
import MenuManagementDB from '../components/Settings/MenuManagementDB';
import DataBackupSettings from '../components/Settings/DataBackupSettings';
import OpenAISettings from '../components/Settings/OpenAISettings';
import NotificationSettings from '../components/Settings/NotificationSettings';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('business-hours');

  const tabs = [
    { id: 'business-hours', label: '営業時間・休日', icon: Clock },
    { id: 'menu-management', label: 'メニュー管理', icon: Menu },
    { id: 'api-settings', label: '外部API連携', icon: Globe },
    { id: 'line-settings', label: 'LINE設定', icon: MessageSquare },
    { id: 'instagram-settings', label: 'Instagram設定', icon: Instagram },
    { id: 'google-settings', label: 'Google連携', icon: Calendar },
    { id: 'notifications', label: '通知設定', icon: Bell },
    { id: 'reminder-settings', label: 'リマインダー設定', icon: Clock },
    { id: 'ai-settings', label: 'AI設定', icon: Brain },
    { id: 'payment-methods', label: '決済方法', icon: CreditCard },
    { id: 'subscription', label: 'プラン管理', icon: Package },
    { id: 'data-backup', label: 'データバックアップ', icon: Save },
    { id: 'security', label: 'セキュリティ', icon: Shield },
    { id: 'staff', label: 'スタッフ管理', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Settings className="mr-3" />
            設定
          </h1>

          <div className="flex gap-6">
            {/* サイドバーナビゲーション */}
            <div className="w-64 bg-white shadow rounded-lg">
              <nav className="space-y-1 p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full py-3 px-4 text-left rounded-lg font-medium text-sm
                        flex items-center space-x-3 transition-colors
                        ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* コンテンツエリア */}
            <div className="flex-1 bg-white shadow rounded-lg">
              <div className="p-6">
              {activeTab === 'business-hours' && (
                <div className="space-y-6">
                  <HolidaySettingsDebug />
                  <AdvancedHolidaySettings />
                </div>
              )}
              {activeTab === 'api-settings' && (
                <ExternalAPISettings />
              )}
              {activeTab === 'line-settings' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">LINE設定</h2>
                  <ExternalAPISettings defaultTab="line" />
                </div>
              )}
              {activeTab === 'instagram-settings' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Instagram設定</h2>
                  <ExternalAPISettings defaultTab="instagram" />
                </div>
              )}
              {activeTab === 'google-settings' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Google連携設定</h2>
                  <ExternalAPISettings defaultTab="google" />
                </div>
              )}
              {activeTab === 'menu-management' && (
                <MenuManagementDB />
              )}
              {activeTab === 'notifications' && (
                <NotificationSettings />
              )}
              {activeTab === 'reminder-settings' && (
                <ReminderSettingsDB />
              )}
              {activeTab === 'ai-settings' && (
                <OpenAISettings />
              )}
              {activeTab === 'payment-methods' && (
                <PaymentMethodSettingsDB />
              )}
              {activeTab === 'subscription' && (
                <SubscriptionManagement />
              )}
              {activeTab === 'data-backup' && (
                <DataBackupSettings />
              )}
              {activeTab === 'security' && (
                <div className="text-center py-12 text-gray-500">
                  セキュリティ設定機能は準備中です
                </div>
              )}
              {activeTab === 'staff' && (
                <div className="text-center py-12 text-gray-500">
                  スタッフ管理機能は準備中です
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;