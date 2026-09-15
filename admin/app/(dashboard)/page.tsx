import { adminFetch } from '@/lib/api';
import { StatCard } from '@/components/StatCard';
import type { AdminStats } from '@/lib/types';

function formatSom(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
}

export default async function OverviewPage() {
  const stats = await adminFetch<AdminStats>('/admin/stats');

  return (
    <div>
      <h1 className="font-display text-2xl text-ink900 mb-6">Umumiy holat</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Jami foydalanuvchi" value={stats.totalUsers} />
        <StatCard label="Faol Premium" value={stats.activePremium} accent="brass" />
        <StatCard label="Bepul foydalanuvchi" value={stats.freeUsers} accent="sage" />
        <StatCard label="Bugun qo'shilgan" value={stats.newUsersToday} />
        <StatCard label="Kunlik faol (DAU)" value={stats.dailyActiveUsers} />
        <StatCard label="Haftalik faol (WAU)" value={stats.weeklyActiveUsers} />
      </div>

      <div className="mt-4">
        <StatCard label="Jami daromad" value={formatSom(stats.totalRevenue)} accent="brass" />
      </div>
    </div>
  );
}
