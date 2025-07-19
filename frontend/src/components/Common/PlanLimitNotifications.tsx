import React from 'react'
import { useSubscription } from '../../contexts/SubscriptionContext'
import LimitWarning from './LimitWarning'

const PlanLimitNotifications: React.FC = () => {
  const { subscriptionInfo } = useSubscription()

  if (!subscriptionInfo) return null

  const { currentUsage } = subscriptionInfo

  return (
    <div className="space-y-3">
      {/* 顧客数制限警告 */}
      <LimitWarning 
        limitType="maxCustomers"
        currentValue={currentUsage.customerCount}
        warningThreshold={0.8}
      />
      
      {/* スタッフ数制限警告 */}
      <LimitWarning 
        limitType="maxStaff"
        currentValue={currentUsage.staffCount}
        warningThreshold={0.8}
      />
      
      {/* AI返信数制限警告 */}
      <LimitWarning 
        limitType="maxAIRepliesPerMonth"
        currentValue={currentUsage.aiRepliesThisMonth}
        warningThreshold={0.8}
      />
      
      {/* エクスポート数制限警告 */}
      <LimitWarning 
        limitType="maxDataExport"
        currentValue={currentUsage.dataExportsThisMonth}
        warningThreshold={0.8}
      />
    </div>
  )
}

export default PlanLimitNotifications