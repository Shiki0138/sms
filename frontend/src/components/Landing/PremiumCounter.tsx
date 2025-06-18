import React, { useState, useEffect } from 'react'
import { Clock, Users, Zap } from 'lucide-react'

interface PremiumCounterProps {
  initialSlots?: number
  initialHours?: number
}

const PremiumCounter: React.FC<PremiumCounterProps> = ({ 
  initialSlots = 7, 
  initialHours = 72 
}) => {
  const [remainingSlots, setRemainingSlots] = useState(initialSlots)
  const [timeLeft, setTimeLeft] = useState(initialHours * 3600) // 秒単位

  // カウントダウンタイマー
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // ランダムに枠数を減らす演出
  useEffect(() => {
    const slotTimer = setInterval(() => {
      if (remainingSlots > 1 && Math.random() < 0.1) { // 10%の確率で枠が減る
        setRemainingSlots(prev => prev - 1)
      }
    }, 30000) // 30秒ごとに判定
    return () => clearInterval(slotTimer)
  }, [remainingSlots])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getUrgencyColor = () => {
    if (remainingSlots <= 3) return 'from-red-500 to-red-700'
    if (remainingSlots <= 5) return 'from-orange-500 to-red-500'
    return 'from-yellow-500 to-orange-500'
  }

  const getUrgencyText = () => {
    if (remainingSlots <= 3) return '🚨 緊急 🚨'
    if (remainingSlots <= 5) return '⚡ 急いで ⚡'
    return '🔥 人気 🔥'
  }

  return (
    <div className="bg-black bg-opacity-50 backdrop-blur-sm border border-yellow-400 rounded-2xl p-6 text-center">
      {/* 緊急度表示 */}
      <div className={`inline-flex items-center bg-gradient-to-r ${getUrgencyColor()} text-white font-bold px-6 py-2 rounded-full text-lg mb-4 animate-pulse`}>
        {getUrgencyText()} 限定20名様 特別先行体験
      </div>

      {/* カウンター表示 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* 残り枠数 */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white bg-opacity-10 animate-pulse"></div>
          <div className="relative z-10">
            <Users className="w-8 h-8 mx-auto mb-2" />
            <div className="text-3xl font-bold mb-1">{remainingSlots}</div>
            <div className="text-sm opacity-90">残り枠</div>
          </div>
        </div>

        {/* カウントダウン */}
        <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-white bg-opacity-10 animate-pulse"></div>
          <div className="relative z-10">
            <Clock className="w-8 h-8 mx-auto mb-2" />
            <div className="text-2xl font-bold mb-1 font-mono">{formatTime(timeLeft)}</div>
            <div className="text-sm opacity-90">残り時間</div>
          </div>
        </div>
      </div>

      {/* 申込者数リアルタイム表示 */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-3 text-white mb-4">
        <div className="flex items-center justify-center">
          <Zap className="w-5 h-5 mr-2 animate-pulse" />
          <span className="text-sm">
            現在 <span className="font-bold text-lg">{20 - remainingSlots}</span> 名が申込済み
          </span>
        </div>
      </div>

      {/* 警告メッセージ */}
      <div className="text-yellow-300 text-sm font-medium">
        {timeLeft <= 3600 ? (
          <span className="animate-pulse">⚠️ 残り1時間を切りました！</span>
        ) : timeLeft <= 7200 ? (
          <span>⏰ 残り2時間以内に受付終了予定</span>
        ) : (
          <span>このオファーは限定期間のみです</span>
        )}
      </div>

      {/* 進捗バー */}
      <div className="mt-4 bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-red-500 to-yellow-500 h-full transition-all duration-1000 ease-out"
          style={{ width: `${((20 - remainingSlots) / 20) * 100}%` }}
        />
      </div>
      <div className="text-gray-300 text-xs mt-2">
        埋まり具合: {Math.round(((20 - remainingSlots) / 20) * 100)}%
      </div>
    </div>
  )
}

export default PremiumCounter