export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ 
        success: false, 
        message: '認証が必要です' 
      })
    }

    // Supabase Edge Functionを呼び出し
    const response = await fetch(
      `https://fqwdbywgknavgwqpnlkj.supabase.co/functions/v1/customers${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`,
      {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2RieXdna25hdmd3cXBubGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzc2MDQsImV4cCI6MjA2Njc1MzYwNH0._CJ-IvMB1JqotdMQla75qj8U8SFZkEsEi2YWJSeHpMM`,
          'x-auth-token': authHeader
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
      }
    )

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    console.error('API error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    })
  }
}