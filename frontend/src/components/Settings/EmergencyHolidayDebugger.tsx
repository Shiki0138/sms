import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase-client';
import { useAuth } from '../../contexts/AuthContext';
import { getUnifiedTenantId } from '../../lib/tenant-utils';

export const EmergencyHolidayDebugger: React.FC = () => {
  const { user } = useAuth();
  const [debugData, setDebugData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const runEmergencyDiagnosis = async () => {
    setIsLoading(true);
    console.log('🚨 緊急診断開始...');
    
    try {
      const tenantId = await getUnifiedTenantId(user);
      
      // 1. 現在のユーザー・テナント情報
      console.log('👤 Current User:', user);
      console.log('🏢 Current TenantId:', tenantId);
      
      // 2. データベースの全設定を確認
      const { data: allSettings, error: allError } = await supabase
        .from('holiday_settings')
        .select('*');
      
      console.log('📊 All Holiday Settings in DB:', allSettings);
      console.log('❌ All Settings Error:', allError);
      
      // 3. 現在のテナントIDでの設定
      const { data: currentSettings, error: currentError } = await supabase
        .from('holiday_settings')
        .select('*')
        .eq('tenantId', tenantId);
      
      console.log('🎯 Current Tenant Settings:', currentSettings);
      console.log('❌ Current Settings Error:', currentError);
      
      // 4. settings-manager経由での読み込みテスト
      try {
        const { loadHolidaySettings } = await import('../../lib/settings-manager');
        const managerSettings = await loadHolidaySettings(user);
        console.log('⚙️ Settings Manager Result:', managerSettings);
      } catch (managerError) {
        console.error('❌ Settings Manager Error:', managerError);
      }
      
      // 5. Supabase認証状態
      const { data: session } = await supabase.auth.getSession();
      console.log('🔐 Supabase Session:', session);
      
      // 6. テーブル構造確認
      const { data: tableInfo, error: tableError } = await supabase
        .from('holiday_settings')
        .select('*')
        .limit(1);
        
      console.log('🗂️ Table Structure Sample:', tableInfo);
      console.log('❌ Table Error:', tableError);
      
      setDebugData({
        user,
        tenantId,
        allSettings,
        allError,
        currentSettings,
        currentError,
        session: session.session,
        tableInfo,
        tableError,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('🚨 Emergency diagnosis failed:', error);
      setDebugData({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // 緊急修正: データベースに強制保存
  const emergencyForceSave = async (weeklyClosedDays: number[]) => {
    try {
      const tenantId = await getUnifiedTenantId(user);
      console.log('💾 緊急強制保存開始...', { tenantId, weeklyClosedDays });
      
      // 既存レコードを削除
      await supabase
        .from('holiday_settings')
        .delete()
        .eq('tenantId', tenantId);
      
      // 新規挿入
      const { data, error } = await supabase
        .from('holiday_settings')
        .insert({
          tenantId,
          weekly_closed_days: weeklyClosedDays,
          nth_weekday_rules: [],
          specific_holidays: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('❌ 緊急保存エラー:', error);
        alert('緊急保存に失敗: ' + error.message);
      } else {
        console.log('✅ 緊急保存成功:', data);
        alert('✅ 緊急保存完了！ページをリロードしてください。');
        await runEmergencyDiagnosis(); // 再診断
      }
    } catch (error) {
      console.error('🚨 Emergency save failed:', error);
      alert('緊急保存中にエラー: ' + error);
    }
  };

  useEffect(() => {
    if (user) {
      runEmergencyDiagnosis();
    }
  }, [user]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '600px',
      maxHeight: '80vh',
      overflow: 'auto',
      background: '#fff',
      border: '3px solid #dc2626',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      zIndex: 99999,
      fontSize: '12px'
    }}>
      <h2 style={{ color: '#dc2626', marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
        🚨 緊急休日設定診断システム
      </h2>
      
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={runEmergencyDiagnosis}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            marginRight: '8px'
          }}
        >
          {isLoading ? '診断中...' : '🔍 再診断'}
        </button>
        
        <button 
          onClick={() => emergencyForceSave([1])} // 月曜日
          style={{
            padding: '8px 16px',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          💾 月曜日で強制保存
        </button>
        
        <button 
          onClick={() => emergencyForceSave([0,1,2,3,4,5,6])} // 全曜日
          style={{
            padding: '8px 16px',
            background: '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          💾 全曜日で強制保存
        </button>
      </div>

      {debugData.error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
          <strong style={{ color: '#dc2626' }}>エラー:</strong> {debugData.error}
        </div>
      )}

      {debugData.tenantId && (
        <>
          <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
            <strong>テナントID:</strong> {debugData.tenantId}<br/>
            <strong>ユーザーID:</strong> {debugData.user?.id}<br/>
            <strong>Email:</strong> {debugData.user?.email}
          </div>

          <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
            <strong>現在のテナント設定:</strong><br/>
            {debugData.currentSettings?.length > 0 ? (
              debugData.currentSettings.map((setting: any, i: number) => (
                <div key={i} style={{ marginLeft: '8px', marginTop: '4px' }}>
                  定休日: [{setting.weekly_closed_days?.join(', ') || 'なし'}]<br/>
                  更新日時: {setting.updatedAt}
                </div>
              ))
            ) : (
              <span style={{ color: '#dc2626' }}>設定が見つかりません！</span>
            )}
          </div>

          <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '6px', marginBottom: '12px' }}>
            <strong>全データベース設定:</strong><br/>
            {debugData.allSettings?.map((setting: any, i: number) => (
              <div key={i} style={{ marginLeft: '8px', marginTop: '4px', fontSize: '10px' }}>
                TenantID: {setting.tenantId}<br/>
                定休日: [{setting.weekly_closed_days?.join(', ') || 'なし'}]<br/>
                更新: {setting.updatedAt}<br/>
                ---
              </div>
            )) || <span style={{ color: '#dc2626' }}>データベースにデータがありません！</span>}
          </div>

          {debugData.currentError && (
            <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '6px', color: '#dc2626' }}>
              <strong>データベースエラー:</strong> {debugData.currentError.message}
            </div>
          )}
        </>
      )}
    </div>
  );
};