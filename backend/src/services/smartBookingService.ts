import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface StaffSkill {
  id: string;
  name: string;
  skillLevel: number; // 1-5
  menuTypes: string[];
  efficiency: number; // 0.5-2.0 (time multiplier)
}

export interface OptimizationConstraints {
  workingHours: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
  breakTimes: Array<{
    start: string;
    end: string;
  }>;
  setupTime: number; // minutes between appointments
  maxConsecutiveBookings: number;
}

export interface BookingRequest {
  menuContent: string;
  estimatedDuration: number; // minutes
  preferredDate: Date;
  preferredTimeRange?: {
    start: string;
    end: string;
  };
  customerId?: string;
  customerPriority: 'VIP' | 'REGULAR' | 'NEW';
  flexibility: number; // 0-1, how flexible the customer is with timing
}

export interface OptimalBookingSuggestion {
  startTime: Date;
  endTime: Date;
  staffId: string;
  staffName: string;
  confidence: number; // 0-1
  reasons: string[];
  alternativeSlots?: Array<{
    startTime: Date;
    endTime: Date;
    staffId: string;
    confidence: number;
  }>;
}

export interface DemandPrediction {
  date: Date;
  hourlyDemand: Array<{
    hour: number;
    predictedBookings: number;
    confidence: number;
  }>;
  totalPredicted: number;
  trends: {
    seasonal: number;
    weeklyPattern: number;
    monthlyTrend: number;
  };
}

export interface NoShowPrediction {
  customerId: string;
  probability: number; // 0-1
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
}

export class SmartBookingService {
  private tenantId: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }

  /**
   * Optimize booking suggestions using genetic algorithm approach
   */
  async optimizeBooking(request: BookingRequest): Promise<OptimalBookingSuggestion[]> {
    try {
      logger.info('Starting booking optimization', { 
        tenantId: this.tenantId, 
        request: { ...request, preferredDate: request.preferredDate.toISOString() }
      });

      // Get available staff and their skills
      const availableStaff = await this.getAvailableStaff(request.preferredDate);
      
      // Get existing reservations for the day
      const existingReservations = await this.getExistingReservations(request.preferredDate);
      
      // Calculate staff suitability scores
      const staffSuitability = this.calculateStaffSuitability(availableStaff, request);
      
      // Find optimal time slots
      const suggestions = await this.findOptimalTimeSlots(
        request,
        staffSuitability,
        existingReservations
      );

      logger.info('Booking optimization completed', { 
        tenantId: this.tenantId, 
        suggestionsCount: suggestions.length 
      });

      return suggestions;

    } catch (error) {
      logger.error('Booking optimization failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
        request
      });
      throw error;
    }
  }

  /**
   * Predict no-show probability for a customer
   */
  async predictNoShow(customerId: string, reservationDate: Date): Promise<NoShowPrediction> {
    try {
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, tenantId: this.tenantId },
        include: {
          reservations: {
            orderBy: { startTime: 'desc' },
            take: 50
          }
        }
      });

      if (!customer || !customer.reservations.length) {
        return {
          customerId,
          probability: 0.3, // Default baseline
          factors: [{ factor: 'NEW_CUSTOMER', impact: 0.3, description: '新規顧客のため履歴データなし' }],
          recommendations: ['事前確認の電話を推奨']
        };
      }

      const factors: Array<{ factor: string; impact: number; description: string }> = [];
      let probability = 0.1; // Base probability

      // Historical no-show rate
      const noShowCount = customer.reservations.filter(r => r.status === 'NO_SHOW').length;
      const totalReservations = customer.reservations.length;
      const historicalNoShowRate = noShowCount / totalReservations;
      
      if (historicalNoShowRate > 0) {
        const impact = Math.min(historicalNoShowRate * 0.8, 0.5);
        probability += impact;
        factors.push({
          factor: 'HISTORICAL_NO_SHOW',
          impact,
          description: `過去のノーショー率: ${Math.round(historicalNoShowRate * 100)}%`
        });
      }

      // Recent cancellation pattern
      const recentReservations = customer.reservations.slice(0, 10);
      const recentCancellations = recentReservations.filter(r => 
        r.status === 'CANCELLED' || r.status === 'NO_SHOW'
      ).length;
      
      if (recentCancellations > 3) {
        const impact = Math.min(recentCancellations * 0.05, 0.2);
        probability += impact;
        factors.push({
          factor: 'RECENT_CANCELLATIONS',
          impact,
          description: `最近10回中${recentCancellations}回のキャンセル`
        });
      }

      // Day of week pattern
      const dayOfWeek = reservationDate.getDay();
      const dayPatterns = await this.analyzeDayOfWeekPatterns(customerId);
      if (dayPatterns[dayOfWeek] && dayPatterns[dayOfWeek].noShowRate > 0.2) {
        const impact = (dayPatterns[dayOfWeek].noShowRate - 0.2) * 0.3;
        probability += impact;
        factors.push({
          factor: 'DAY_PATTERN',
          impact,
          description: `${this.getDayName(dayOfWeek)}のノーショー傾向`
        });
      }

      // Time since last visit
      const daysSinceLastVisit = customer.lastVisitDate 
        ? Math.floor((Date.now() - customer.lastVisitDate.getTime()) / (1000 * 60 * 60 * 24))
        : 365;
      
      if (daysSinceLastVisit > 90) {
        const impact = Math.min((daysSinceLastVisit - 90) * 0.001, 0.2);
        probability += impact;
        factors.push({
          factor: 'LONG_ABSENCE',
          impact,
          description: `前回来店から${daysSinceLastVisit}日経過`
        });
      }

      // Weather and seasonal factors (simplified)
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekend) {
        probability -= 0.05; // Weekend bookings tend to be more reliable
        factors.push({
          factor: 'WEEKEND_BOOKING',
          impact: -0.05,
          description: '週末予約は比較的安定'
        });
      }

      // Generate recommendations
      const recommendations: string[] = [];
      if (probability > 0.4) {
        recommendations.push('予約前日に確認電話必須');
        recommendations.push('代替候補日時の事前確認');
      } else if (probability > 0.25) {
        recommendations.push('予約前日にSMS/LINE確認');
      }
      
      if (customer.visitCount < 3) {
        recommendations.push('新規顧客向け特別対応');
      }

      return {
        customerId,
        probability: Math.min(probability, 0.9),
        factors,
        recommendations
      };

    } catch (error) {
      logger.error('No-show prediction failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId,
        customerId
      });
      throw error;
    }
  }

  /**
   * Predict demand for a specific date range
   */
  async predictDemand(startDate: Date, endDate: Date): Promise<DemandPrediction[]> {
    try {
      const predictions: DemandPrediction[] = [];
      const historicalData = await this.getHistoricalBookingData(startDate, endDate);
      
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const month = currentDate.getMonth();
        
        // Analyze historical patterns
        const sameWeekdayData = historicalData.filter(d => d.dayOfWeek === dayOfWeek);
        const sameMonthData = historicalData.filter(d => d.month === month);
        
        // Calculate hourly demand
        const hourlyDemand = [];
        for (let hour = 9; hour <= 18; hour++) {
          const historicalCount = sameWeekdayData.reduce((sum, d) => 
            sum + (d.hourlyBookings[hour] || 0), 0
          );
          const avgDemand = historicalCount / Math.max(sameWeekdayData.length, 1);
          
          // Apply seasonal and trend adjustments
          const seasonalFactor = this.getSeasonalFactor(month, dayOfWeek);
          const trendFactor = this.getTrendFactor(currentDate);
          
          const predictedBookings = Math.round(avgDemand * seasonalFactor * trendFactor);
          const confidence = Math.min(sameWeekdayData.length / 20, 1); // More data = higher confidence
          
          hourlyDemand.push({
            hour,
            predictedBookings: Math.max(0, predictedBookings),
            confidence
          });
        }
        
        const totalPredicted = hourlyDemand.reduce((sum, h) => sum + h.predictedBookings, 0);
        
        predictions.push({
          date: new Date(currentDate),
          hourlyDemand,
          totalPredicted,
          trends: {
            seasonal: this.getSeasonalFactor(month, dayOfWeek),
            weeklyPattern: this.getWeeklyPattern(dayOfWeek),
            monthlyTrend: this.getTrendFactor(currentDate)
          }
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return predictions;

    } catch (error) {
      logger.error('Demand prediction failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId
      });
      throw error;
    }
  }

  /**
   * Get availability analysis for a specific date
   */
  async getAvailabilityAnalysis(date: Date): Promise<{
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
    utilization: number;
    staffUtilization: Array<{
      staffId: string;
      staffName: string;
      utilization: number;
      availableSlots: number;
    }>;
    peakHours: Array<{ hour: number; bookings: number }>;
  }> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all staff
      const staff = await prisma.staff.findMany({
        where: { tenantId: this.tenantId, isActive: true }
      });

      // Get reservations for the day
      const reservations = await prisma.reservation.findMany({
        where: {
          tenantId: this.tenantId,
          startTime: { gte: startOfDay, lte: endOfDay },
          status: { in: ['CONFIRMED', 'TENTATIVE'] }
        },
        include: { staff: true }
      });

      // Calculate metrics
      const workingHours = 9; // 9 AM to 6 PM
      const slotsPerHour = 2; // 30-minute slots
      const totalSlots = staff.length * workingHours * slotsPerHour;
      const bookedSlots = reservations.length;
      const availableSlots = totalSlots - bookedSlots;
      const utilization = totalSlots > 0 ? bookedSlots / totalSlots : 0;

      // Staff utilization
      const staffUtilization = staff.map(s => {
        const staffReservations = reservations.filter(r => r.staffId === s.id);
        const staffSlots = workingHours * slotsPerHour;
        const staffBookedSlots = staffReservations.length;
        
        return {
          staffId: s.id,
          staffName: s.name,
          utilization: staffSlots > 0 ? staffBookedSlots / staffSlots : 0,
          availableSlots: staffSlots - staffBookedSlots
        };
      });

      // Peak hours analysis
      const hourlyBookings = new Array(24).fill(0);
      reservations.forEach(r => {
        const hour = r.startTime.getHours();
        hourlyBookings[hour]++;
      });

      const peakHours = hourlyBookings
        .map((bookings, hour) => ({ hour, bookings }))
        .filter(h => h.bookings > 0)
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 5);

      return {
        totalSlots,
        bookedSlots,
        availableSlots,
        utilization,
        staffUtilization,
        peakHours
      };

    } catch (error) {
      logger.error('Availability analysis failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        tenantId: this.tenantId
      });
      throw error;
    }
  }

  // Private helper methods

  private async getAvailableStaff(date: Date) {
    return await prisma.staff.findMany({
      where: { 
        tenantId: this.tenantId, 
        isActive: true 
      }
    });
  }

  private async getExistingReservations(date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await prisma.reservation.findMany({
      where: {
        tenantId: this.tenantId,
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { in: ['CONFIRMED', 'TENTATIVE'] }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  private calculateStaffSuitability(staff: any[], request: BookingRequest) {
    return staff.map(s => ({
      ...s,
      suitabilityScore: this.calculateSuitabilityScore(s, request)
    })).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  private calculateSuitabilityScore(staff: any, request: BookingRequest): number {
    let score = 0.5; // Base score

    // Skill matching (simplified - would need menu-staff skill mapping)
    if (request.menuContent.includes('カット')) {
      score += 0.3; // Assume all staff can cut
    }
    if (request.menuContent.includes('カラー')) {
      score += 0.2; // Color specialist bonus
    }
    if (request.menuContent.includes('パーマ')) {
      score += 0.1; // Perm specialist bonus
    }

    // Customer priority bonus
    if (request.customerPriority === 'VIP') {
      score += 0.2; // Assign best staff to VIP
    }

    return Math.min(score, 1.0);
  }

  private async findOptimalTimeSlots(
    request: BookingRequest,
    staffSuitability: any[],
    existingReservations: any[]
  ): Promise<OptimalBookingSuggestion[]> {
    const suggestions: OptimalBookingSuggestion[] = [];
    const workingHours = { start: 9, end: 18 }; // 9 AM to 6 PM
    const slotDuration = 30; // 30-minute slots

    for (const staff of staffSuitability.slice(0, 3)) { // Top 3 suitable staff
      const staffReservations = existingReservations.filter(r => r.staffId === staff.id);
      
      // Generate time slots for the day
      for (let hour = workingHours.start; hour < workingHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          const startTime = new Date(request.preferredDate);
          startTime.setHours(hour, minute, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + request.estimatedDuration);

          // Check if slot is available
          if (this.isSlotAvailable(startTime, endTime, staffReservations)) {
            const confidence = this.calculateSlotConfidence(
              startTime,
              staff,
              request,
              staffReservations
            );

            if (confidence > 0.3) { // Only suggest slots with reasonable confidence
              suggestions.push({
                startTime,
                endTime,
                staffId: staff.id,
                staffName: staff.name,
                confidence,
                reasons: this.generateReasons(startTime, staff, request, confidence)
              });
            }
          }
        }
      }
    }

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }

  private isSlotAvailable(startTime: Date, endTime: Date, staffReservations: any[]): boolean {
    return !staffReservations.some(reservation => {
      const resStart = new Date(reservation.startTime);
      const resEnd = new Date(reservation.endTime || new Date(resStart.getTime() + 60 * 60 * 1000));
      
      return (startTime < resEnd && endTime > resStart);
    });
  }

  private calculateSlotConfidence(
    startTime: Date,
    staff: any,
    request: BookingRequest,
    staffReservations: any[]
  ): number {
    let confidence = staff.suitabilityScore;

    // Time preference matching
    if (request.preferredTimeRange) {
      const startHour = startTime.getHours();
      const preferredStart = parseInt(request.preferredTimeRange.start.split(':')[0]);
      const preferredEnd = parseInt(request.preferredTimeRange.end.split(':')[0]);
      
      if (startHour >= preferredStart && startHour <= preferredEnd) {
        confidence += 0.2;
      }
    }

    // Buffer time consideration
    const prevReservation = this.findPreviousReservation(startTime, staffReservations);
    const nextReservation = this.findNextReservation(startTime, staffReservations);
    
    if (prevReservation) {
      const buffer = startTime.getTime() - new Date(prevReservation.endTime || prevReservation.startTime).getTime();
      if (buffer >= 15 * 60 * 1000) { // 15 minutes buffer
        confidence += 0.1;
      }
    }

    // Avoid end-of-day bookings for long services
    const endHour = new Date(startTime.getTime() + request.estimatedDuration * 60 * 1000).getHours();
    if (endHour >= 17 && request.estimatedDuration > 120) {
      confidence -= 0.2;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  private findPreviousReservation(startTime: Date, staffReservations: any[]) {
    return staffReservations
      .filter(r => new Date(r.startTime) < startTime)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];
  }

  private findNextReservation(startTime: Date, staffReservations: any[]) {
    return staffReservations
      .filter(r => new Date(r.startTime) > startTime)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
  }

  private generateReasons(startTime: Date, staff: any, request: BookingRequest, confidence: number): string[] {
    const reasons: string[] = [];
    
    if (confidence > 0.8) {
      reasons.push('最適なスタッフ・時間帯の組み合わせ');
    }
    if (confidence > 0.6) {
      reasons.push(`${staff.name}の得意分野と一致`);
    }
    
    const hour = startTime.getHours();
    if (hour >= 10 && hour <= 14) {
      reasons.push('余裕のある時間帯');
    }
    if (hour >= 15 && hour <= 17) {
      reasons.push('人気の時間帯');
    }

    if (request.customerPriority === 'VIP') {
      reasons.push('VIP顧客優先対応');
    }

    return reasons;
  }

  private async analyzeDayOfWeekPatterns(customerId: string) {
    const reservations = await prisma.reservation.findMany({
      where: { customerId, tenantId: this.tenantId },
      orderBy: { startTime: 'desc' },
      take: 100
    });

    const dayPatterns: Array<{ total: number; noShows: number; noShowRate: number }> = 
      new Array(7).fill(null).map(() => ({ total: 0, noShows: 0, noShowRate: 0 }));

    reservations.forEach(r => {
      const dayOfWeek = r.startTime.getDay();
      dayPatterns[dayOfWeek].total++;
      if (r.status === 'NO_SHOW') {
        dayPatterns[dayOfWeek].noShows++;
      }
    });

    dayPatterns.forEach(pattern => {
      pattern.noShowRate = pattern.total > 0 ? pattern.noShows / pattern.total : 0;
    });

    return dayPatterns;
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    return days[dayOfWeek];
  }

  private async getHistoricalBookingData(startDate: Date, endDate: Date) {
    const threeMonthsAgo = new Date(startDate);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const reservations = await prisma.reservation.findMany({
      where: {
        tenantId: this.tenantId,
        startTime: { gte: threeMonthsAgo, lt: startDate },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      }
    });

    const dataByDate: { [key: string]: any } = {};

    reservations.forEach(r => {
      const date = r.startTime.toISOString().split('T')[0];
      const hour = r.startTime.getHours();
      const dayOfWeek = r.startTime.getDay();
      const month = r.startTime.getMonth();

      if (!dataByDate[date]) {
        dataByDate[date] = {
          date,
          dayOfWeek,
          month,
          hourlyBookings: {} as { [hour: number]: number }
        };
      }

      dataByDate[date].hourlyBookings[hour] = (dataByDate[date].hourlyBookings[hour] || 0) + 1;
    });

    return Object.values(dataByDate);
  }

  private getSeasonalFactor(month: number, dayOfWeek: number): number {
    // Simplified seasonal adjustment
    const seasonalFactors = [0.8, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 1.0, 1.1, 1.0, 0.8];
    const weekendBonus = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.2 : 1.0;
    return seasonalFactors[month] * weekendBonus;
  }

  private getWeeklyPattern(dayOfWeek: number): number {
    // Monday to Sunday patterns
    const patterns = [0.9, 0.8, 1.0, 1.1, 1.2, 1.3, 1.1];
    return patterns[dayOfWeek];
  }

  private getTrendFactor(date: Date): number {
    // Simplified growth trend - 2% monthly growth
    const monthsDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return 1 + (monthsDiff * 0.02);
  }
}

export default SmartBookingService;