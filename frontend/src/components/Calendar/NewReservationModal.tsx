import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { X, Clock, User, Scissors, Palette, Sparkles, Star, Save, Search, Calendar } from 'lucide-react';
import { ServiceMenu } from '../../types/menu';
import { defaultMenus } from '../../data/defaultMenus';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface Staff {
  id: string;
  name: string;
}

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate?: Date;
  selectedTime?: string;
  customers: Customer[];
  onSave: (reservation: any) => void;
}

const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  selectedTime,
  customers,
  onSave
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerId: '',
    phone: '',
    email: '',
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    startTime: selectedTime || '10:00',
    duration: 60,
    menuId: '',
    menuType: '',
    menuDetails: '',
    staffId: '',
    price: 0,
    notes: '',
    source: 'MANUAL',
    status: 'CONFIRMED'
  });

  const [availableMenus, setAvailableMenus] = useState<ServiceMenu[]>(defaultMenus.filter(m => m.isActive));

  const [customerSearch, setCustomerSearch] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // スタッフリスト（デモ用）
  const staffList: Staff[] = [
    { id: 'staff1', name: '田中 美咲' },
    { id: 'staff2', name: '佐藤 麗子' },
    { id: 'staff3', name: '山田 花音' },
    { id: 'staff4', name: '鈴木 あゆみ' }
  ];

  useEffect(() => {
    // グローバルメニューデータの取得
    if (typeof window !== 'undefined' && (window as any).serviceMenus) {
      setAvailableMenus((window as any).serviceMenus)
    }
  }, []);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      setFormData(prev => ({
        ...prev,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime
      }));
    }
  }, [selectedDate, selectedTime]);

  useEffect(() => {
    if (customerSearch) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        (customer.phone && customer.phone.includes(customerSearch))
      );
      setFilteredCustomers(filtered);
      setShowCustomerDropdown(filtered.length > 0);
    } else {
      setFilteredCustomers([]);
      setShowCustomerDropdown(false);
    }
  }, [customerSearch, customers]);

  const handleCustomerSelect = (customer: Customer) => {
    setFormData(prev => ({
      ...prev,
      customerName: customer.name,
      customerId: customer.id,
      phone: customer.phone || '',
      email: customer.email || ''
    }));
    setCustomerSearch(customer.name);
    setShowCustomerDropdown(false);
    setIsNewCustomer(false);
  };

  const handleMenuChange = (menuId: string) => {
    const selectedMenu = availableMenus.find(m => m.id === menuId);
    if (selectedMenu) {
      setFormData(prev => ({
        ...prev,
        menuId: menuId,
        menuType: selectedMenu.category,
        menuDetails: selectedMenu.name,
        duration: selectedMenu.duration,
        price: selectedMenu.price
      }));
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cut': return <Scissors className="w-4 h-4" />
      case 'color': return <Palette className="w-4 h-4" />
      case 'perm': return <Sparkles className="w-4 h-4" />
      default: return <Star className="w-4 h-4" />
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // フォームバリデーション
    if (!formData.customerName.trim()) {
      alert('顧客名を入力してください。');
      return;
    }
    
    if (!formData.date) {
      alert('予約日を選択してください。');
      return;
    }
    
    if (!formData.startTime) {
      alert('開始時間を選択してください。');
      return;
    }
    
    if (!formData.menuDetails) {
      alert('メニューを選択してください。');
      return;
    }
    
    const reservation = {
      id: `reservation_${Date.now()}`,
      startTime: `${formData.date}T${formData.startTime}:00`,
      endTime: calculateEndTime(formData.date, formData.startTime, formData.duration),
      menuContent: formData.menuDetails,
      customerName: formData.customerName,
      customer: formData.customerId ? {
        id: formData.customerId,
        name: formData.customerName,
        phone: formData.phone
      } : {
        id: `temp_${Date.now()}`,
        name: formData.customerName,
        phone: formData.phone
      },
      staff: formData.staffId ? {
        id: formData.staffId,
        name: staffList.find(s => s.id === formData.staffId)?.name || ''
      } : undefined,
      source: formData.source,
      status: formData.status,
      notes: formData.notes,
      price: formData.price
    };

    // 重複チェックはApp.tsxで行うため、ここでは削除
    
    onSave(reservation);
    onClose();
    resetForm();
  };

  const calculateEndTime = (date: string, startTime: string, duration: number): string => {
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start.getTime() + duration * 60 * 1000);
    return end.toISOString();
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerId: '',
      phone: '',
      email: '',
      date: '',
      startTime: '',
      duration: 60,
      menuId: '',
      menuType: '',
      menuDetails: '',
      staffId: '',
      price: 0,
      notes: '',
      source: 'MANUAL',
      status: 'CONFIRMED'
    });
    setCustomerSearch('');
    setIsNewCustomer(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-blue-600" />
              新規予約作成
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 顧客情報 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">顧客情報</h3>
              
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  顧客名 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setFormData(prev => ({ ...prev, customerName: e.target.value }));
                      if (e.target.value && !customers.find(c => c.name === e.target.value)) {
                        setIsNewCustomer(true);
                      }
                    }}
                    placeholder="顧客名を入力または検索..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
                
                {showCustomerDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => handleCustomerSelect(customer)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                      >
                        <div className="font-medium">{customer.name}</div>
                        {customer.phone && (
                          <div className="text-sm text-gray-600">{customer.phone}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
                
                {isNewCustomer && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>新規顧客として登録されます</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="090-1234-5678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">メールアドレス</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 予約日時 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">予約日時</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    予約日 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始時間 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* メニュー */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">メニュー</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メニュー選択 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                  {availableMenus.map((menu) => (
                    <button
                      key={menu.id}
                      type="button"
                      onClick={() => handleMenuChange(menu.id)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        formData.menuId === menu.id
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {getCategoryIcon(menu.category)}
                        <span className="font-medium text-sm">{menu.name}</span>
                      </div>
                      {menu.description && (
                        <div className="text-xs text-gray-500 mb-1">{menu.description}</div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1">
                          <span>¥{menu.price.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{menu.duration}分</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {availableMenus.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    利用可能なメニューがありません。<br />
                    設定画面でメニューを追加してください。
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">施術時間（分）</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    min="15"
                    max="300"
                    step="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">料金（円）</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    placeholder="5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* スタッフ・その他 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">その他</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">担当スタッフ</label>
                  <select
                    value={formData.staffId}
                    onChange={(e) => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">スタッフを選択...</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>{staff.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ステータス</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="CONFIRMED">確定</option>
                    <option value="TENTATIVE">仮予約</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">備考</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="特別な要望やアレルギー情報など..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            {/* ボタン */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                予約を保存
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewReservationModal;