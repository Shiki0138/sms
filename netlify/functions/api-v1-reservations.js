exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    }
  }
  
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }
  
  // デモ用予約データ
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
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
}