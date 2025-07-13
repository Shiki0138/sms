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
        return await getCustomers(req, res)
      case 'POST':
        return await createCustomer(req, res)
      case 'PUT':
        return await updateCustomer(req, res)
      case 'DELETE':
        return await deleteCustomer(req, res)
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

async function getCustomers(req, res) {
  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ customers })
}

async function createCustomer(req, res) {
  const customerData = req.body

  // Validate required fields
  if (!customerData.name) {
    return res.status(400).json({ error: 'Customer name is required' })
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .insert([customerData])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ error: 'Customer already exists' })
    }
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({ customer })
}

async function updateCustomer(req, res) {
  const { id } = req.query
  const updateData = req.body

  const { data: customer, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' })
  }

  res.status(200).json({ customer })
}

async function deleteCustomer(req, res) {
  const { id } = req.query

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ message: 'Customer deleted successfully' })
}