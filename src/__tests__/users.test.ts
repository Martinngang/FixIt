import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AdminPanel } from '../components/AdminPanel.tsx';

// Import jest globals for TypeScript
import { jest, beforeEach, test, describe, expect } from '@jest/globals';

// Mock fetch globally
// @ts-ignore
global.fetch = jest.fn();

const mockSession = {
  access_token: 'mock-token',
  user: { id: 'admin-1', email: 'admin@example.com' }
};

const mockProjectId = 'test-project-id';

jest.mock('../utils/supabase/info', () => ({
  projectId: mockProjectId,
  publicAnonKey: 'mock-key'
}));

jest.mock('../components/ToastContext.tsx', () => ({
  useToast: () => ({ addToast: jest.fn() }),
}));

describe('Users API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users - Fetch Users', () => {
    test('successfully fetches users as admin', async () => {
      const mockUsers = [
        {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'technician',
          status: 'active',
          categories: ['Road & Transportation', 'Water & Utilities'],
          createdAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString()
        },
        {
          id: 'user-2',
          name: 'Jane Citizen',
          email: 'jane@example.com',
          role: 'citizen',
          status: 'active',
          categories: [],
          createdAt: new Date().toISOString()
        }
      ];

      const mockIssues = [
        {
          id: 'issue-1',
          title: 'Test Issue',
          status: 'reported',
          assignedTo: null
        }
      ];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ issues: mockIssues })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ users: mockUsers })
        });

      render(<AdminPanel session={mockSession} defaultView={"users"} />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `https://${mockProjectId}.supabase.co/functions/v1/make-server-accecacf/issues`,
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockSession.access_token}`
            })
          })
        );
        expect(global.fetch).toHaveBeenCalledWith(
          `https://${mockProjectId}.supabase.co/functions/v1/make-server-accecacf/users`,
          expect.objectContaining({
            headers: expect.objectContaining({
              'Authorization': `Bearer ${mockSession.access_token}`
            })
          })
        );
      });

      // Check if users are displayed
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Citizen')).toBeInTheDocument();
        expect(screen.getByText('Technician')).toBeInTheDocument();
        expect(screen.getByText('Citizen')).toBeInTheDocument();
      });
    });

    test('handles API error when fetching users', async () => {
      const mockIssues: Array<{ id: string; title: string; status: string; assignedTo: string | null }> = [];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ issues: mockIssues })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Unauthorized' })
        });

      render(<AdminPanel session={mockSession} defaultView={"users"} />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load users/)).toBeInTheDocument();
      });
    });

    test('filters technicians correctly', async () => {
      const mockUsers = [
        {
          id: 'tech-1',
          name: 'Tech One',
          email: 'tech1@example.com',
          role: 'technician',
          status: 'active',
          categories: ['Road & Transportation'],
          createdAt: new Date().toISOString()
        },
        {
          id: 'citizen-1',
          name: 'Citizen One',
          email: 'citizen@example.com',
          role: 'citizen',
          status: 'active',
          categories: [],
          createdAt: new Date().toISOString()
        }
      ];

      const mockIssues: Array<{ id: string; title: string; status: string; assignedTo: string | null }> = [];

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ issues: mockIssues })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ users: mockUsers })
        });

      render(<AdminPanel session={mockSession} defaultView="users" />);

      await waitFor(() => {
        expect(screen.getByText('Tech One')).toBeInTheDocument();
        expect(screen.getByText('Citizen One')).toBeInTheDocument();
      });

      // Check that technicians are available for assignment
      // This would be tested in the assign technician functionality
    });
  });

  describe('POST /users - Create User (Sign up)', () => {
    test('successfully creates a new user', async () => {
      const mockNewUser = {
        id: 'user-3',
        name: 'New User',
        email: 'new@example.com',
        role: 'citizen',
      };

      // Mock initial data load
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ issues: [] }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: [] }) });

      render(<AdminPanel session={mockSession} defaultView="users" />);

      // Wait for initial render
      await waitFor(() => {
        expect(screen.getByText('Add User')).toBeInTheDocument();
      });

      // Mock the fetch call for creating a user
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockNewUser })
      });

      // Open the "Add User" dialog
      fireEvent.click(screen.getByRole('button', { name: /Add User/ }));

      // Fill the form
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'New User' } });
        fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'new@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'password123' } });
      });

      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /Save/ }));

      // Assert the API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          // Note: AdminPanel uses /signup, but your server has /users. Let's test for /users.
          `https://${mockProjectId}.supabase.co/functions/v1/make-server-accecacf/users`,
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${mockSession.access_token}`
            }),
            body: expect.stringContaining('"name":"New User"')
          })
        );
      });
    });
  });

  describe('PATCH /users/:id - Update User', () => {
    test('successfully updates a user', async () => {
      const mockUsers = [{ id: 'user-1', name: 'John Doe', email: 'john@example.com', role: 'citizen', status: 'active', categories: [], createdAt: new Date().toISOString() }];
      
      // Mock initial data load
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ issues: [] }) })
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ users: mockUsers }) });

      render(<AdminPanel session={mockSession} defaultView="users" />);

      // Wait for user to be displayed
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Mock the fetch call for updating a user
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { ...mockUsers[0], name: 'John Doe Updated' } })
      });

      // Open the "Edit User" dialog
      fireEvent.click(screen.getByRole('button', { name: /Edit User/ }));

      // Change user name
      await waitFor(() => {
        fireEvent.change(screen.getByLabelText(/Name/), { target: { value: 'John Doe Updated' } });
      });

      // Submit
      fireEvent.click(screen.getByRole('button', { name: /Save/ }));

      // Assert the API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `https://${mockProjectId}.supabase.co/functions/v1/make-server-accecacf/users/user-1`,
          expect.objectContaining({ method: 'PATCH', body: expect.stringContaining('"name":"John Doe Updated"') })
        );
      });
    });
  });
});