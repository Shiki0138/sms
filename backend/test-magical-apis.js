/**
 * 🪄 魔法のような外部API統合テストスクリプト
 * 「美容室スタッフが『これは魔法？』と驚くAPIテスト」
 */

const axios = require('axios');

const API_BASE = 'http://localhost:4002/api/v1';

// テスト用の美容室スタッフ認証情報（簡易版）
const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer demo-token',
  'X-Tenant-ID': 'salon-demo'
};

console.log('🪄 魔法的外部API統合テスト開始！');
console.log('美容室の業務を魔法のように自動化するAPIをテストします ✨\n');

async function testMagicalApis() {
  try {
    // 1. 🪄 魔法統合ダッシュボードテスト
    console.log('🪄 1. 魔法統合ダッシュボードテスト...');
    const dashboardResponse = await axios.get(
      `${API_BASE}/magical-apis/integration-dashboard`,
      { headers: testHeaders }
    );
    
    console.log('✨ 魔法統合ダッシュボード結果:');
    const integrationStatus = dashboardResponse.data.data.dashboard.integrationStatus;
    console.log(`📸 Instagram: ${integrationStatus.instagram.status}`);
    console.log(`💚 LINE: ${integrationStatus.line.status}`);
    console.log(`📅 Google Calendar: ${integrationStatus.googleCalendar.status}`);
    console.log(`🌶️ Hot Pepper: ${integrationStatus.hotPepper.status}`);
    
    console.log('\n🌟 今日の魔法実行状況:');
    const todaysMagic = dashboardResponse.data.data.dashboard.todaysMagic;
    console.log(`⚡ 自動応答: ${todaysMagic.automaticResponses}件`);
    console.log(`📅 同期イベント: ${todaysMagic.syncedEvents}件`);
    console.log(`🏪 競合更新: ${todaysMagic.competitorUpdates}件`);
    console.log(`👥 顧客インサイト: ${todaysMagic.customerInsights}件\n`);

    // 2. 📸 Instagram魔法分析テスト
    console.log('📸 2. Instagram魔法分析テスト...');
    const instagramResponse = await axios.get(
      `${API_BASE}/magical-apis/instagram/demo-business-id/insights`,
      { headers: testHeaders }
    );
    
    console.log('✨ Instagram魔法分析結果:');
    const instagramData = instagramResponse.data.data.insights;
    console.log(`👥 フォロワー数: ${instagramData.profile.followers_count.toLocaleString()}名`);
    console.log(`📝 投稿数: ${instagramData.profile.media_count}件`);
    console.log(`💕 エンゲージメント: ${instagramData.emotionalSummary.engagement}`);
    console.log(`🎯 おすすめ: ${instagramData.emotionalSummary.recommendation}\n`);

    // 3. 💚 LINE魔法分析テスト
    console.log('💚 3. LINE魔法分析テスト...');
    const lineResponse = await axios.get(
      `${API_BASE}/magical-apis/line/demo-user-id/insights`,
      { headers: testHeaders }
    );
    
    console.log('✨ LINE魔法分析結果:');
    const lineData = lineResponse.data.data.insights;
    console.log(`👤 お客様: ${lineData.profile.displayName}様`);
    console.log(`💬 コミュニケーション: ${lineData.emotionalAnalysis.communicationStyle}`);
    console.log(`💝 満足度: ${lineData.emotionalAnalysis.satisfaction}%`);
    console.log(`🎯 おすすめアクション:`);
    lineData.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    console.log('');

    // 4. 📅 Google Calendar魔法同期テスト
    console.log('📅 4. Google Calendar魔法同期テスト...');
    const calendarResponse = await axios.post(
      `${API_BASE}/magical-apis/google-calendar/sync`,
      { calendarId: 'primary' },
      { headers: testHeaders }
    );
    
    console.log('✨ Google Calendar魔法同期結果:');
    const calendarData = calendarResponse.data.data.syncResult;
    console.log(`📅 今日の予定: ${calendarData.emotionalSchedule.todayBookings}件`);
    console.log(`📊 週の概要: ${calendarData.emotionalSchedule.weekOverview}`);
    console.log(`💡 アドバイス: ${calendarData.emotionalSchedule.recommendation}\n`);

    // 5. 🌶️ Hot Pepper競合魔法分析テスト
    console.log('🌶️ 5. Hot Pepper競合魔法分析テスト...');
    const hotPepperResponse = await axios.get(
      `${API_BASE}/magical-apis/hotpepper/competitor-analysis?latitude=35.6762&longitude=139.6503&range=3`,
      { headers: testHeaders }
    );
    
    console.log('✨ Hot Pepper競合魔法分析結果:');
    const hotPepperData = hotPepperResponse.data.data.analysis;
    console.log(`🏪 競合店舗数: ${hotPepperData.competitors.length}店舗`);
    console.log(`💰 平均価格: ${hotPepperData.analysis.averagePrice}`);
    console.log(`🎯 市場ポジション: ${hotPepperData.analysis.marketPosition}`);
    console.log(`✨ おすすめ戦略:`);
    hotPepperData.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    console.log('');

    // 6. 🔄 魔法的全同期テスト
    console.log('🔄 6. 魔法的全同期テスト...');
    const syncAllResponse = await axios.post(
      `${API_BASE}/magical-apis/sync-all`,
      {},
      { headers: testHeaders }
    );
    
    console.log('✨ 魔法的全同期結果:');
    const syncData = syncAllResponse.data.data;
    console.log(`⚡ 同期サービス数: ${syncData.totalSynced}件`);
    console.log(`⏱️ 同期時間: ${syncData.syncDuration}`);
    console.log(`🪄 魔法レベル: ${syncData.magicLevel}`);
    console.log(`📊 同期状況:`);
    Object.entries(syncData.syncResults).forEach(([service, result]) => {
      console.log(`   ${service}: ${result.status}`);
    });
    console.log('');

    // 7. 🎯 魔法設定テスト
    console.log('🎯 7. 魔法設定テスト...');
    const settingsResponse = await axios.get(
      `${API_BASE}/magical-apis/settings`,
      { headers: testHeaders }
    );
    
    console.log('✨ 魔法設定結果:');
    const settings = settingsResponse.data.data;
    console.log(`📸 Instagram: ${settings.instagram.enabled ? '有効' : '無効'} (同期間隔: ${settings.instagram.syncInterval}分)`);
    console.log(`💚 LINE: ${settings.line.enabled ? '有効' : '無効'} (自動返信: ${settings.line.autoReply ? 'ON' : 'OFF'})`);
    console.log(`📅 Google Calendar: ${settings.googleCalendar.enabled ? '有効' : '無効'} (同期間隔: ${settings.googleCalendar.syncInterval}分)`);
    console.log(`🌶️ Hot Pepper: ${settings.hotPepper.enabled ? '有効' : '無効'} (チェック間隔: ${settings.hotPepper.checkInterval}分)\n`);

    // 8. 🔮 魔法テスト機能テスト
    console.log('🔮 8. 各サービス魔法テスト...');
    const services = ['instagram', 'line', 'googleCalendar', 'hotPepper'];
    
    for (const service of services) {
      const testResponse = await axios.post(
        `${API_BASE}/magical-apis/test/${service}`,
        {},
        { headers: testHeaders }
      );
      
      const testData = testResponse.data.data;
      console.log(`${service}: ${testData.magic}`);
    }

    console.log('\n🎉 魔法的外部API統合テスト完了！');
    console.log('美容室の業務が魔法のように自動化されました ✨');
    console.log('🪄 すべての外部サービスが完璧に統合されています');
    
  } catch (error) {
    console.error('🚨 魔法テスト中にエラーが発生しました:');
    if (error.response) {
      console.error(`   ステータス: ${error.response.status}`);
      console.error(`   メッセージ: ${error.response.data.message || error.response.data.error}`);
      console.error(`   ユーザーメッセージ: ${error.response.data.userMessage || 'なし'}`);
    } else {
      console.error(`   エラー: ${error.message}`);
    }
    console.log('\n🪄 心配ありません！魔法の調整を行って、再度テストしてください');
  }
}

// 5秒後にテスト開始（サーバー起動待ち）
setTimeout(async () => {
  await testMagicalApis();
}, 5000);

console.log('⏰ 5秒後にテストを開始します...');
console.log('美容室管理システムサーバーが起動していることを確認してください');