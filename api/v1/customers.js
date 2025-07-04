export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  
  // デモ用顧客データ
  res.status(200).json({
    success: true,
    data: [
      {
        id: '1',
        name: '山田花子',
        email: 'hanako@example.com',
        phone: '090-1234-5678',
        lastVisit: '2024-06-15',
        totalVisits: 12
      },
      {
        id: '2',
        name: '田中美香',
        email: 'mika@example.com',
        phone: '090-2345-6789',
        lastVisit: '2024-06-20',
        totalVisits: 8
      },
      {
        id: '3',
        name: '佐藤直美',
        email: 'naomi@example.com',
        phone: '090-3456-7890',
        lastVisit: '2024-06-25',
        totalVisits: 15
      }
    ]
  })
}