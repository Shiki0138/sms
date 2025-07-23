import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Safe logout hook that handles navigation properly
 * Redirects to login page after logout
 */
export const useLogout = () => {
  const { logout } = useAuth()
  
  // Safe navigation - check if we're in a Router context
  let navigate: ((path: string) => void) | null = null
  
  try {
    const routerNavigate = useNavigate()
    navigate = routerNavigate
  } catch (error) {
    // If useNavigate fails (not in Router context), we'll handle it differently
    console.warn('useNavigate is not available, will use window.location for logout redirect')
  }

  const handleLogout = useCallback(() => {
    // Clear auth state
    logout()
    
    // Navigate to login page
    if (navigate) {
      // Use React Router navigation if available
      navigate('/login')
    } else {
      // Fallback to window.location if Router is not available
      // Use replace to prevent going back to the protected page
      window.location.replace('/login')
    }
  }, [logout, navigate])

  return handleLogout
}