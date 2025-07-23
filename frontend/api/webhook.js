export default async function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // OPTIONSリクエストへの対応
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GETリクエスト（接続テスト用）
  if (req.method === 'GET') {
    return res.status(200).json({ 
      status: 'ok',
      message: 'LINE Webhook is ready',
      timestamp: new Date().toISOString()
    });
  }

  // POSTリクエスト（LINEからのWebhook）
  if (req.method === 'POST') {
    console.log('Webhook received:', JSON.stringify(req.body, null, 2));
    
    // LINEの検証用リクエストへの応答
    if (req.body && req.body.events) {
      // イベント処理（後で実装）
      req.body.events.forEach(event => {
        console.log('Event type:', event.type);
        if (event.type === 'message' && event.message.type === 'text') {
          console.log('Message:', event.message.text);
        }
      });
    }

    // LINEプラットフォームに200 OKを返す
    return res.status(200).json({ status: 'ok' });
  }

  // その他のメソッドは405を返す
  return res.status(405).json({ error: 'Method not allowed' });
}