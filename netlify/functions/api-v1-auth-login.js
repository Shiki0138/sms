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
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }
  
  const { email, password } = JSON.parse(event.body || '{}')
  
  console.log('Login attempt:', { email })
  
  // 簡易認証（デモ用）
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      message: 'ログインが成功しました',
      data: {
        user: {
          id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
          email: email,
          name: 'システム管理者',
          role: 'ADMIN',
          isActive: true
        },
        token: 'demo-jwt-token-' + Math.random().toString(36).substr(2, 9)
      }
    })
  }
}