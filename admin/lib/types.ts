export type AdminUser = {
  id: string;
  name: string | null;
  phone: string;
  avatarUrl: string | null;
  isPremium: boolean;
  isPremiumActive: boolean;
  premiumExpiresAt: string | null;
  walletBalance: number;
  examDate: string | null;
  createdAt: string;
  streak: number;
};

export type UsersResponse = {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminStats = {
  totalUsers: number;
  activePremium: number;
  freeUsers: number;
  newUsersToday: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  totalRevenue: number;
};
