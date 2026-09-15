import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { PremiumBadge } from '@/components/Badge';

type UserDetail = {
  id: string;
  name: string | null;
  phone: string;
  avatarUrl: string | null;
  isPremiumActive: boolean;
  premiumExpiresAt: string | null;
  walletBalance: number;
  examDate: string | null;
  createdAt: string;
  streak: { currentCount: number } | null;
  payments: { id: string; amount: number; months: number; provider: string; status: string; createdAt: string }[];
  referralsMade: { id: string; rewardAmount: number; status: string }[];
  _count: { progress: number; answers: number };
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const user = await adminFetch<UserDetail>(`/admin/users/${params.id}`);

  return (
    <div>
      <Link href="/users" className="text-sm text-muted hover:text-ink900">
        ← Foydalanuvchilarga qaytish
      </Link>

      <div className="flex items-center gap-4 mt-4 mb-8">
        <Avatar name={user.name} phone={user.phone} avatarUrl={user.avatarUrl} size={56} />
        <div>
          <h1 className="font-display text-2xl text-ink900">{user.name || 'Ism kiritilmagan'}</h1>
          <p className="text-muted text-sm">{user.phone}</p>
        </div>
        <div className="ml-auto">
          <PremiumBadge active={user.isPremiumActive} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-panel border border-line rounded-md px-4 py-3">
          <p className="text-xs text-muted">Streak</p>
          <p className="font-display text-xl text-ink900">{user.streak?.currentCount ?? 0} kun</p>
        </div>
        <div className="bg-panel border border-line rounded-md px-4 py-3">
          <p className="text-xs text-muted">Tugatilgan darslar</p>
          <p className="font-display text-xl text-ink900">{user._count.progress}</p>
        </div>
        <div className="bg-panel border border-line rounded-md px-4 py-3">
          <p className="text-xs text-muted">Javob berilgan savollar</p>
          <p className="font-display text-xl text-ink900">{user._count.answers}</p>
        </div>
        <div className="bg-panel border border-line rounded-md px-4 py-3">
          <p className="text-xs text-muted">Hamyon</p>
          <p className="font-display text-xl text-ink900">{new Intl.NumberFormat('uz-UZ').format(user.walletBalance)} so'm</p>
        </div>
      </div>

      <h2 className="font-display text-lg text-ink900 mb-3">To'lovlar tarixi</h2>
      <div className="bg-panel border border-line rounded-md overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="px-4 py-2 font-medium">Sana</th>
              <th className="px-4 py-2 font-medium">Summa</th>
              <th className="px-4 py-2 font-medium">Provayder</th>
              <th className="px-4 py-2 font-medium">Holat</th>
            </tr>
          </thead>
          <tbody>
            {user.payments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted">
                  Hozircha to'lov yo'q
                </td>
              </tr>
            )}
            {user.payments.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-2 text-muted">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-2 text-ink900">{new Intl.NumberFormat('uz-UZ').format(p.amount)} so'm</td>
                <td className="px-4 py-2 text-ink900">{p.provider}</td>
                <td className="px-4 py-2 text-ink900">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
