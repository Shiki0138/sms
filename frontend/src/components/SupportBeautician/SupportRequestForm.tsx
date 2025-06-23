import React, { useState } from 'react';
// UIコンポーネントの代替実装
const Card = ({ children, className = '' }: any) => <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>;
const CardHeader = ({ children }: any) => <div className="p-4 border-b">{children}</div>;
const CardTitle = ({ children, className = '' }: any) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ children, className = '' }: any) => <div className={`p-4 ${className}`}>{children}</div>;
const Button = ({ children, onClick, disabled, type = 'button', variant = '', className = '' }: any) => <button type={type} onClick={onClick} disabled={disabled} className={`px-4 py-2 ${variant === 'outline' ? 'bg-white border text-gray-700' : 'bg-blue-600 text-white'} rounded hover:opacity-80 disabled:opacity-50 ${className}`}>{children}</button>;
const Input = ({ type, value, onChange, placeholder, min, step, required, className = '' }: any) => <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min} step={step} required={required} className={`px-3 py-2 border rounded w-full ${className}`} />;
const Textarea = ({ value, onChange, placeholder, rows, required, className = '' }: any) => <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} required={required} className={`px-3 py-2 border rounded w-full ${className}`} />;
const Badge = ({ children, className = '', variant, onClick }: any) => <span onClick={onClick} className={`inline-block px-2 py-1 text-xs rounded cursor-pointer ${className}`}>{children}</span>;
const Alert = ({ children, className = '' }: any) => <div className={`p-4 rounded border ${className}`}>{children}</div>;
const AlertDescription = ({ children, className = '' }: any) => <p className={className}>{children}</p>;
const Select = ({ children, value, onValueChange }: any) => <div>{children}</div>;
const SelectTrigger = ({ children }: any) => <div className="px-3 py-2 border rounded cursor-pointer">{children}</div>;
const SelectContent = ({ children }: any) => <div className="absolute bg-white border rounded shadow mt-1">{children}</div>;
const SelectItem = ({ children, value }: any) => <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer">{children}</div>;
const SelectValue = () => <span>選択してください</span>;
import { UserPlus, Clock, MapPin, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface SupportRequestFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
}

const SupportRequestForm: React.FC<SupportRequestFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [] as string[],
    preferredTime: '',
    duration: '',
    hourlyRate: '',
    location: '',
    maxDistance: '10',
    urgencyLevel: 'MEDIUM'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const skillOptions = [
    'カット', 'カラー', 'パーマ', 'ストレート', 'トリートメント',
    'セット', 'メイク', 'ネイル', 'エステ', 'マッサージ'
  ];

  const urgencyOptions = [
    { value: 'LOW', label: '低', color: 'bg-gray-100 text-gray-800' },
    { value: 'MEDIUM', label: '中', color: 'bg-blue-100 text-blue-800' },
    { value: 'HIGH', label: '高', color: 'bg-orange-100 text-orange-800' },
    { value: 'URGENT', label: '緊急', color: 'bg-red-100 text-red-800' }
  ];

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/v1/support-beautician/requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          duration: parseInt(formData.duration),
          hourlyRate: parseFloat(formData.hourlyRate),
          maxDistance: parseInt(formData.maxDistance),
          preferredTime: new Date(formData.preferredTime).toISOString()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: '応援要請を作成しました！近隣の美容師に通知されます。' });
        if (onSubmit) onSubmit(data);
        
        // フォームリセット
        setFormData({
          title: '',
          description: '',
          requiredSkills: [],
          preferredTime: '',
          duration: '',
          hourlyRate: '',
          location: '',
          maxDistance: '10',
          urgencyLevel: 'MEDIUM'
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || '応援要請の作成に失敗しました');
      }
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '不明なエラー' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-6 w-6 text-blue-600" />
          <span>応援美容師を募集</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <Alert className={`mb-4 ${message.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium mb-2">募集タイトル *</label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例: 急募！カットとカラーのお手伝い"
              required
            />
          </div>

          {/* 詳細説明 */}
          <div>
            <label className="block text-sm font-medium mb-2">詳細説明 *</label>
            <Textarea
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="応援内容の詳細、お店の雰囲気、注意事項など"
              rows={4}
              required
            />
          </div>

          {/* 必要スキル */}
          <div>
            <label className="block text-sm font-medium mb-2">必要なスキル</label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map((skill) => (
                <Badge
                  key={skill}
                  variant={formData.requiredSkills.includes(skill) ? "default" : ""}
                  className={`cursor-pointer ${
                    formData.requiredSkills.includes(skill) 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-blue-100'
                  }`}
                  onClick={() => handleSkillToggle(skill)}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* 希望日時と作業時間 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                希望開始日時 *
              </label>
              <Input
                type="datetime-local"
                value={formData.preferredTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, preferredTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">予想作業時間（分）*</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="120"
                min="30"
                step="30"
                required
              />
            </div>
          </div>

          {/* 時給と場所 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                提案時給（円）*
              </label>
              <Input
                type="number"
                value={formData.hourlyRate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, hourlyRate: e.target.value })}
                placeholder="2000"
                min="1000"
                step="100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                店舗所在地 *
              </label>
              <Input
                type="text"
                value={formData.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                placeholder="東京都渋谷区..."
                required
              />
            </div>
          </div>

          {/* 募集範囲と緊急度 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">募集範囲（km）</label>
              <Select value={formData.maxDistance} onValueChange={(value: string) => setFormData({ ...formData, maxDistance: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5km以内</SelectItem>
                  <SelectItem value="10">10km以内</SelectItem>
                  <SelectItem value="15">15km以内</SelectItem>
                  <SelectItem value="20">20km以内</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">緊急度</label>
              <Select value={formData.urgencyLevel} onValueChange={(value: string) => setFormData({ ...formData, urgencyLevel: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <Badge className={option.color}>{option.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex space-x-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? '作成中...' : '応援要請を投稿'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="">
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SupportRequestForm;