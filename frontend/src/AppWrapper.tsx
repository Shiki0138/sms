import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import App from './App'
import LoginPage from './components/Auth/LoginPage'
import RegisterForm from './components/Auth/RegisterForm'
import { useAuth } from './contexts/AuthContext'

// Private Route component
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    )
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

// Auth Routes wrapper
const AuthRoutes = () => {
  const { isAuthenticated } = useAuth()
  
  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterForm />
      } />
      <Route path="/dashboard" element={
        <PrivateRoute>
          <App />
        </PrivateRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}

export default function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <AuthRoutes />
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  )
}