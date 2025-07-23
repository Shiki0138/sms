export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Line-Signature');

  // OPTIONSリクエストへの対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GETリクエスト（接続テスト用）
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok',
      message: 'LINE Webhook endpoint is ready',
      timestamp: new Date().toISOString(),
      endpoint: '/api/line/webhook'
    });
  }

  // POSTリクエスト（LINEからのWebhook）
  if (req.method === 'POST') {
    try {
      const body = req.body;
      console.log('LINE Webhook received:', JSON.stringify(body, null, 2));
      
      // LINEの検証用リクエストへの応答
      if (body && body.events) {
        // イベント処理
        for (const event of body.events) {
          console.log('Processing event:', event.type);
          
          // メッセージイベントの処理
          if (event.type === 'message' && event.message.type === 'text') {
            console.log('Text message received:', event.message.text);
            // 後でメッセージ返信機能を実装
          }
          
          // フォローイベントの処理
          if (event.type === 'follow') {
            console.log('New follower:', event.source.userId);
            // 後でウェルカムメッセージを実装
          }
        }
      }

      // LINEプラットフォームに200 OKを返す（必須）
      return res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook error:', error);
      // エラーでも200を返す（LINEの仕様）
      return res.status(200).send('OK');
    }
  }

  // その他のメソッドは405を返す
  return res.status(405).json({ error: 'Method not allowed' });
}