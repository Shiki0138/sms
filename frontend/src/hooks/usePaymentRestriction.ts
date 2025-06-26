import { useState, useCallback } from 'react'
import { getEnvironmentConfig, isFeatureEnabled } from '../utils/environment'

export interface PaymentData {
  amount: number
  currency: string
  customerId?: string
  description?: string
  metadata?: Record<string, string>
}

export interface PaymentResult {
  success: boolean
  paymentId?: string
  error?: string
  restrictedByEnvironment?: boolean
}

export const usePaymentRestriction = () => {
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const config = getEnvironmentConfig()

  /**
   * 決済処理の試行
   */
  const attemptPayment = useCallback(async (paymentData: PaymentData): Promise<PaymentResult> => {
    // デモモードチェック
    if (config.isDemoMode) {
      setIsWarningOpen(true)
      
      if (config.debugMode) {
        console.warn('🎭 Payment processing blocked in demo mode', {
          environment: 'demo',
          amount: paymentData.amount,
          currency: paymentData.currency
        })
      }
      
      return {
        success: false,
        error: '🎭 デモモードでは決済機能は無効化されています',
        restrictedByEnvironment: true
      }
    }

    // 環境チェック
    if (!isFeatureEnabled('enablePayments')) {
      setIsWarningOpen(true)
      
      if (config.debugMode) {
        console.warn('🚫 Payment processing blocked in development environment', {
          environment: config.isDevelopment ? 'development' : 'production',
          amount: paymentData.amount,
          currency: paymentData.currency
        })
      }
      
      return {
        success: false,
        error: '決済処理は本番環境でのみ利用可能です',
        restrictedByEnvironment: true
      }
    }

    setIsProcessing(true)

    try {
      // 本番環境での実際の決済処理
      const result = await processPayment(paymentData)
      
      if (config.debugMode) {
        console.log('✅ Payment processed successfully', {
          paymentId: result.paymentId,
          amount: paymentData.amount
        })
      }
      
      return result
    } catch (error) {
      console.error('❌ Payment processing error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '決済処理に失敗しました'
      }
    } finally {
      setIsProcessing(false)
    }
  }, [config])

  /**
   * 実際の決済処理（本番環境でのみ実行）
   */
  const processPayment = async (paymentData: PaymentData): Promise<PaymentResult> => {
    const response = await fetch(`${config.apiBaseURL}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        ...paymentData,
        timestamp: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error('決済処理に失敗しました')
    }

    const result = await response.json()
    return {
      success: true,
      paymentId: result.paymentId
    }
  }

  /**
   * 決済機能が利用可能かチェック
   */
  const isPaymentAvailable = useCallback((): boolean => {
    return isFeatureEnabled('enablePayments')
  }, [])

  return {
    // 決済機能
    attemptPayment,
    
    // 状態
    isProcessing,
    isWarningOpen,
    
    // 制御
    setIsWarningOpen,
    isPaymentAvailable,
    
    // 環境情報
    isDevelopment: config.isDevelopment,
    isProduction: config.isProduction
  }
}