import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SupportStaffPopup.css';

interface SupportStaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profilePhoto?: string;
  skills: string[];
  experience: number;
  specialties?: string;
  rating: number;
  completedCount: number;
  distance?: number;
  availability: {
    hourlyRate: number;
    availableFrom: string;
    availableTo: string;
  };
}

interface SupportStaffPopupProps {
  isOpen: boolean;
  onClose: () => void;
  workDate: string;
  requiredSkills: string[];
  location: { lat: number; lng: number };
}

const SupportStaffPopup: React.FC<SupportStaffPopupProps> = ({
  isOpen,
  onClose,
  workDate,
  requiredSkills,
  location
}) => {
  const [availableStaff, setAvailableStaff] = useState<SupportStaffProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<SupportStaffProfile | null>(null);
  const [requestDetails, setRequestDetails] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '18:00',
    hourlyRate: 0,
    transportationFee: 0,
    urgencyLevel: 'NORMAL'
  });

  useEffect(() => {
    if (isOpen) {
      searchAvailableStaff();
    }
  }, [isOpen, workDate, requiredSkills, location]);

  const searchAvailableStaff = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/support-staff/search', {
        params: {
          lat: location.lat,
          lng: location.lng,
          date: workDate,
          skills: JSON.stringify(requiredSkills),
          maxDistance: 30
        }
      });
      setAvailableStaff(response.data);
    } catch (error) {
      console.error('Error searching available staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSelect = (staff: SupportStaffProfile) => {
    setSelectedStaff(staff);
    setRequestDetails(prev => ({
      ...prev,
      hourlyRate: staff.availability.hourlyRate
    }));
  };

  const handleSubmitRequest = async () => {
    if (!selectedStaff) return;

    try {
      await axios.post('/api/v1/support-staff/requests', {
        ...requestDetails,
        requiredSkills,
        workDate,
        location: `${location.lat},${location.lng}`,
        latitude: location.lat,
        longitude: location.lng
      });
      
      alert('応援依頼を送信しました！');
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('エラーが発生しました');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="support-staff-popup-overlay">
      <div className="support-staff-popup">
        <div className="popup-header">
          <h2>応援スタッフを探す</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {loading ? (
          <div className="loading">検索中...</div>
        ) : (
          <>
            {!selectedStaff ? (
              <div className="staff-list">
                <h3>利用可能なスタッフ（{availableStaff.length}名）</h3>
                {availableStaff.map(staff => (
                  <div 
                    key={staff.id} 
                    className="staff-card"
                    onClick={() => handleStaffSelect(staff)}
                  >
                    <div className="staff-info">
                      <div className="staff-photo">
                        {staff.profilePhoto ? (
                          <img src={staff.profilePhoto} alt={staff.name} />
                        ) : (
                          <div className="photo-placeholder">
                            {staff.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="staff-details">
                        <h4>{staff.name}</h4>
                        <p className="experience">経験: {staff.experience}年</p>
                        <p className="skills">
                          スキル: {staff.skills.join(', ')}
                        </p>
                        <div className="staff-meta">
                          <span className="rating">★ {staff.rating}</span>
                          <span className="completed">完了: {staff.completedCount}件</span>
                          {staff.distance && (
                            <span className="distance">{staff.distance.toFixed(1)}km</span>
                          )}
                        </div>
                        <p className="hourly-rate">
                          時給: ¥{staff.availability.hourlyRate.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="request-form">
                <div className="selected-staff">
                  <h3>選択したスタッフ</h3>
                  <div className="staff-summary">
                    <strong>{selectedStaff.name}</strong>
                    <button 
                      className="change-staff"
                      onClick={() => setSelectedStaff(null)}
                    >
                      変更
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>依頼タイトル</label>
                  <input
                    type="text"
                    value={requestDetails.title}
                    onChange={(e) => setRequestDetails(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    placeholder="例: 土曜日の応援スタッフ募集"
                  />
                </div>

                <div className="form-group">
                  <label>詳細説明</label>
                  <textarea
                    value={requestDetails.description}
                    onChange={(e) => setRequestDetails(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder="業務内容の詳細を記入してください"
                    rows={4}
                  />
                </div>

                <div className="time-group">
                  <div className="form-group">
                    <label>開始時間</label>
                    <input
                      type="time"
                      value={requestDetails.startTime}
                      onChange={(e) => setRequestDetails(prev => ({
                        ...prev,
                        startTime: e.target.value
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>終了時間</label>
                    <input
                      type="time"
                      value={requestDetails.endTime}
                      onChange={(e) => setRequestDetails(prev => ({
                        ...prev,
                        endTime: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="payment-group">
                  <div className="form-group">
                    <label>時給</label>
                    <input
                      type="number"
                      value={requestDetails.hourlyRate}
                      onChange={(e) => setRequestDetails(prev => ({
                        ...prev,
                        hourlyRate: Number(e.target.value)
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>交通費</label>
                    <input
                      type="number"
                      value={requestDetails.transportationFee}
                      onChange={(e) => setRequestDetails(prev => ({
                        ...prev,
                        transportationFee: Number(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>緊急度</label>
                  <select
                    value={requestDetails.urgencyLevel}
                    onChange={(e) => setRequestDetails(prev => ({
                      ...prev,
                      urgencyLevel: e.target.value
                    }))}
                  >
                    <option value="LOW">低</option>
                    <option value="NORMAL">通常</option>
                    <option value="HIGH">高</option>
                    <option value="URGENT">緊急</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => setSelectedStaff(null)}
                  >
                    戻る
                  </button>
                  <button 
                    className="submit-button"
                    onClick={handleSubmitRequest}
                    disabled={!requestDetails.title || !requestDetails.description}
                  >
                    依頼を送信
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupportStaffPopup;