import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { NotificationsPanel } from '../components/NotificationsPanel.tsx';
import { jest, beforeEach, test, describe, expect } from '@jest/globals';

// Mock fetch globally
// @ts-ignore
global.fetch = jest.fn();

const mockSession = {
  access_token: 'mock-token',
  user: { id: 'user-1', email: 'test@example.com' }
};

const mockProjectId = 'test-project-id';

jest.mock('../utils/supabase/info', () => ({
  projectId: mockProjectId,
  publicAnonKey: 'mock-key'
}));

describe('Notifications API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /notifications - Fetch Notifications', () => {
    test('successfully fetches notifications', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'issue_assigned',
          title: 'New Issue Assigned',
          message: 'An issue has been assigned to you.',
          isRead: false,
          createdAt: new Date().toISOString(),
          priority: 'medium'
        },
        {
          id: 'notif-2',
          type: 'system',
          title: 'System Maintenance',
          message: 'Scheduled maintenance tomorrow.',
          isRead: true,
          createdAt: new Date().toISOString(),
          priority: 'high'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: mockNotifications })
      });

      render(<NotificationsPanel session={mockSession} userRole="technician" />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `https://${mockProjectId}.supabase.co/functions/v1/make-server-accecacf/notifications`,
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockSession.access_token}`
            })
          })
        );
      });

      // Check if notifications are displayed
      expect(screen.getByText('New Issue Assigned')).toBeInTheDocument();
      expect(screen.getByText('System Maintenance')).toBeInTheDocument();
    });
  });

  describe('PATCH /notifications/:id/read - Mark Notification as Read', () => {
    test('successfully marks a notification as read', async () => {
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'issue_assigned',
          title: 'Unread Notification',
          message: 'This is an unread notification.',
          isRead: false,
          createdAt: new Date().toISOString(),
          priority: 'medium'
        }
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ notifications: mockNotifications })
      });

      render(<NotificationsPanel session={mockSession} userRole="technician" />);

      await waitFor(() => {
        expect(screen.getByText('Unread Notification')).toBeInTheDocument();
      });

      // Mock the PATCH request for marking as read
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      // Find and click the "Mark as read" button
      const markAsReadButton = screen.getByTitle('Mark as read');
      fireEvent.click(markAsReadButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `https://${mockProjectId}.supabase.co/functions/v1/make-server-accecacf/notifications/notif-1/read`,
          expect.objectContaining({ method: 'PATCH' })
        );
      });
    });
  });
});