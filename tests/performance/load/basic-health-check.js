// 基本的なヘルスチェック負荷テスト
module.exports = {
  config: {
    target: 'http://localhost:4002',
    phases: [
      {
        duration: 30,  // 30秒
        arrivalRate: 5, // 1秒あたり5ユーザー
        name: 'ヘルスチェック基本負荷'
      }
    ],
    defaults: {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  },
  
  scenarios: [
    {
      name: 'ヘルスチェックエンドポイント',
      weight: 100,
      flow: [
        {
          get: {
            url: '/health',
            expect: [
              { statusCode: 200 },
              { hasProperty: 'status' }
            ]
          }
        }
      ]
    }
  ]
};