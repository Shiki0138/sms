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
    const {
      title,
      description,
      category,
      priority,
      userInfo,
      systemInfo
    } = req.body

    // Validate required fields
    if (!title || !description || !userInfo?.email) {
      return res.status(400).json({ 
        error: 'Title, description, and user email are required' 
      })
    }

    // Create feature request record
    const featureRequestData = {
      title,
      description,
      category: category || 'feature',
      priority: priority || 'medium',
      user_name: userInfo.name,
      user_email: userInfo.email,
      user_role: userInfo.role || 'user',
      system_info: systemInfo || {},
      status: 'submitted',
      created_at: new Date().toISOString()
    }

    const { data: featureRequest, error } = await supabase
      .from('feature_requests')
      .insert([featureRequestData])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    // Send notification email (if enabled)
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true') {
      try {
        // Email notification would be implemented here
        console.log('Feature request notification sent:', featureRequest.id)
      } catch (emailError) {
        console.error('Email notification failed:', emailError)
        // Don't fail the request if email fails
      }
    }

    res.status(201).json({ 
      success: true,
      id: featureRequest.id,
      message: 'Feature request submitted successfully'
    })

  } catch (error) {
    console.error('Feature request error:', error)
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message 
    })
  }
}