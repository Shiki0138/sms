// IDジェネレーター
export const generateTenantId = (): string => {
  return `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateStaffId = (): string => {
  return `staff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateCustomerId = (): string => {
  return `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateReservationId = (): string => {
  return `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const generateTestId = (prefix: string): string => {
  return `${prefix}_test_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
}