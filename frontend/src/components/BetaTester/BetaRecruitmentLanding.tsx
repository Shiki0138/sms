import React, { useState } from 'react';
import { Clock, Shield, Users, Star, CheckCircle, Mail, Phone, User, Building } from 'lucide-react';

interface BetaApplicationForm {
  name: string;
  email: string;
  phone: string;
  salonName: string;
  salonType: string;
  numberOfStylists: string;
  currentSoftware: string;
  painPoints: string;
  expectations: string;
  availableHours: string;
  referralSource: string;
}

const BetaRecruitmentLanding: React.FC = () => {
  const [formData, setFormData] = useState<BetaApplicationForm>({
    name: '',
    email: '',
    phone: '',
    salonName: '',
    salonType: '',
    numberOfStylists: '',
    currentSoftware: '',
    painPoints: '',
    expectations: '',
    availableHours: '',
    referralSource: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Submit to backend API
      const response = await fetch('/api/v1/beta-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Send confirmation email
        await fetch('/api/v1/beta-applications/send-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email, name: formData.name }),
        });
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting beta application:', error);
      alert('申し込みの送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            お申し込みありがとうございます！
          </h2>
          <p className="text-gray-600 mb-6">
            ベータテスト申し込みを受け付けました。3営業日以内にご連絡いたします。
            確認メールをお送りしましたので、ご確認ください。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            新しい申し込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              美容室の未来を変える
              <span className="block text-blue-200">統合管理システム</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              クローズドベータテスター募集中
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Clock className="w-5 h-5 inline mr-2" />
                無料で3ヶ月利用
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Shield className="w-5 h-5 inline mr-2" />
                データ完全保護
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <Users className="w-5 h-5 inline mr-2" />
                専属サポート付き
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          史上最高クオリティの統合管理システム
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">統合メッセージ管理</h3>
            <p className="text-gray-600">LINE・Instagram DMを一元管理。AI分析で顧客満足度向上</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">予約管理革命</h3>
            <p className="text-gray-600">自動リマインダー、顧客写真管理、売上予測まで完全自動化</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AIマーケティング</h3>
            <p className="text-gray-600">顧客行動分析、売上予測、自動キャンペーン配信</p>
          </div>
        </div>

        {/* Beta Benefits */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            ベータテスターだけの特別特典
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">3ヶ月間完全無料利用</h4>
                <p className="text-gray-600">通常プレミアムプラン（月額79,800円）を無料で利用可能</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">専属サポートチーム</h4>
                <p className="text-gray-600">導入から運用まで専属エンジニアが完全サポート</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">優先機能追加</h4>
                <p className="text-gray-600">ご要望の機能を最優先で開発・実装いたします</p>
              </div>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-1">正式版50%割引</h4>
                <p className="text-gray-600">正式リリース後も永続的に50%割引でご利用可能</p>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
            ベータテスト申し込みフォーム
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  お名前 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="田中 太郎"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  メールアドレス *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tanaka@salon.co.jp"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  電話番号 *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="03-1234-5678"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-1" />
                  サロン名 *
                </label>
                <input
                  type="text"
                  name="salonName"
                  value={formData.salonName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ヘアサロン ABC"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  サロンの種類 *
                </label>
                <select
                  name="salonType"
                  value={formData.salonType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="hair">ヘアサロン</option>
                  <option value="beauty">総合美容サロン</option>
                  <option value="nail">ネイルサロン</option>
                  <option value="eyelash">アイラッシュサロン</option>
                  <option value="barber">理容室</option>
                  <option value="other">その他</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  スタイリスト数 *
                </label>
                <select
                  name="numberOfStylists"
                  value={formData.numberOfStylists}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="1">1名</option>
                  <option value="2-5">2-5名</option>
                  <option value="6-10">6-10名</option>
                  <option value="11-20">11-20名</option>
                  <option value="21+">21名以上</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                現在使用中のシステム
              </label>
              <input
                type="text"
                name="currentSoftware"
                value={formData.currentSoftware}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例：ホットペッパー、独自システム、Excel管理など"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                現在の課題・お困りごと *
              </label>
              <textarea
                name="painPoints"
                value={formData.painPoints}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例：予約管理が煩雑、顧客情報の一元化ができていない、メッセージ対応に時間がかかるなど"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                システムに期待すること *
              </label>
              <textarea
                name="expectations"
                value={formData.expectations}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例：業務効率化、売上向上、顧客満足度向上など"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  テストに使える時間 *
                </label>
                <select
                  name="availableHours"
                  value={formData.availableHours}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="1-2">週1-2時間</option>
                  <option value="3-5">週3-5時間</option>
                  <option value="6-10">週6-10時間</option>
                  <option value="11+">週11時間以上</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  どちらで知りましたか？
                </label>
                <select
                  name="referralSource"
                  value={formData.referralSource}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">選択してください</option>
                  <option value="web-search">Web検索</option>
                  <option value="sns">SNS</option>
                  <option value="referral">知人の紹介</option>
                  <option value="advertisement">広告</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>

            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '送信中...' : 'ベータテストに申し込む'}
              </button>
              <p className="text-sm text-gray-500 mt-4">
                申し込み後、3営業日以内にご連絡いたします。
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">美容室統合管理システム</h3>
          <p className="text-gray-400 mb-6">
            LINE & Instagram DM統合、AI分析、予約管理を一元化
          </p>
          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-500">
              © 2025 Beauty Salon Management System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BetaRecruitmentLanding;