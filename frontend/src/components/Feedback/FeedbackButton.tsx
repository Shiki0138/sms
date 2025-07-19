import React, { useState } from 'react'
import { MessageSquare } from 'lucide-react'
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

  if (!isBetaUser) {
    return null
  }

  return (
    <>
      {/* Floating Contact Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          title="お問い合わせ"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
      
      {/* Contact Modal */}
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