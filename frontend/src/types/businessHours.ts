// 営業時間関連の型定義

export interface BusinessHours {
  dayOfWeek: number; // 0-6 (日-土)
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface WeeklyClosedDay {
  dayOfWeek: number; // 0-6 (日-土)
}

export interface RegularHoliday {
  id: string;
  dayOfWeek: number; // 0-6 (日-土)
  weekNumbers: number[]; // 第何週 [1,2,3,4,5]
  isActive: boolean;
}

export interface SpecialHoliday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  allowBooking: boolean; // 休日でも予約を許可するか
}

export interface BookingSettings {
  allowOutOfHoursBooking: boolean;
  outOfHoursWarningMessage: string;
  allowHolidayBooking: boolean;
  holidayWarningMessage: string;
}

export interface BusinessHoursSettings {
  businessHours: BusinessHours[];
  weeklyClosedDays: number[];
  regularHolidays: RegularHoliday[];
  specialHolidays: SpecialHoliday[];
  bookingSettings: BookingSettings;
}

export type HolidayType = 'weekly' | 'regular' | 'special';

export interface HolidayInfo {
  date: string;
  type: HolidayType;
  name?: string;
  description?: string;
  allowBooking: boolean;
}