import React, { useState } from 'react'
import { MessageSquare, X, Bug, Lightbulb, Star } from 'lucide-react'
import FeedbackModal from './FeedbackModal'

interface FeedbackButtonProps {
  userId?: string
  userEmail?: string
  userName?: string
  isBetaUser?: boolean
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({
  userId,
  userEmail,
  userName,
  isBetaUser = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showQuickRating, setShowQuickRating] = useState(false)
  const [quickRating, setQuickRating] = useState(0)

  const handleQuickRating = async (rating: number) => {
    setQuickRating(rating)
    
    // Send quick rating to backend
    try {
      await fetch('/api/v1/feedback/quick-rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating,
          userId,
          userEmail,
          timestamp: new Date().toISOString()
        })
      })
      
      // Show thank you message
      setTimeout(() => {
        setShowQuickRating(false)
        setQuickRating(0)
      }, 2000)
    } catch (error) {
      console.error('Failed to send quick rating:', error)
    }
  }

  if (!isBetaUser) {
    return null
  }

  return (
    <>
      {/* Floating Feedback Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Quick Rating Widget */}
        {showQuickRating && (
          <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-64 mb-2 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">今日の使い心地は？</h4>
              <button
                onClick={() => setShowQuickRating(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleQuickRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= quickRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {quickRating > 0 && (
              <p className="text-center text-sm text-green-600 mt-2">
                ありがとうございます！
              </p>
            )}
          </div>
        )}
        
        {/* Main Feedback Button */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(true)}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              β
            </span>
          </button>
          
          {/* Quick Actions */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white rounded-lg shadow-lg p-2 space-y-1">
              <button
                onClick={() => {
                  setIsOpen(true)
                  // Set feedback type to bug
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full"
              >
                <Bug className="w-4 h-4 text-red-500" />
                <span>バグ報告</span>
              </button>
              
              <button
                onClick={() => {
                  setIsOpen(true)
                  // Set feedback type to feature
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full"
              >
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span>機能要望</span>
              </button>
              
              <button
                onClick={() => setShowQuickRating(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md w-full"
              >
                <Star className="w-4 h-4 text-blue-500" />
                <span>評価する</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId={userId}
        userEmail={userEmail}
        userName={userName}
      />
    </>
  )
}

export default FeedbackButton