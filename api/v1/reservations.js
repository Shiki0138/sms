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
  
  // デモ用予約データ
  res.status(200).json({
    success: true,
    data: [
      {
        id: '1',
        customerName: '山田花子',
        service: 'カット & カラー',
        date: '2024-07-05',
        time: '10:00',
        status: 'confirmed'
      },
      {
        id: '2',
        customerName: '田中美香',
        service: 'パーマ',
        date: '2024-07-06',
        time: '14:00',
        status: 'pending'
      },
      {
        id: '3',
        customerName: '佐藤直美',
        service: 'トリートメント',
        date: '2024-07-07',
        time: '11:30',
        status: 'confirmed'
      }
    ]
  })
}