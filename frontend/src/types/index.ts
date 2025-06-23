// Type definitions for the salon management system

export interface Customer {
  id: string;
  name: string;
  nameKana?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  lastVisit?: string;
  totalVisits?: number;
  visitCount?: number;
  totalSpent?: number;
  averageSpent?: number;
  notes?: string;
  lineId?: string;
  instagramId?: string;
  preferredStaff?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  occupation?: string;
  followers?: number;
  youtubeChannel?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Reservation {
  id: string;
  customerId: string;
  customerName?: string;
  staffId?: string;
  staffName?: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  service: string;
  menuContent?: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'tentative';
  source?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceHistory {
  id: string;
  customerId: string;
  customerName?: string;
  date: string;
  service: string;
  staff?: string;
  staffId?: string;
  staffName?: string;
  menuContent?: string;
  duration?: number;
  price: number;
  beforeImage?: string;
  afterImage?: string;
  rating?: number;
  products?: string[];
  notes?: string;
  tags?: string[];
}

export interface Message {
  id: string;
  customerId?: string;
  customerName?: string;
  staffId?: string;
  subject?: string;
  content: string;
  date?: string;
  time?: string;
  timestamp?: string;
  type?: 'sent' | 'received' | 'system';
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  channel?: string;
  direction?: string;
  read?: boolean;
}

export interface Staff {
  id: string;
  name: string;
  nameKana?: string;
  role?: string;
  email?: string;
  phone?: string;
  specialties?: string[];
  workingDays?: string[];
  workDays?: string[];
  experience?: number;
  introduction?: string;
  monthlyRevenue?: number;
  customerSatisfaction?: number;
  repeatRate?: number;
  imageUrl?: string;
  instagram?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}