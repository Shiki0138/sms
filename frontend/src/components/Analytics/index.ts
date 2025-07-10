// Analytics Components Export Index
// Team C - Marketing Analytics Features Implementation

// Main Analytics Hub
export { default as AnalyticsHub } from './AnalyticsHub'

// Core Analysis Components
export { default as RFMAnalysis } from './RFMAnalysis'
export { default as CohortAnalysis } from './CohortAnalysis'
export { default as LTVAnalysis } from './LTVAnalysis'
export { default as SalesDashboard } from './SalesDashboard'
export { default as MarketingAISuggestions } from './MarketingAISuggestions'

// Utility Components
export { default as ReportExporter } from './ReportExporter'
export { default as OptimizedChartConfig } from './OptimizedChartConfig'

// Optimized Chart Components
export {
  OptimizedLineChart,
  OptimizedBarChart,
  OptimizedDoughnutChart,
  MemoizedLineChart,
  MemoizedBarChart,
  MemoizedDoughnutChart,
  CHART_COLORS,
  getBaseChartOptions,
  optimizeChartData,
  sampleData,
  generateColors,
  createGradient,
  formatters,
  useChartPerformance
} from './OptimizedChartConfig'

// TypeScript Interfaces
export interface Customer {
  id: string
  customerNumber: string
  name: string
  visitCount: number
  lastVisitDate?: string
  createdAt: string
}

export interface Reservation {
  id: string
  startTime: string
  customerName: string
  customer?: {
    id: string
    name: string
  }
  status: 'COMPLETED' | 'TENTATIVE' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'
  price?: number
}

export interface ServiceHistory {
  id: string
  customerId: string
  customerName: string
  staffId: string
  staffName: string
  serviceType: string
  serviceDetails: string
  price: number
  date: string
  duration: number
  satisfactionRating?: number
}

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  // Chart performance settings
  MAX_DATA_POINTS: 100,
  ANIMATION_DURATION: 750,
  
  // Color schemes
  BRAND_COLORS: {
    primary: '#3B82F6',
    secondary: '#10B981',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#6366F1'
  },
  
  // RFM Analysis settings
  RFM_SEGMENTS: {
    'Champions': { priority: 'high', color: '#22C55E' },
    'Loyal Customers': { priority: 'high', color: '#3B82F6' },
    'Potential Loyalists': { priority: 'medium', color: '#8B5CF6' },
    'New Customers': { priority: 'medium', color: '#06B6D4' },
    'At Risk': { priority: 'high', color: '#F59E0B' },
    "Can't Lose Them": { priority: 'high', color: '#EF4444' },
    'Promising': { priority: 'medium', color: '#6366F1' },
    'Need Attention': { priority: 'medium', color: '#F59E0B' },
    'Lost Customers': { priority: 'low', color: '#6B7280' }
  },
  
  // LTV Analysis settings
  LTV_TIERS: {
    'Platinum': { threshold: 100000, color: '#8B5CF6' },
    'Gold': { threshold: 50000, color: '#F59E0B' },
    'Silver': { threshold: 25000, color: '#6B7280' },
    'Bronze': { threshold: 10000, color: '#CD7C2F' },
    'Basic': { threshold: 0, color: '#3B82F6' }
  },
  
  // Cohort Analysis settings
  RETENTION_THRESHOLDS: {
    excellent: 80,
    good: 60,
    average: 40,
    poor: 20
  },
  
  // Export settings
  EXPORT_FORMATS: ['pdf', 'excel'] as const,
  REPORT_TYPES: [
    'comprehensive',
    'rfm',
    'cohort', 
    'ltv',
    'sales',
    'marketing'
  ] as const
}

// Utility functions
export const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString()}`
}

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`
}

export const formatNumber = (value: number): string => {
  return value.toLocaleString()
}

export const calculateRetentionRate = (retained: number, total: number): number => {
  return total > 0 ? (retained / total) * 100 : 0
}

export const getRetentionColor = (rate: number): string => {
  const { RETENTION_THRESHOLDS } = ANALYTICS_CONFIG
  if (rate >= RETENTION_THRESHOLDS.excellent) return 'text-green-600'
  if (rate >= RETENTION_THRESHOLDS.good) return 'text-blue-600'
  if (rate >= RETENTION_THRESHOLDS.average) return 'text-yellow-600'
  if (rate >= RETENTION_THRESHOLDS.poor) return 'text-orange-600'
  return 'text-red-600'
}

// Performance optimization utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Analytics meta information
export const ANALYTICS_META = {
  version: '1.0.0',
  author: 'Team C',
  description: 'Advanced marketing analytics suite for salon management system',
  features: [
    'RFM Analysis (Recency, Frequency, Monetary)',
    'Cohort Analysis for customer retention tracking',
    'LTV (Lifetime Value) calculation and prediction',
    'Sales performance dashboard with Chart.js',
    'AI-powered marketing campaign suggestions',
    'PDF/Excel report export functionality',
    'Performance-optimized chart rendering'
  ],
  lastUpdated: new Date().toISOString()
}