import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase-client';
import { useAuth } from '../../contexts/AuthContext';
import { getUnifiedTenantId } from '../../lib/tenant-utils';

export const HolidayDebugger: React.FC = () => {
  const { user } = useAuth();
  const [dbSettings, setDbSettings] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        const tid = await getUnifiedTenantId(user);
        setTenantId(tid);
        
        // データベースから直接読み込み
        const { data, error: dbError } = await supabase
          .from('holiday_settings')
          .select('*')
          .eq('tenantId', tid)
          .single();
        
        if (dbError) {
          setError(dbError.message);
        } else {
          setDbSettings(data);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    
    loadData();
  }, [user]);

  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
  
  // 現在の日付でテスト
  const testDates = [
    new Date('2025-08-04'), // 月曜日
    new Date('2025-08-07'), // 木曜日
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      background: '#fff',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      width: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
        🔍 休日設定デバッグ情報
      </h3>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Tenant ID:</strong> {tenantId}
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '8px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {dbSettings && (
        <>
          <div style={{ marginBottom: '8px' }}>
            <strong>DB weekly_closed_days:</strong> [{dbSettings.weekly_closed_days?.join(', ') || 'なし'}]
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>定休日:</strong> {
              dbSettings.weekly_closed_days?.map((d: number) => 
                `${d}(${dayNames[d] || '?'})`
              ).join(', ') || 'なし'
            }
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>テスト日付:</strong>
            {testDates.map(date => {
              const dayOfWeek = date.getDay();
              const isHoliday = dbSettings.weekly_closed_days?.includes(dayOfWeek);
              return (
                <div key={date.toString()} style={{ fontSize: '10px', marginLeft: '8px' }}>
                  {date.toISOString().split('T')[0]} ({dayNames[dayOfWeek]}曜日): {isHoliday ? '✅ 休日' : '❌ 平日'}
                </div>
              );
            })}
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <strong>Updated at:</strong> {dbSettings.updatedAt}
          </div>
          
          <details>
            <summary style={{ cursor: 'pointer' }}>Full DB Data</summary>
            <pre style={{ 
              fontSize: '10px', 
              overflow: 'auto',
              background: '#f3f4f6',
              padding: '8px',
              borderRadius: '4px',
              marginTop: '8px'
            }}>
              {JSON.stringify(dbSettings, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
};