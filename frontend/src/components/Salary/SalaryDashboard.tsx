import React, { useState, useEffect } from 'react';
// UIコンポーネントの代替実装
const Card = ({ children, className = '' }: any) => <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>;
const CardHeader = ({ children }: any) => <div className="p-4 border-b">{children}</div>;
const CardTitle = ({ children, className = '' }: any) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ children, className = '' }: any) => <div className={`p-4 ${className}`}>{children}</div>;
const Button = ({ children, onClick, disabled, type = 'button', className = '' }: any) => <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 ${className}`}>{children}</button>;
const Input = ({ type, value, onChange, placeholder, min, step, required, className = '' }: any) => <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} step={step} required={required} className={`px-3 py-2 border rounded ${className}`} />;
const Badge = ({ children, className = '', variant }: any) => <span className={`inline-block px-2 py-1 text-xs rounded ${className}`}>{children}</span>;
const Progress = ({ value, className = '' }: any) => <div className={`bg-gray-200 rounded ${className}`}><div className="bg-blue-600 h-full rounded" style={{ width: `${value}%` }}></div></div>;
const Alert = ({ children, className = '' }: any) => <div className={`p-4 rounded border ${className}`}>{children}</div>;
const AlertDescription = ({ children, className = '' }: any) => <p className={className}>{children}</p>;
import { 
  DollarSign, Target, TrendingUp, Calendar, 
  Clock, Users, Star, Award, AlertTriangle, CheckCircle 
} from 'lucide-react';

interface SalaryData {
  id: string;
  year: number;
  month: number;
  baseSalary: number;
  commission: number;
  bonus: number;
  supportEarnings: number;
  totalGross: number;
  totalNet: number;
  totalHours: number;
  totalCustomers: number;
  totalRevenue: number;
  customerRating: number;
  monthlyGoal?: number;
  goalProgress: number;
  projectedTotal: number;
  isOnTrack?: boolean;
  projection?: {
    projectedTotal: number;
    isOnTrack: boolean | null;
  };
  dailyRecords: DailyRecord[];
}

interface DailyRecord {
  id: string;
  date: string;
  hoursWorked: number;
  customersServed: number;
  dailyRevenue: number;
  dailyEarnings: number;
  supportHours: number;
  supportEarnings: number;
  customerRating?: number;
}

const SalaryDashboard: React.FC = () => {
  const [salaryData, setSalaryData] = useState<SalaryData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [goalInput, setGoalInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSalaryData();
  }, [selectedYear, selectedMonth]);

  const fetchSalaryData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/v1/salary/dashboard?year=${selectedYear}&month=${selectedMonth}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSalaryData(data.dashboard);
        if (data.dashboard.monthlyGoal) {
          setGoalInput(data.dashboard.monthlyGoal.toString());
        }
      } else {
        const error = await response.json();
        if (error.code === 'FEATURE_DISABLED') {
          setMessage({ type: 'error', text: '給料見える化システムが無効化されています。管理者にお問い合わせください。' });
        } else {
          throw new Error(error.error || 'データの取得に失敗しました');
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
    } finally {
      setLoading(false);
    }
  };

  const setMonthlyGoal = async () => {
    try {
      const response = await fetch(`/api/v1/salary/goal?year=${selectedYear}&month=${selectedMonth}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ monthlyGoal: parseFloat(goalInput) })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '目標を設定しました！' });
        await fetchSalaryData();
      } else {
        throw new Error('目標設定に失敗しました');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return `${month}月`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">給与データを読み込んでいます...</span>
      </div>
    );
  }

  if (!salaryData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">給与データがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <h1 className="text-2xl font-bold">給与ダッシュボード</h1>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1 border rounded"
          >
            {[2024, 2025].map(year => (
              <option key={year} value={year}>{year}年</option>
            ))}
          </select>
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-1 border rounded"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>{getMonthName(month)}</option>
            ))}
          </select>
        </div>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          {message.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-red-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* メイン統計 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">今月の総収入</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-green-600">
                {formatCurrency(salaryData.totalGross)}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                手取り: {formatCurrency(salaryData.totalNet)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">労働時間</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-blue-600">
                {salaryData.totalHours}h
              </span>
              <div className="text-xs text-gray-500 mt-1">
                応援: {salaryData.supportEarnings > 0 ? '含む' : 'なし'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">接客数</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-purple-600">
                {salaryData.totalCustomers}人
              </span>
              <div className="text-xs text-gray-500 mt-1">
                売上: {formatCurrency(salaryData.totalRevenue)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">評価</span>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-bold text-yellow-600">
                {salaryData.customerRating.toFixed(1)}
              </span>
              <div className="text-xs text-gray-500 mt-1">
                5点満点
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 目標設定と進捗 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>月間目標</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="目標金額（円）"
                value={goalInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGoalInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={setMonthlyGoal}>
                目標設定
              </Button>
            </div>
            
            {salaryData.monthlyGoal && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>目標: {formatCurrency(salaryData.monthlyGoal)}</span>
                  <span>達成率: {salaryData.goalProgress.toFixed(1)}%</span>
                </div>
                <Progress value={salaryData.goalProgress} className="h-2" />
                {salaryData.projection && (
                  <div className="text-sm text-gray-600">
                    <span>月末予想: {formatCurrency(salaryData.projection.projectedTotal)}</span>
                    {salaryData.projection.isOnTrack !== null && (
                      <Badge 
                        className={`ml-2 ${salaryData.projection.isOnTrack ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
                      >
                        {salaryData.projection.isOnTrack ? '目標達成見込み' : '要努力'}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 収入内訳 */}
      <Card>
        <CardHeader>
          <CardTitle>収入内訳</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-sm text-gray-600">基本給</div>
              <div className="text-lg font-semibold text-blue-600">
                {formatCurrency(salaryData.baseSalary)}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-sm text-gray-600">歩合給</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(salaryData.commission)}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-sm text-gray-600">ボーナス</div>
              <div className="text-lg font-semibold text-purple-600">
                {formatCurrency(salaryData.bonus)}
              </div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded">
              <div className="text-sm text-gray-600">応援収入</div>
              <div className="text-lg font-semibold text-orange-600">
                {formatCurrency(salaryData.supportEarnings)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 最近の実績 */}
      {salaryData.dailyRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>最近の実績</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {salaryData.dailyRecords.slice(-7).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">
                      {new Date(record.date).toLocaleDateString('ja-JP')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {record.hoursWorked}h / {record.customersServed}人
                      {record.customerRating && (
                        <span className="ml-2">⭐ {record.customerRating}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {formatCurrency(record.dailyEarnings)}
                    </div>
                    {record.supportEarnings > 0 && (
                      <div className="text-sm text-orange-600">
                        応援: {formatCurrency(record.supportEarnings)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalaryDashboard;