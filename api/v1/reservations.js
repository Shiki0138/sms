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
        return await getReservations(req, res)
      case 'POST':
        return await createReservation(req, res)
      case 'PUT':
        return await updateReservation(req, res)
      case 'DELETE':
        return await deleteReservation(req, res)
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

async function getReservations(req, res) {
  const { start_date, end_date } = req.query

  let query = supabase
    .from('reservations')
    .select(`
      *,
      customer:customers(*),
      staff:staff(*)
    `)
    .order('start_time', { ascending: true })

  if (start_date && end_date) {
    query = query
      .gte('start_time', start_date)
      .lte('start_time', end_date)
  }

  const { data: reservations, error } = await query

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ reservations })
}

async function createReservation(req, res) {
  const reservationData = req.body

  // Validate required fields
  if (!reservationData.customer_id || !reservationData.start_time) {
    return res.status(400).json({ 
      error: 'Customer ID and start time are required' 
    })
  }

  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert([reservationData])
    .select(`
      *,
      customer:customers(*),
      staff:staff(*)
    `)
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(201).json({ reservation })
}

async function updateReservation(req, res) {
  const { id } = req.query
  const updateData = req.body

  const { data: reservation, error } = await supabase
    .from('reservations')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      customer:customers(*),
      staff:staff(*)
    `)
    .single()

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' })
  }

  res.status(200).json({ reservation })
}

async function deleteReservation(req, res) {
  const { id } = req.query

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', id)

  if (error) {
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json({ message: 'Reservation deleted successfully' })
}