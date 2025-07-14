import { supabase } from '../config/supabase';
import { getDay, getWeekOfMonth, format } from 'date-fns';

export interface BusinessHours {
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface RegularHoliday {
  id: string;
  dayOfWeek: number;
  weekNumbers: number[];
  isActive: boolean;
}

export interface SpecialHoliday {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  allowBooking: boolean;
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

export interface HolidayInfo {
  date: string;
  type: 'weekly' | 'regular' | 'special';
  name: string;
  description?: string;
  allowBooking: boolean;
}

class BusinessHoursService {
  // 営業時間・休日設定を取得
  async getBusinessHoursSettings(salonId: string): Promise<BusinessHoursSettings> {
    try {
      // 営業時間を取得
      const { data: businessHours, error: hoursError } = await supabase
        .from('business_hours')
        .select('*')
        .eq('salon_id', salonId)
        .order('day_of_week');

      if (hoursError) throw hoursError;

      // 毎週の定休日を取得
      const { data: weeklyClosedDays, error: weeklyError } = await supabase
        .from('weekly_closed_days')
        .select('day_of_week')
        .eq('salon_id', salonId);

      if (weeklyError) throw weeklyError;

      // 定期休日を取得
      const { data: regularHolidays, error: regularError } = await supabase
        .from('regular_holidays')
        .select('*')
        .eq('salon_id', salonId)
        .eq('is_active', true);

      if (regularError) throw regularError;

      // 特別休日を取得
      const { data: specialHolidays, error: specialError } = await supabase
        .from('special_holidays')
        .select('*')
        .eq('salon_id', salonId)
        .gte('end_date', format(new Date(), 'yyyy-MM-dd')) // 期限切れを除外
        .order('start_date');

      if (specialError) throw specialError;

      // 予約設定を取得
      const { data: bookingSettings, error: settingsError } = await supabase
        .from('booking_settings')
        .select('*')
        .eq('salon_id', salonId)
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

      // デフォルト値を設定
      const defaultBusinessHours: BusinessHours[] = [];
      for (let i = 0; i < 7; i++) {
        const existingHours = businessHours?.find(h => h.day_of_week === i);
        defaultBusinessHours.push({
          dayOfWeek: i,
          isOpen: existingHours?.is_open ?? (i !== 0), // 日曜日以外は営業
          openTime: existingHours?.open_time || '10:00',
          closeTime: existingHours?.close_time || '19:00'
        });
      }

      return {
        businessHours: defaultBusinessHours,
        weeklyClosedDays: weeklyClosedDays?.map(d => d.day_of_week) || [],
        regularHolidays: regularHolidays?.map(h => ({
          id: h.id,
          dayOfWeek: h.day_of_week,
          weekNumbers: h.week_numbers,
          isActive: h.is_active
        })) || [],
        specialHolidays: specialHolidays?.map(h => ({
          id: h.id,
          name: h.name,
          startDate: h.start_date,
          endDate: h.end_date,
          description: h.description,
          allowBooking: h.allow_booking
        })) || [],
        bookingSettings: bookingSettings || {
          allowOutOfHoursBooking: false,
          outOfHoursWarningMessage: '営業時間外のご予約です。確認後、スタッフから連絡させていただく場合があります。',
          allowHolidayBooking: false,
          holidayWarningMessage: '休業日のご予約です。特別に対応可能か確認後、ご連絡させていただきます。'
        }
      };
    } catch (error) {
      console.error('営業時間設定取得エラー:', error);
      throw error;
    }
  }

  // 営業時間・休日設定を更新
  async updateBusinessHoursSettings(salonId: string, settings: BusinessHoursSettings): Promise<BusinessHoursSettings> {
    try {
      // トランザクション的に更新
      
      // 1. 営業時間を更新
      for (const hours of settings.businessHours) {
        await supabase
          .from('business_hours')
          .upsert({
            salon_id: salonId,
            day_of_week: hours.dayOfWeek,
            is_open: hours.isOpen,
            open_time: hours.openTime,
            close_time: hours.closeTime
          }, {
            onConflict: 'salon_id,day_of_week'
          });
      }

      // 2. 毎週の定休日を更新
      await supabase
        .from('weekly_closed_days')
        .delete()
        .eq('salon_id', salonId);

      if (settings.weeklyClosedDays.length > 0) {
        const weeklyClosedData = settings.weeklyClosedDays.map(day => ({
          salon_id: salonId,
          day_of_week: day
        }));
        
        await supabase
          .from('weekly_closed_days')
          .insert(weeklyClosedData);
      }

      // 3. 定期休日を更新
      await supabase
        .from('regular_holidays')
        .delete()
        .eq('salon_id', salonId);

      if (settings.regularHolidays.length > 0) {
        const regularHolidayData = settings.regularHolidays.map(holiday => ({
          salon_id: salonId,
          day_of_week: holiday.dayOfWeek,
          week_numbers: holiday.weekNumbers,
          is_active: holiday.isActive
        }));
        
        await supabase
          .from('regular_holidays')
          .insert(regularHolidayData);
      }

      // 4. 特別休日を更新（既存のものは保持、新規追加・更新のみ）
      for (const holiday of settings.specialHolidays) {
        if (holiday.id && holiday.id.startsWith('temp_')) {
          // 新規追加
          await supabase
            .from('special_holidays')
            .insert({
              salon_id: salonId,
              name: holiday.name,
              start_date: holiday.startDate,
              end_date: holiday.endDate,
              description: holiday.description,
              allow_booking: holiday.allowBooking
            });
        } else {
          // 既存更新
          await supabase
            .from('special_holidays')
            .update({
              name: holiday.name,
              start_date: holiday.startDate,
              end_date: holiday.endDate,
              description: holiday.description,
              allow_booking: holiday.allowBooking
            })
            .eq('id', holiday.id);
        }
      }

      // 5. 予約設定を更新
      await supabase
        .from('booking_settings')
        .upsert({
          salon_id: salonId,
          allow_out_of_hours_booking: settings.bookingSettings.allowOutOfHoursBooking,
          out_of_hours_warning_message: settings.bookingSettings.outOfHoursWarningMessage,
          allow_holiday_booking: settings.bookingSettings.allowHolidayBooking,
          holiday_warning_message: settings.bookingSettings.holidayWarningMessage
        }, {
          onConflict: 'salon_id'
        });

      // 更新後の設定を返す
      return await this.getBusinessHoursSettings(salonId);
    } catch (error) {
      console.error('営業時間設定更新エラー:', error);
      throw error;
    }
  }

  // 特定日が休日かどうかをチェック
  async checkIfHoliday(salonId: string, date: Date): Promise<HolidayInfo | null> {
    try {
      const settings = await this.getBusinessHoursSettings(salonId);
      const dayOfWeek = getDay(date);
      const dateStr = format(date, 'yyyy-MM-dd');

      // 毎週の定休日チェック
      if (settings.weeklyClosedDays.includes(dayOfWeek)) {
        return {
          date: dateStr,
          type: 'weekly',
          name: `定休日（毎週${['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]}曜日）`,
          allowBooking: settings.bookingSettings.allowHolidayBooking
        };
      }

      // 定期休日チェック
      for (const holiday of settings.regularHolidays) {
        if (holiday.isActive && dayOfWeek === holiday.dayOfWeek) {
          const weekOfMonth = getWeekOfMonth(date, { weekStartsOn: 1 });
          if (holiday.weekNumbers.includes(weekOfMonth)) {
            const nthText = holiday.weekNumbers.map(n => `第${n}`).join('・');
            return {
              date: dateStr,
              type: 'regular',
              name: `定休日（${nthText}${['日', '月', '火', '水', '木', '金', '土'][dayOfWeek]}曜日）`,
              allowBooking: settings.bookingSettings.allowHolidayBooking
            };
          }
        }
      }

      // 特別休日チェック
      for (const holiday of settings.specialHolidays) {
        if (dateStr >= holiday.startDate && dateStr <= holiday.endDate) {
          return {
            date: dateStr,
            type: 'special',
            name: holiday.name || '特別休業日',
            description: holiday.description,
            allowBooking: holiday.allowBooking || settings.bookingSettings.allowHolidayBooking
          };
        }
      }

      return null;
    } catch (error) {
      console.error('休日チェックエラー:', error);
      throw error;
    }
  }

  // 特定期間の休日一覧を取得
  async getHolidaysInRange(salonId: string, startDate: Date, endDate: Date): Promise<HolidayInfo[]> {
    try {
      const holidays: HolidayInfo[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const holidayInfo = await this.checkIfHoliday(salonId, currentDate);
        if (holidayInfo) {
          holidays.push(holidayInfo);
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return holidays;
    } catch (error) {
      console.error('休日一覧取得エラー:', error);
      throw error;
    }
  }
}

export default BusinessHoursService;