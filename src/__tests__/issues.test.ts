import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportIssue } from '../components/ReportIssue';
import { Dashboard } from '../components/Dashboard';
import { beforeEach, expect } from '@jest/globals';

// Mock fetch globally
global.fetch = jest.fn;

const mockSession = {
  access_token: 'mock-token',
  user: { id: 'user-1', email: 'test@example.com' }
};

const mockProjectId = 'test-project-id';

jest.mock('../utils/supabase/info', () => ({
  projectId: mockProjectId,
  publicAnonKey: 'mock-key'
}));

describe('Issues API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /issues - Create Issue', () => {
    test('successfully creates an issue', async () => {
      const mockResponse = {
        issue: {
          id: 'issue-1',
          title: 'Test Issue',
          description: 'Test description',
          status: 'reported'
        }
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      render(<ReportIssue session={mockSession} />);

      // Fill form
      fireEvent.change(screen.getByLabelText(/Issue Title/), {
        target: { value: 'Test Issue' }
      });
      fireEvent.change(screen.getByLabelText(/Description/), {
        target: { value: 'Test description' }
      });
      fireEvent.change(screen.getByLabelText(/Location/), {
        target: { value: 'Test Location' }
      });
      fireEvent.change(screen.getByRole('combobox', { name: /Category/ }), {
        target: { value: 'Road & Transportation' }
      });

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /Submit Issue Report/ }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `https://${mockProjectId}.supabase.co/functions/v1/make-server-accecacf/issues`,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mockSession.access_token}`
            }),
            body: expect.stringContaining('"title":"Test Issue"')
          })
        );
      });
    });

    test('handles API error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' })
      });

      render(<ReportIssue session={mockSession} />);

      fireEvent.change(screen.getByLabelText(/Issue Title/), {
        target: { value: 'Test Issue' }
      });
      fireEvent.change(screen.getByLabelText(/Description/), {
        target: { value: 'Test description' }
      });
      fireEvent.change(screen.getByLabelText(/Location/), {
        target: { value: 'Test Location' }
      });

      fireEvent.click(screen.getByRole('button', { name: /Submit Issue Report/ }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to submit issue/)).toBeInTheDocument();
      });
    });
  });

  describe('GET /issues - Fetch Issues', () => {
    test('successfully fetches issues', async () => {
      const mockIssues = [
        {
          id: 'issue-1',
          title: 'Issue 1',
          description: 'Description 1',
          status: 'reported',
          category: 'Road & Transportation',
          location: 'Location 1',
          reportedBy: 'user-1',
          reporterName: 'Test User',
          reportedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ issues: mockIssues })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            analytics: {
              totalIssues: 1,
              recentIssues: 1,
              resolutionRate: 0,
              avgResolutionDays: 0,
              dailyReports: [],
              categoryBreakdown: { 'Road & Transportation': 1 },
              priorityDistribution: { medium: 1 },
              statusFlow: { reported: 1 }
            }
          })
        });

      render(<Dashboard session={mockSession} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `https://${mockProjectId}.supabase.co/functions/v1/make-server-accecacf/issues`,
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer mock-key`
            })
          })
        );
        expect(global.fetch).toHaveBeenCalledWith(
          `https://${mockProjectId}.supabase.co/functions/v1/make-server-accecacf/analytics`,
          expect.any(Object)
        );
      });
    });
  });

  describe('PATCH /issues/:id/status - Update Issue Status', () => {
    test('successfully updates issue status', async () => {
      const mockIssue = {
        id: 'issue-1',
        title: 'Test Issue',
        status: 'reported',
        adminNote: ''
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ issues: [mockIssue] })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, issue: { ...mockIssue, status: 'resolved' } })
        });

      render(<AdminPanel session={mockSession} />);

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument();
      });

      // Click update button (assuming it's rendered)
      const updateButtons = screen.getAllByRole('button', { name: /Update/ });
      fireEvent.click(updateButtons[0]);

      // Select new status
      const statusSelect = screen.getByRole('combobox', { name: /Status/ });
      fireEvent.change(statusSelect, { target: { value: 'resolved' } });

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /Update Issue/ }));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `https://${mockProjectId}.supabase.co/functions/v1/make-server-accecacf/issues/issue-1/status`,
          expect.objectContaining({
            method: 'PATCH',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mockSession.access_token}`
            }),
            body: JSON.stringify({ status: 'resolved', adminNote: undefined })
          })
        );
      });
    });
  });
});