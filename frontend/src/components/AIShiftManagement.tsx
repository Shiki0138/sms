import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  Star, 
  AlertTriangle,
  Sparkles,
  BarChart3,
  Brain,
  RefreshCw,
  Zap,
  CheckCircle,
  Settings,
  Download,
  Eye
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  skills: string[];
  rating: number;
  hourlyRate: number;
  availability: {
    [date: string]: {
      start: string;
      end: string;
      preferred?: boolean;
    }
  };
}

interface Prediction {
  date: string;
  hour: number;
  expectedCustomers: number;
  confidence: number;
  recommendedStaff: number;
}

interface OptimizedShift {
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  expectedRevenue: number;
  customerCount: number;
  efficiency: number;
}

const AIShiftManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'optimization' | 'analytics'>('overview');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [optimizedShifts, setOptimizedShifts] = useState<OptimizedShift[]>([]);
  const [staffMembers] = useState<StaffMember[]>([
    {
      id: '1',
      name: '田中美咲',
      skills: ['カット', 'カラー', 'パーマ'],
      rating: 4.8,
      hourlyRate: 2500,
      availability: {}
    },
    {
      id: '2', 
      name: '佐藤健太',
      skills: ['カット', 'スタイリング'],
      rating: 4.6,
      hourlyRate: 2200,
      availability: {}
    },
    {
      id: '3',
      name: '鈴木花子',
      skills: ['カラー', 'トリートメント', 'ヘッドスパ'],
      rating: 4.9,
      hourlyRate: 2800,
      availability: {}
    }
  ]);

  const generatePredictions = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockPredictions: Prediction[] = [];
      for (let hour = 9; hour < 20; hour++) {
        const baseCustomers = Math.random() * 8 + 2;
        const weekendBonus = new Date(selectedDate).getDay() === 0 || new Date(selectedDate).getDay() === 6 ? 1.3 : 1;
        const peakHourBonus = (hour >= 14 && hour <= 18) ? 1.5 : 1;
        
        mockPredictions.push({
          date: selectedDate,
          hour,
          expectedCustomers: Math.round(baseCustomers * weekendBonus * peakHourBonus),
          confidence: Math.random() * 20 + 80,
          recommendedStaff: Math.ceil((baseCustomers * weekendBonus * peakHourBonus) / 3)
        });
      }
      setPredictions(mockPredictions);
      setIsLoading(false);
    }, 2000);
  };

  const optimizeShifts = async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const mockShifts: OptimizedShift[] = [
        {
          staffId: '1',
          staffName: '田中美咲',
          date: selectedDate,
          startTime: '09:00',
          endTime: '18:00',
          expectedRevenue: 48000,
          customerCount: 12,
          efficiency: 94
        },
        {
          staffId: '2',
          staffName: '佐藤健太', 
          date: selectedDate,
          startTime: '10:00',
          endTime: '19:00',
          expectedRevenue: 38000,
          customerCount: 10,
          efficiency: 87
        },
        {
          staffId: '3',
          staffName: '鈴木花子',
          date: selectedDate,
          startTime: '13:00',
          endTime: '20:00',
          expectedRevenue: 42000,
          customerCount: 8,
          efficiency: 91
        }
      ];
      setOptimizedShifts(mockShifts);
      setIsLoading(false);
    }, 3000);
  };

  useEffect(() => {
    generatePredictions();
  }, [selectedDate]);

  const totalRevenue = optimizedShifts.reduce((sum, shift) => sum + shift.expectedRevenue, 0);
  const totalCustomers = optimizedShifts.reduce((sum, shift) => sum + shift.customerCount, 0);
  const avgEfficiency = optimizedShifts.length > 0 
    ? optimizedShifts.reduce((sum, shift) => sum + shift.efficiency, 0) / optimizedShifts.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AIシフト最適化システム</h1>
            <p className="text-purple-100">革新的な予測技術で売上を最大化</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">予想売上向上</span>
            </div>
            <p className="text-2xl font-bold mt-1">+18%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium">効率最適化</span>
            </div>
            <p className="text-2xl font-bold mt-1">92%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="font-medium">顧客満足度</span>
            </div>
            <p className="text-2xl font-bold mt-1">4.9★</p>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white rounded-lg shadow border">
        <div className="flex border-b">
          {[
            { id: 'overview', label: '概要', icon: Eye },
            { id: 'predictions', label: 'AI予測', icon: Brain },
            { id: 'optimization', label: 'シフト最適化', icon: Zap },
            { id: 'analytics', label: '分析レポート', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* 概要タブ */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">今日の予想売上</p>
                      <p className="text-2xl font-bold text-blue-800">¥{totalRevenue.toLocaleString()}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">予想来客数</p>
                      <p className="text-2xl font-bold text-green-800">{totalCustomers}名</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">平均効率</p>
                      <p className="text-2xl font-bold text-purple-800">{avgEfficiency.toFixed(1)}%</p>
                    </div>
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">稼働スタッフ</p>
                      <p className="text-2xl font-bold text-yellow-800">{optimizedShifts.length}名</p>
                    </div>
                    <Star className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <span>AI最適化の効果</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">18%</div>
                    <div className="text-sm text-gray-600">売上向上</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">25%</div>
                    <div className="text-sm text-gray-600">人件費削減</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">40%</div>
                    <div className="text-sm text-gray-600">満足度向上</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI予測タブ */}
          {activeTab === 'predictions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">来客数予測</h3>
                <div className="flex items-center space-x-4">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={generatePredictions}
                    disabled={isLoading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    <span>AI予測実行</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <h4 className="font-medium text-gray-900">時間別予測データ</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">時間</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">予想来客数</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">信頼度</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">推奨スタッフ数</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {predictions.map((pred) => (
                        <tr key={pred.hour} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {pred.hour}:00 - {pred.hour + 1}:00
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pred.expectedCustomers}名
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-600 h-2 rounded-full" 
                                  style={{ width: `${pred.confidence}%` }}
                                ></div>
                              </div>
                              <span>{pred.confidence.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {pred.recommendedStaff}名
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* シフト最適化タブ */}
          {activeTab === 'optimization' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">最適化シフト提案</h3>
                <button
                  onClick={optimizeShifts}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center space-x-2"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  <span>最適化実行</span>
                </button>
              </div>

              {optimizedShifts.length > 0 && (
                <div className="space-y-4">
                  {optimizedShifts.map((shift) => (
                    <div key={shift.staffId} className="bg-white border rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                            {shift.staffName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg text-gray-900">{shift.staffName}</h4>
                            <p className="text-sm text-gray-600">{shift.startTime} - {shift.endTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">¥{shift.expectedRevenue.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">予想売上</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{shift.customerCount}名</p>
                            <p className="text-sm text-gray-500">予想来客</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <span className="text-lg font-bold text-purple-600">{shift.efficiency}%</span>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <p className="text-sm text-gray-500">効率</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">最適配置理由：</span>
                            <span className="font-medium text-gray-900">ピーク時間対応</span>
                          </div>
                          <div>
                            <span className="text-gray-600">スキルマッチ：</span>
                            <span className="font-medium text-gray-900">97%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">顧客評価：</span>
                            <span className="font-medium text-gray-900">
                              {staffMembers.find(s => s.id === shift.staffId)?.rating}★
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 分析レポートタブ */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">AIシフト最適化レポート</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">週間パフォーマンス</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">売上向上率</span>
                      <span className="font-bold text-green-600">+18.2%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">人件費効率</span>
                      <span className="font-bold text-blue-600">+24.7%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">顧客満足度</span>
                      <span className="font-bold text-purple-600">4.9★</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">予約取りこぼし</span>
                      <span className="font-bold text-red-600">-32%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4">ROI分析</h4>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">312%</div>
                    <p className="text-gray-600 mb-4">投資収益率</p>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-green-700">
                        AIシフト最適化により、<br />
                        月間約<span className="font-bold">¥480,000</span>の<br />
                        追加利益を創出
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">詳細レポート</h4>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>エクスポート</span>
                  </button>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                  <div className="text-center">
                    <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <h5 className="text-xl font-bold text-gray-900 mb-2">
                      革新的なAI技術で経営を変革
                    </h5>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                      過去3年間のデータ、天候パターン、顧客行動分析を基に、
                      最適なスタッフ配置と売上最大化を実現します。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIShiftManagement;