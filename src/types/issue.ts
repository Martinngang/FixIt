export interface Issue {
  id: number;
  description: string;
  category: string;
  location: string;
  status: 'Received' | 'In Progress' | 'Fixed';
  image: string | null;
}