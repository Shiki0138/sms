import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReminderSettings } from '../components/Settings/ReminderSettings';
// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;
global.alert = vi.fn();
describe('ReminderSettings Integration Tests', () => {
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
                    weekBefore: 'Test template week',
                    threeDays: 'Test template 3 days',
                    followUp: 'Test template follow up'
                }
            })
        });
    });
    it('renders all main sections correctly', async () => {
        render(_jsx(ReminderSettings, {}));
        // Wait for loading to complete and check main sections are present
        await waitFor(() => {
            expect(screen.getByText('自動リマインド設定')).toBeInTheDocument();
        });
        expect(screen.getByText('基本設定')).toBeInTheDocument();
        expect(screen.getByText('送信タイミング設定')).toBeInTheDocument();
        expect(screen.getByText('メッセージテンプレート')).toBeInTheDocument();
    });
    it('displays all reminder types and controls', async () => {
        render(_jsx(ReminderSettings, {}));
        // Wait for component to load, then check reminder types
        await waitFor(() => {
            expect(screen.getByText('メールリマインド')).toBeInTheDocument();
        });
        expect(screen.getByText('LINEリマインド')).toBeInTheDocument();
        expect(screen.getByText('1週間前リマインド')).toBeInTheDocument();
        expect(screen.getByText('3日前リマインド')).toBeInTheDocument();
        expect(screen.getAllByText('フォローアップメッセージ')).toHaveLength(2);
        // Check controls
        expect(screen.getAllByRole('switch')).toHaveLength(5);
        expect(screen.getAllByText('テスト送信')).toHaveLength(3);
        expect(screen.getByText('設定を保存')).toBeInTheDocument();
    });
    it('provides template editing functionality', async () => {
        render(_jsx(ReminderSettings, {}));
        // Wait for loading and check template labels
        await waitFor(() => {
            expect(screen.getByText('1週間前メッセージ')).toBeInTheDocument();
        });
        expect(screen.getByText('3日前メッセージ')).toBeInTheDocument();
        // Check textareas for template editing
        const textareas = screen.getAllByRole('textbox');
        expect(textareas).toHaveLength(3); // One for each template type
        // Check variable help
        expect(screen.getByText('利用可能な変数:')).toBeInTheDocument();
        expect(screen.getByText('{customerName}')).toBeInTheDocument();
        expect(screen.getByText('{reservationDate}')).toBeInTheDocument();
    });
    it('is properly integrated and functional', async () => {
        // Test that the component can be rendered without errors
        const { container } = render(_jsx(ReminderSettings, {}));
        // Wait for component to finish loading
        await waitFor(() => {
            expect(screen.getByText('自動リマインド設定')).toBeInTheDocument();
        });
        // Verify the component structure
        expect(container.firstChild).toHaveClass('space-y-6');
        // Verify main sections are properly structured
        const cards = container.querySelectorAll('.bg-white.rounded-xl');
        expect(cards).toHaveLength(3); // Basic settings, timing settings, template settings
        // Verify component is interactive
        const switches = screen.getAllByRole('switch');
        const buttons = screen.getAllByRole('button');
        expect(switches.length + buttons.length).toBeGreaterThan(8); // Multiple interactive elements
    });
});
