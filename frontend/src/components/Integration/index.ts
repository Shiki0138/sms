// Integration Components Export Index
// Hot Pepper Beauty CSV Data Integration System

// Main Integration Components
export { default as HotPepperIntegration } from './HotPepperIntegration'
export { default as DataIntegrationManager } from './DataIntegrationManager'

// TypeScript Interfaces for Hot Pepper Integration
export interface HotPepperData {
  id: string
  reservationDate: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  serviceType: string
  serviceDetails: string
  price: number
  staffName: string
  status: 'completed' | 'cancelled' | 'no_show'
  referralSource: 'hotpepper' | 'repeat' | 'walk_in'
  memo?: string
}

export interface IntegrationStats {
  totalHotpepperRecords: number
  newCustomers: number
  existingCustomersUpdated: number
  newReservations: number
  duplicateReservations: number
  conversionRate: number
  dateRange: { start: string; end: string } | null
  revenueBySource: {
    hotpepper: number
    existing: number
    total: number
  }
}

export interface CustomerMatch {
  hotpepperRecord: HotPepperData
  existingCustomer: any | null
  matchConfidence: number
  matchMethod: 'exact_phone' | 'exact_name' | 'fuzzy_name' | 'new'
}

// Integration Configuration
export const INTEGRATION_CONFIG = {
  // CSV Import Settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['.csv'],
  MAX_RECORDS_PER_IMPORT: 10000,
  
  // Data Matching Settings
  PHONE_MATCH_CONFIDENCE: 100,
  EXACT_NAME_MATCH_CONFIDENCE: 85,
  FUZZY_NAME_MATCH_CONFIDENCE: 70,
  MIN_MATCH_CONFIDENCE: 60,
  
  // Date Range Settings
  MAX_IMPORT_PERIOD_DAYS: 365, // 1 year maximum
  DEFAULT_IMPORT_PERIOD_DAYS: 90, // 3 months default
  
  // API Status
  HOT_PEPPER_API_STATUS: 'DISCONTINUED_2017',
  ALTERNATIVE_METHODS: [
    'salon_board_csv_export',
    'manual_csv_import',
    'third_party_integration'
  ],
  
  // CSV Format Mapping
  CSV_COLUMN_MAPPING: {
    'reservation_id': ['予約ID', 'ID', 'id'],
    'reservation_date': ['予約日時', '予約日', 'date', 'datetime'],
    'customer_name': ['顧客名', '名前', 'name', 'customer'],
    'customer_phone': ['電話番号', 'TEL', 'phone', 'tel'],
    'customer_email': ['メールアドレス', 'email', 'mail'],
    'service_type': ['サービス種別', 'サービス', 'service'],
    'service_details': ['サービス詳細', '詳細', 'details'],
    'price': ['料金', '金額', 'price', 'amount'],
    'staff_name': ['スタッフ名', 'スタッフ', 'staff'],
    'status': ['ステータス', '状態', 'status'],
    'referral_source': ['集客経路', '経路', 'source', 'referral'],
    'memo': ['メモ', '備考', 'memo', 'note']
  }
}

// Hot Pepper Beauty Integration Status
export const HOT_PEPPER_STATUS = {
  api: {
    status: 'DISCONTINUED',
    discontinuedYear: 2017,
    reason: 'Hot Pepper Beauty stopped providing public API access in 2017',
    alternatives: [
      'Salon Board CSV export (official)',
      'Third-party reservation system integration',
      'Manual CSV import/export'
    ]
  },
  dataAccess: {
    currentMethods: [
      {
        method: 'Salon Board Web Interface',
        description: 'Official reservation management system provided free with Hot Pepper Beauty',
        features: [
          'Customer data CSV export',
          'Reservation history export',
          'Real-time reservation management',
          'Up to 1 year of historical data'
        ],
        limitations: [
          'Requires manual export',
          'No real-time API access',
          'Limited to Salon Board users'
        ]
      },
      {
        method: 'Third-party Integration',
        description: 'Some reservation systems offer Hot Pepper Beauty integration',
        features: [
          'Automated data sync (limited)',
          'Multi-platform management',
          'Enhanced analytics'
        ],
        limitations: [
          'Screen scraping technology',
          'Manual reservations not synced',
          'Additional costs'
        ]
      }
    ]
  },
  recommendations: [
    'Use Salon Board as primary reservation system',
    'Export CSV data monthly for analysis',
    'Implement manual data integration process',
    'Consider third-party solutions for automation needs'
  ]
}

// Utility Functions
export const formatHotPepperDate = (dateString: string): string => {
  try {
    return new Date(dateString).toISOString()
  } catch {
    return dateString
  }
}

export const validateHotPepperCSV = (csvData: string[][]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} => {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (csvData.length < 2) {
    errors.push('CSVファイルにデータが含まれていません')
  }
  
  if (csvData[0].length < 5) {
    warnings.push('必要な列数が不足している可能性があります')
  }
  
  const requiredColumns = ['顧客名', '予約日時', '料金']
  const headers = csvData[0]
  
  requiredColumns.forEach(col => {
    if (!headers.some(header => header.includes(col))) {
      warnings.push(`推奨列「${col}」が見つかりません`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

export const calculateMatchConfidence = (
  hotpepperRecord: HotPepperData,
  existingCustomer: any
): number => {
  let confidence = 0
  
  // Phone number exact match
  if (hotpepperRecord.customerPhone && existingCustomer.phone) {
    const normalizedHotPepper = hotpepperRecord.customerPhone.replace(/[-\s]/g, '')
    const normalizedExisting = existingCustomer.phone.replace(/[-\s]/g, '')
    if (normalizedHotPepper === normalizedExisting) {
      return INTEGRATION_CONFIG.PHONE_MATCH_CONFIDENCE
    }
  }
  
  // Name exact match
  if (hotpepperRecord.customerName === existingCustomer.name) {
    confidence = INTEGRATION_CONFIG.EXACT_NAME_MATCH_CONFIDENCE
  }
  
  // Email match (if available)
  if (hotpepperRecord.customerEmail && existingCustomer.email) {
    if (hotpepperRecord.customerEmail === existingCustomer.email) {
      confidence = Math.max(confidence, 90)
    }
  }
  
  return confidence
}

export const generateIntegrationReport = (stats: IntegrationStats): string => {
  const lines = [
    'ホットペッパービューティー データ統合レポート',
    '=' .repeat(50),
    '',
    `統合日時: ${new Date().toLocaleString('ja-JP')}`,
    '',
    '統合結果:',
    `  総データ数: ${stats.totalHotpepperRecords}件`,
    `  新規顧客: ${stats.newCustomers}名`,
    `  既存顧客更新: ${stats.existingCustomersUpdated}名`,
    `  新規予約: ${stats.newReservations}件`,
    `  重複予約: ${stats.duplicateReservations}件`,
    `  完了率: ${stats.conversionRate.toFixed(1)}%`,
    '',
    '売上分析:',
    `  ホットペッパー売上: ¥${stats.revenueBySource.hotpepper.toLocaleString()}`,
    `  既存システム売上: ¥${stats.revenueBySource.existing.toLocaleString()}`,
    `  総売上: ¥${stats.revenueBySource.total.toLocaleString()}`,
    '',
    stats.dateRange ? `対象期間: ${stats.dateRange.start} - ${stats.dateRange.end}` : '',
    '',
    '注意事項:',
    '- 重複予約がある場合は手動確認が必要です',
    '- 顧客マッチングの精度は継続的に改善してください',
    '- 定期的なデータ同期を推奨します'
  ]
  
  return lines.join('\n')
}

// Export meta information
export const INTEGRATION_META = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  supportedDataSources: [
    'Hot Pepper Beauty (via CSV)',
    'Salon Board CSV Export',
    'Manual CSV Import'
  ],
  features: [
    'CSV file import and validation',
    'Intelligent customer matching',
    'Duplicate detection',
    'Data integration statistics',
    'Up to 1 year historical data support',
    'Revenue analysis by source'
  ],
  limitations: [
    'No real-time API access (Hot Pepper API discontinued 2017)',
    'Manual CSV export required from Salon Board',
    'Customer matching based on name/phone similarity',
    'Requires manual review for duplicate reservations'
  ]
}