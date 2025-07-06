export default async function handler(req, res) {
  // CORS設定
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Supabase Edge Functionを呼び出し
    const response = await fetch(
      `https://fqwdbywgknavgwqpnlkj.supabase.co/functions/v1/auth`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2RieXdna25hdmd3cXBubGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNzc2MDQsImV4cCI6MjA2Njc1MzYwNH0._CJ-IvMB1JqotdMQla75qj8U8SFZkEsEi2YWJSeHpMM`
        },
        body: JSON.stringify({ email, password })
      }
    )

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    })
  }
}