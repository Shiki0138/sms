/**
 * 🧠 感動AI分析システム テストスクリプト
 * 「美容室スタッフが『このAI、すごすぎる！』と感動するテスト」
 */

const axios = require('axios');

const API_BASE = 'http://localhost:4002/api/v1';

// テスト用の美容室スタッフ認証情報（簡易版）
const testHeaders = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer demo-token',
  'X-Tenant-ID': 'salon-demo'
};

console.log('🌟 感動AI分析システムテスト開始！');
console.log('美容室スタッフの心を動かすAI体験をテストします ✨\n');

async function testEmotionalAnalytics() {
  try {
    // 1. 🎯 顧客セグメント分析テスト
    console.log('💝 1. 顧客セグメント分析テスト...');
    const segmentsResponse = await axios.get(
      `${API_BASE}/emotional-analytics/customer-segments`,
      { headers: testHeaders }
    );
    
    console.log('✨ セグメント分析結果:');
    console.log(`📊 総顧客数: ${segmentsResponse.data.data.totalCustomers}名`);
    segmentsResponse.data.data.segments.forEach(segment => {
      console.log(`  ${segment.name}: ${segment.count}名 (平均価値: ¥${segment.averageValue.toLocaleString()})`);
    });
    console.log(`💡 インサイト: ${segmentsResponse.data.insights.join(', ')}\n`);

    // 2. 🔮 予測分析テスト
    console.log('🔮 2. 美容室の未来予測テスト...');
    const predictionsResponse = await axios.get(
      `${API_BASE}/emotional-analytics/predictions`,
      { headers: testHeaders }
    );
    
    console.log('✨ 予測分析結果:');
    const nextWeek = predictionsResponse.data.data.nextWeekBookings;
    console.log(`📈 来週予約予測: ${nextWeek.predicted}件 (信頼度: ${nextWeek.confidence}%)`);
    console.log(`📅 繁忙期予測:`);
    predictionsResponse.data.data.busyPeriods.forEach(period => {
      console.log(`  ${period.date} ${period.period}: ${period.predictedBookings}件`);
    });
    console.log(`🌸 季節トレンド: ${predictionsResponse.data.data.seasonalTrends.current}\n`);

    // 3. 💡 AI推奨アクションテスト
    console.log('💡 3. AI推奨アクション分析テスト...');
    const recommendationsResponse = await axios.get(
      `${API_BASE}/emotional-analytics/recommendations`,
      { headers: testHeaders }
    );
    
    console.log('✨ AI推奨アクション:');
    recommendationsResponse.data.data.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.title} (優先度: ${rec.priority})`);
      console.log(`   📝 ${rec.description}`);
      console.log(`   🎯 期待効果: ${rec.expectedImpact}`);
      console.log(`   ⏰ 期限: ${rec.deadline}\n`);
    });

    // 4. 📈 リアルタイム分析テスト
    console.log('📈 4. リアルタイム分析ダッシュボードテスト...');
    const realtimeResponse = await axios.get(
      `${API_BASE}/emotional-analytics/realtime`,
      { headers: testHeaders }
    );
    
    console.log('✨ リアルタイム状況:');
    const current = realtimeResponse.data.data.currentStatus;
    console.log(`👥 稼働スタッフ: ${current.activeStaff}名`);
    console.log(`💆 進行中サービス: ${current.ongoingServices}件`);
    console.log(`⏰ 待機中のお客様: ${current.waitingCustomers}名`);
    console.log(`📅 今日の予約: ${current.todayBookings}件 (完了: ${current.completedServices}件)`);
    
    console.log('\n🌟 ライブインサイト:');
    realtimeResponse.data.data.liveInsights.forEach(insight => {
      console.log(`  ${insight}`);
    });

    console.log('\n🎉 感動AI分析システムテスト完了！');
    console.log('美容室スタッフが感動するAI体験が正常に動作しています ✨');
    
  } catch (error) {
    console.error('🚨 テスト中にエラーが発生しました:');
    if (error.response) {
      console.error(`   ステータス: ${error.response.status}`);
      console.error(`   メッセージ: ${error.response.data.message || error.response.data.error}`);
      console.error(`   ユーザーメッセージ: ${error.response.data.userMessage || 'なし'}`);
    } else {
      console.error(`   エラー: ${error.message}`);
    }
    console.log('\n💝 心配ありません！システムの調整を行って、再度テストしてください');
  }
}

// 5秒後にテスト開始（サーバー起動待ち）
setTimeout(async () => {
  await testEmotionalAnalytics();
}, 5000);

console.log('⏰ 5秒後にテストを開始します...');
console.log('美容室管理システムサーバーが起動していることを確認してください');