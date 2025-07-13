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
        return await getStaff(req, res)
      case 'POST':
        return await createStaff(req, res)
      case 'PUT':
        return await updateStaff(req, res)
      case 'DELETE':
        return await deleteStaff(req, res)
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
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

async function getStaff(req, res) {
  const { data: staff, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ staff })
}

async function createStaff(req, res) {
  const staffData = req.body

  // Validate required fields
  if (!staffData.name || !staffData.email) {
    return res.status(400).json({ 
      error: 'Staff name and email are required' 
    })
  }

  const { data: staff, error } = await supabase
    .from('staff')
    .insert([staffData])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Staff member already exists' })
    }
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({ staff })
}

async function updateStaff(req, res) {
  const { id } = req.query
  const updateData = req.body

  const { data: staff, error } = await supabase
    .from('staff')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!staff) {
    return res.status(404).json({ error: 'Staff member not found' })
  }

  res.status(200).json({ staff })
}

async function deleteStaff(req, res) {
  const { id } = req.query

  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ message: 'Staff member deleted successfully' })
}