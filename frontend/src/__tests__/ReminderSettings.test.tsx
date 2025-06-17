import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReminderSettings } from '../components/Settings/ReminderSettings';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock alert
global.alert = vi.fn();

describe('ReminderSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        emailEnabled: true,
        lineEnabled: true,
        weekBeforeEnabled: true,
        threeDaysBeforeEnabled: true,
        followUpEnabled: true,
        emailTemplates: {
          weekBefore: '{customerName}様、{reservationDate}のご予約確認です。',
          threeDays: '{customerName}様、{reservationDate}のご予約まで3日となりました。',
          followUp: '{customerName}様、いつもありがとうございます。'
        }
      })
    });
  });

  it('renders reminder settings interface', async () => {
    render(<ReminderSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('自動リマインド設定')).toBeInTheDocument();
      expect(screen.getByText('基本設定')).toBeInTheDocument();
      expect(screen.getByText('送信タイミング設定')).toBeInTheDocument();
    });
  });

  it('displays email and LINE settings', async () => {
    render(<ReminderSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('メールリマインド')).toBeInTheDocument();
      expect(screen.getByText('LINEリマインド')).toBeInTheDocument();
    });
  });

  it('shows timing configuration options', async () => {
    render(<ReminderSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('1週間前リマインド')).toBeInTheDocument();
      expect(screen.getByText('3日前リマインド')).toBeInTheDocument();
      expect(screen.getAllByText('フォローアップメッセージ')).toHaveLength(2); // One in timing, one in template
    });
  });

  it('has test send buttons for each reminder type', async () => {
    render(<ReminderSettings />);
    
    await waitFor(() => {
      const testButtons = screen.getAllByText('テスト送信');
      expect(testButtons).toHaveLength(3); // 1週間前、3日前、フォローアップ
    });
  });

  it('shows message template editing area', async () => {
    render(<ReminderSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('メッセージテンプレート')).toBeInTheDocument();
      expect(screen.getByText('1週間前メッセージ')).toBeInTheDocument();
      expect(screen.getByText('3日前メッセージ')).toBeInTheDocument();
      expect(screen.getAllByText('フォローアップメッセージ')).toHaveLength(2); // One in timing, one in template
    });
  });

  it('can save settings', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}) 
    });

    render(<ReminderSettings />);
    
    await waitFor(() => {
      const saveButton = screen.getByText('設定を保存');
      expect(saveButton).toBeInTheDocument();
    });
  });

  it('handles test reminder sending', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({})
    });

    render(<ReminderSettings />);
    
    await waitFor(() => {
      const testButtons = screen.getAllByText('テスト送信');
      fireEvent.click(testButtons[0]);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/v1/reminders/test/week', {
      method: 'POST'
    });
  });

  it('displays template variables help', async () => {
    render(<ReminderSettings />);
    
    await waitFor(() => {
      expect(screen.getByText('利用可能な変数:')).toBeInTheDocument();
      expect(screen.getByText('{customerName}')).toBeInTheDocument();
      expect(screen.getByText('{reservationDate}')).toBeInTheDocument();
    });
  });
});