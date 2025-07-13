import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      })
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: authError.message 
      })
    }

    if (!authData.user) {
      return res.status(401).json({ error: 'Authentication failed' })
    }

    // Get staff information
    const { data: staff, error: staffError } = await supabase
      .from('staff')
      .select('*')
      .eq('email', email)
      .single()

    if (staffError || !staff) {
      return res.status(404).json({ 
        error: 'Staff member not found' 
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: staff.id,
        email: staff.email,
        role: staff.role,
        exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
      },
      process.env.JWT_SECRET
    )

    res.status(200).json({
      success: true,
      user: authData.user,
      staff: {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: staff.role,
        isActive: staff.is_active
      },
      token
    })

  } catch (error) {
    console.error('Auth Error:', error)
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    })
  }
}