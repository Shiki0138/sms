// Analytics Components Export Index
// Team C - Marketing Analytics Features Implementation
// Main Analytics Hub
export { default as AnalyticsHub } from './AnalyticsHub';
// Core Analysis Components
export { default as RFMAnalysis } from './RFMAnalysis';
export { default as CohortAnalysis } from './CohortAnalysis';
export { default as LTVAnalysis } from './LTVAnalysis';
export { default as SalesDashboard } from './SalesDashboard';
export { default as MarketingAISuggestions } from './MarketingAISuggestions';
// Utility Components
export { default as ReportExporter } from './ReportExporter';
export { default as OptimizedChartConfig } from './OptimizedChartConfig';
// Optimized Chart Components
export { OptimizedLineChart, OptimizedBarChart, OptimizedDoughnutChart, MemoizedLineChart, MemoizedBarChart, MemoizedDoughnutChart, CHART_COLORS, getBaseChartOptions, optimizeChartData, sampleData, generateColors, createGradient, formatters, useChartPerformance } from './OptimizedChartConfig';
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
    EXPORT_FORMATS: ['pdf', 'excel'],
    REPORT_TYPES: [
        'comprehensive',
        'rfm',
        'cohort',
        'ltv',
        'sales',
        'marketing'
    ]
};
// Utility functions
export const formatCurrency = (amount) => {
    return `¥${amount.toLocaleString()}`;
};
export const formatPercentage = (value, decimals = 1) => {
    return `${value.toFixed(decimals)}%`;
};
export const formatNumber = (value) => {
    return value.toLocaleString();
};
export const calculateRetentionRate = (retained, total) => {
    return total > 0 ? (retained / total) * 100 : 0;
};
export const getRetentionColor = (rate) => {
    const { RETENTION_THRESHOLDS } = ANALYTICS_CONFIG;
    if (rate >= RETENTION_THRESHOLDS.excellent)
        return 'text-green-600';
    if (rate >= RETENTION_THRESHOLDS.good)
        return 'text-blue-600';
    if (rate >= RETENTION_THRESHOLDS.average)
        return 'text-yellow-600';
    if (rate >= RETENTION_THRESHOLDS.poor)
        return 'text-orange-600';
    return 'text-red-600';
};
// Performance optimization utilities
export const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(null, args), wait);
    };
};
export const throttle = (func, limit) => {
    let inThrottle;
    return (...args) => {
        if (!inThrottle) {
            func.apply(null, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
};
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
};
