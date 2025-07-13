import { useState, useEffect } from 'react';
import { format, getDay } from 'date-fns';

interface BusinessHours {
  [key: string]: {
    isOpen: boolean;
    openTime: string;
    closeTime: string;
  };
}

interface RegularHoliday {
  dayOfWeek: number;
  weekNumbers: number[];
}

interface SpecialHoliday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const defaultBusinessHours: BusinessHours = {
  sunday: { isOpen: false, openTime: '10:00', closeTime: '19:00' },
  monday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
  tuesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
  wednesday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
  thursday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
  friday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
  saturday: { isOpen: true, openTime: '10:00', closeTime: '19:00' },
};

export function useBusinessHours() {
  const [businessHours, setBusinessHours] = useState<BusinessHours>(defaultBusinessHours);
  const [regularHolidays, setRegularHolidays] = useState<RegularHoliday[]>([]);
  const [specialHolidays, setSpecialHolidays] = useState<SpecialHoliday[]>([]);
  const [allowOutOfHoursBooking, setAllowOutOfHoursBooking] = useState(false);

  useEffect(() => {
    // API から営業時間設定を取得
    // 実装時に追加
  }, []);

  const isHoliday = (date: Date): boolean => {
    // 特別休業日チェック
    const dateStr = format(date, 'yyyy-MM-dd');
    const isSpecialHoliday = specialHolidays.some(holiday => {
      return dateStr >= holiday.startDate && dateStr <= holiday.endDate;
    });
    if (isSpecialHoliday) return true;

    // 定休日チェック
    const dayOfWeek = getDay(date);
    const weekNumber = Math.ceil(date.getDate() / 7);
    
    return regularHolidays.some(holiday => {
      return holiday.dayOfWeek === dayOfWeek && holiday.weekNumbers.includes(weekNumber);
    });
  };

  const getHolidayType = (date: Date): string | null => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // 特別休業日チェック
    const specialHoliday = specialHolidays.find(holiday => {
      return dateStr >= holiday.startDate && dateStr <= holiday.endDate;
    });
    if (specialHoliday) {
      return specialHoliday.name || '特別休業日';
    }

    // 定休日チェック
    const dayOfWeek = getDay(date);
    const weekNumber = Math.ceil(date.getDate() / 7);
    
    const regularHoliday = regularHolidays.find(holiday => {
      return holiday.dayOfWeek === dayOfWeek && holiday.weekNumbers.includes(weekNumber);
    });
    
    if (regularHoliday) {
      const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
      const weekNames = ['第1', '第2', '第3', '第4', '第5'];
      const weeks = regularHoliday.weekNumbers.map(w => weekNames[w - 1]).join('・');
      return `定休日（${weeks}${dayNames[dayOfWeek]}曜日）`;
    }

    return null;
  };

  const getDayBusinessHours = (date: Date) => {
    const dayOfWeek = getDay(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[dayOfWeek];
    
    if (isHoliday(date)) {
      return { isOpen: false, openTime: '', closeTime: '' };
    }
    
    return businessHours[dayName];
  };

  const isTimeInBusinessHours = (date: Date, hour: number, minute: number): boolean => {
    const dayHours = getDayBusinessHours(date);
    if (!dayHours || !dayHours.isOpen) return false;

    const [openHour, openMinute] = dayHours.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = dayHours.closeTime.split(':').map(Number);
    
    const currentMinutes = hour * 60 + minute;
    const openMinutes = openHour * 60 + openMinute;
    const closeMinutes = closeHour * 60 + closeMinute;
    
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
  };

  return {
    businessHours,
    regularHolidays,
    specialHolidays,
    allowOutOfHoursBooking,
    isHoliday,
    getHolidayType,
    getDayBusinessHours,
    isTimeInBusinessHours,
    setBusinessHours,
    setRegularHolidays,
    setSpecialHolidays,
    setAllowOutOfHoursBooking,
  };
}