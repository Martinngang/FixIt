export interface UserReputation {
  points: number;
  badge: 'newcomer' | 'active_citizen' | 'civic_contributor' | 'community_champion';
  nextBadge: { key: string; pointsNeeded: number } | null;
  breakdown: {
    reported: number;
    resolved: number;
    upvotesReceived: number;
  };
}

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
  reputation?: UserReputation;
  marketplaceStatus?: 'pending' | 'approved' | 'rejected';
  stripeOnboardingComplete?: boolean;
}