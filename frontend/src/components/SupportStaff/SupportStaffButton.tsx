import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SupportStaffPopup from './SupportStaffPopup';
import './SupportStaffButton.css';

interface SupportStaffButtonProps {
  date?: string;
  skills?: string[];
}

const SupportStaffButton: React.FC<SupportStaffButtonProps> = ({ 
  date = new Date().toISOString().split('T')[0],
  skills = ['cut', 'color'] 
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tenantLocation, setTenantLocation] = useState({ lat: 35.6762, lng: 139.6503 }); // デフォルト: 東京

  useEffect(() => {
    checkFeatureFlag();
    fetchTenantLocation();
  }, []);

  const checkFeatureFlag = async () => {
    try {
      const response = await axios.get('/api/v1/features/flags');
      const supportStaffFlag = response.data.find(
        (flag: any) => flag.key === 'support_staff_platform'
      );
      setIsFeatureEnabled(supportStaffFlag?.isEnabled || false);
    } catch (error) {
      console.error('Error checking feature flag:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTenantLocation = async () => {
    try {
      // 実際は店舗の位置情報を取得
      // const response = await axios.get('/api/v1/tenants/current/location');
      // setTenantLocation(response.data);
    } catch (error) {
      console.error('Error fetching tenant location:', error);
    }
  };

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  if (loading) return null;
  if (!isFeatureEnabled) return null;

  return (
    <>
      <button 
        className="support-staff-button"
        onClick={handleOpenPopup}
        title="応援スタッフを探す"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <span className="button-text">応援スタッフ</span>
        <span className="badge">NEW</span>
      </button>

      <SupportStaffPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        workDate={date}
        requiredSkills={skills}
        location={tenantLocation}
      />
    </>
  );
};

export default SupportStaffButton;