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
        return await getServices(req, res)
      case 'POST':
        return await createService(req, res)
      case 'PUT':
        return await updateService(req, res)
      case 'DELETE':
        return await deleteService(req, res)
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

async function getServices(req, res) {
  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ services })
}

async function createService(req, res) {
  const serviceData = req.body

  // Validate required fields
  if (!serviceData.name) {
    return res.status(400).json({ 
      error: 'Service name is required' 
    })
  }

  const { data: service, error } = await supabase
    .from('services')
    .insert([serviceData])
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({ service })
}

async function updateService(req, res) {
  const { id } = req.query
  const updateData = req.body

  const { data: service, error } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!service) {
    return res.status(404).json({ error: 'Service not found' })
  }

  res.status(200).json({ service })
}

async function deleteService(req, res) {
  const { id } = req.query

  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ message: 'Service deleted successfully' })
}