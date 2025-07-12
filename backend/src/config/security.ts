/**
 * Security Configuration
 * 
 * This file contains all security-related configuration settings
 * for the Salon Management System.
 */

export const SecurityConfig = {
  // Authentication settings
  auth: {
    // JWT settings
    jwt: {
      accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
      refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
      issuer: 'salon-management-system',
      audience: 'salon-api-users',
    },
    
    // Session settings
    session: {
      maxAge: 15 * 60 * 1000, // 15 minutes
      regenerateOnAuth: true,
      rollingSession: true,
    },
    
    // Password policy
    password: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxRepeatingChars: 2,
      preventCommonPasswords: true,
      preventPasswordReuse: 5, // Last 5 passwords
    },
    
    // Account lockout policy
    lockout: {
      maxFailedAttempts: 5,
      lockoutDuration: 30 * 60 * 1000, // 30 minutes
      automaticUnlock: true,
    },
  },
  
  // Rate limiting configuration
  rateLimit: {
    // Authentication endpoints
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 login attempts
    },
    
    // General API endpoints
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100, // 100 requests
    },
    
    // Strict rate limiting for sensitive operations
    strict: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10, // 10 requests
    },
    
    // File upload endpoints
    upload: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 5, // 5 uploads
    },
  },
  
  // Security headers configuration
  headers: {
    csp: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", "ws:", "wss:"],
        frameAncestors: ["'none'"],
      },
    },
    
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  },
  
  // Input validation settings
  validation: {
    maxJsonSize: '10mb',
    maxUrlEncodedSize: '10mb',
    maxFieldsCount: 1000,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  
  // Encryption settings
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
  },
  
  // Audit logging configuration
  audit: {
    // Log retention period
    retentionDays: 365, // 1 year
    
    // Events to always log
    criticalEvents: [
      'LOGIN_ATTEMPT',
      'LOGIN_SUCCESS',
      'LOGIN_FAILURE',
      'LOGOUT',
      'PASSWORD_CHANGE',
      'ACCOUNT_LOCKED',
      'ACCOUNT_UNLOCKED',
      'PERMISSION_DENIED',
      'DATA_EXPORT',
      'SYSTEM_CONFIG_CHANGE',
      'USER_CREATED',
      'USER_DELETED',
      'ROLE_CHANGED',
    ],
    
    // Include sensitive data in logs
    logSensitiveData: false,
    
    // Automatically alert on suspicious activities
    alertThresholds: {
      failedLogins: 10, // Alert after 10 failed logins from same IP
      dataExports: 5, // Alert after 5 data exports in 1 hour
      adminActions: 20, // Alert after 20 admin actions in 1 hour
    },
  },
  
  // Session security
  session: {
    // Force re-authentication for sensitive operations
    sensitiveOperations: [
      'password-change',
      'user-delete',
      'system-config',
      'data-export',
    ],
    
    // Session invalidation triggers
    invalidateOn: [
      'password-change',
      'role-change',
      'suspicious-activity',
    ],
    
    // Concurrent session limits
    maxConcurrentSessions: 3,
  },
  
  // Two-Factor Authentication
  twoFactor: {
    // TOTP settings
    totp: {
      window: 2, // Allow 2 time steps before/after current
      step: 30, // 30 seconds per time step
      digits: 6, // 6-digit codes
    },
    
    // Backup codes
    backupCodes: {
      count: 10, // Generate 10 backup codes
      length: 8, // 8 characters per code
      regenerateOnUse: false, // Don't auto-regenerate
    },
    
    // Recovery settings
    recovery: {
      requireAdminApproval: true,
      temporaryDisableDuration: 24 * 60 * 60 * 1000, // 24 hours
    },
  },
  
  // API Security
  api: {
    // CORS settings
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? (process.env.ALLOWED_ORIGINS?.split(',') || [])
        : ['http://localhost:5173', 'http://localhost:3000'],
      maxAge: 86400, // 24 hours
      credentials: true,
      optionsSuccessStatus: 200,
    },
    
    // Request size limits
    limits: {
      json: '10mb',
      urlencoded: '10mb',
      multipart: '50mb',
    },
    
    // Webhook security
    webhooks: {
      verifySignatures: true,
      maxPayloadSize: '1mb',
      timeoutMs: 30000, // 30 seconds
    },
  },
  
  // Data Protection
  dataProtection: {
    // Encryption at rest
    encryptSensitiveFields: true,
    
    // Data retention policies
    retention: {
      auditLogs: 365, // days
      sessionData: 30, // days
      temporaryFiles: 7, // days
    },
    
    // PII handling
    pii: {
      maskInLogs: true,
      requireConsentForCollection: true,
      allowDataExport: true,
      allowDataDeletion: true,
    },
  },
  
  // Monitoring and Alerting
  monitoring: {
    // Security events to monitor
    events: [
      'multiple_failed_logins',
      'suspicious_user_agent',
      'unusual_access_patterns',
      'privilege_escalation_attempts',
      'data_breach_indicators',
    ],
    
    // Real-time alerting
    alerts: {
      email: process.env.SECURITY_ALERT_EMAIL,
      webhook: process.env.SECURITY_ALERT_WEBHOOK,
      immediateThreshold: 'HIGH', // Alert immediately for HIGH+ severity
    },
  },
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  SecurityConfig.auth.password.minLength = 8;
  SecurityConfig.rateLimit.auth.maxRequests = 20;
  SecurityConfig.audit.logSensitiveData = true;
}

if (process.env.NODE_ENV === 'production') {
  SecurityConfig.headers.csp.directives.scriptSrc = ["'self'"];
  SecurityConfig.session.maxConcurrentSessions = 2;
  SecurityConfig.dataProtection.encryptSensitiveFields = true;
}

export default SecurityConfig;