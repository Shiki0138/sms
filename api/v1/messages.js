import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  // CORS headers
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
    switch (req.method) {
      case 'GET':
        return await getMessages(req, res)
      case 'POST':
        return await sendMessage(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    })
  }
}

async function getMessages(req, res) {
  const { customer_id, limit = 50 } = req.query

  let query = supabase
    .from('messages')
    .select(`
      *,
      customer:customers(*)
    `)
    .order('created_at', { ascending: false })
    .limit(parseInt(limit))

  if (customer_id) {
    query = query.eq('customer_id', customer_id)
  }

  const { data: messages, error } = await query

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ messages })
}

async function sendMessage(req, res) {
  const { customer_id, content, channel = 'SYSTEM' } = req.body

  if (!customer_id || !content) {
    return res.status(400).json({ 
      error: 'Customer ID and content are required' 
    })
  }

  const messageData = {
    customer_id,
    content,
    channel,
    sender_type: 'STAFF',
    created_at: new Date().toISOString()
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert([messageData])
    .select(`
      *,
      customer:customers(*)
    `)
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  // Here you would integrate with external APIs (LINE, Instagram) based on channel
  // For now, we'll just return the created message

  res.status(201).json({ message })
}