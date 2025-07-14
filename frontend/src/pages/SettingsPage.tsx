import React, { useState } from 'react';
import { Settings, Clock, Bell, Shield, CreditCard, Database, Users, Calendar } from 'lucide-react';
import EnhancedBusinessHoursSettings from '@/components/Settings/EnhancedBusinessHoursSettings';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('business-hours');

  const tabs = [
    { id: 'business-hours', label: '営業時間・休日', icon: Clock },
    { id: 'notifications', label: '通知設定', icon: Bell },
    { id: 'security', label: 'セキュリティ', icon: Shield },
    { id: 'billing', label: '請求・支払い', icon: CreditCard },
    { id: 'data', label: 'データ管理', icon: Database },
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

          <div className="bg-white shadow rounded-lg">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm
                        flex items-center justify-center space-x-2
                        ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'business-hours' && <EnhancedBusinessHoursSettings />}
              {activeTab === 'notifications' && (
                <div className="text-center py-12 text-gray-500">
                  通知設定機能は準備中です
                </div>
              )}
              {activeTab === 'security' && (
                <div className="text-center py-12 text-gray-500">
                  セキュリティ設定機能は準備中です
                </div>
              )}
              {activeTab === 'billing' && (
                <div className="text-center py-12 text-gray-500">
                  請求・支払い設定機能は準備中です
                </div>
              )}
              {activeTab === 'data' && (
                <div className="text-center py-12 text-gray-500">
                  データ管理機能は準備中です
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
  );
};

export default SettingsPage;