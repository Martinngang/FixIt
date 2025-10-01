export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
  role: 'citizen' | 'technician' | 'admin';
  categories?: string[];
  created_at?: string;
  last_sign_in_at?: string;
}