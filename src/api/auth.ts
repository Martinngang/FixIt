import { User } from '../types/user';

// Mock API for authentication
export const login = async (email: string, password: string): Promise<User> => {
  // TODO: Replace with real API call
  return { email, role: email.includes('admin') ? 'admin' : 'citizen' };
};

export const register = async (email: string, password: string): Promise<User> => {
  // TODO: Replace with real API call
  return { email, role: 'citizen' };
};