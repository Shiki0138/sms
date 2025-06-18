import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { SubscriptionProvider } from './contexts/SubscriptionContext'
import LandingPage from './pages/LandingPage'
import RealisticLandingPage from './pages/RealisticLandingPage'
import './styles/landing.css'
import LimitWarning from './components/Common/LimitWarning'
import PlanBadge from './components/Common/PlanBadge'
import PlanLimitNotifications from './components/Common/PlanLimitNotifications'
import { useSubscription } from './contexts/SubscriptionContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import UserProfile from './components/Auth/UserProfile'
import CustomerAnalyticsDashboard from './components/Analytics/CustomerAnalyticsDashboard'
import PremiumMarketingDashboard from './components/Analytics/PremiumMarketingDashboard'
import AnalyticsExport from './components/Analytics/AnalyticsExport'
import { getEnvironmentConfig, logEnvironmentInfo } from './utils/environment'
import AdvancedHolidaySettings from './components/Settings/AdvancedHolidaySettings'
import ExternalAPISettings from './components/Settings/ExternalAPISettings'
import OpenAISettings from './components/Settings/OpenAISettings'
import NotificationSettings from './components/Settings/NotificationSettings'
import { ReminderSettings } from './components/Settings/ReminderSettings'
import DataBackupSettings from './components/Settings/DataBackupSettings'
import MenuManagement from './components/Settings/MenuManagement'
import UpgradePlan from './components/Settings/UpgradePlan'
import SalonCalendar from './components/Calendar/SalonCalendar'
import MonthCalendar from './components/Calendar/MonthCalendar'
import NewReservationModal from './components/Calendar/NewReservationModal'
import CSVImporter from './components/CSVImporter'
import BulkMessageSender from './components/BulkMessageSender'
import ServiceHistoryModal from './components/ServiceHistoryModal'
import FeatureRequestForm from './components/FeatureRequestForm'
import FilteredCustomerView from './components/FilteredCustomerView'
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  BarChart3, 
  Settings,
  Instagram,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Send,
  Menu,
  X,
  ExternalLink,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  Link,
  User,
  UserCheck,
  MapPin,
  Calendar as CalendarIcon,
  FileText,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Palette,
  Star,
  Sparkles,
  Bot,
  Loader2,
  Shield,
  Lightbulb,
  Crown
} from 'lucide-react'

// アプリケーションのメインコンポーネント
function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
          <Routes>
            {/* ランディングページ */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/realistic" element={<RealisticLandingPage />} />
            
            {/* デフォルトルート */}
            <Route path="/" element={<Navigate to="/realistic" replace />} />
            
            {/* その他のルート（ダッシュボードなど）は後で追加 */}
            <Route path="*" element={<Navigate to="/realistic" replace />} />
          </Routes>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  )
}

export default App