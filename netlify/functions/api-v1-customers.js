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
  
  // デモ用顧客データ
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
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
}