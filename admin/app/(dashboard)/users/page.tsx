import Link from 'next/link';
import { adminFetch } from '@/lib/api';
import { Avatar } from '@/components/Avatar';
import { PremiumBadge } from '@/components/Badge';
import type { UsersResponse } from '@/lib/types';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; page?: string };
}) {
  const search = searchParams.search || '';
  const status = (searchParams.status as 'premium' | 'free' | 'all') || 'all';
  const page = searchParams.page || '1';

  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (status && status !== 'all') query.set('status', status);
  query.set('page', page);

  const data = await adminFetch<UsersResponse>(`/admin/users?${query.toString()}`);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink900 mb-6">Foydalanuvchilar</h1>

      <form className="flex flex-wrap gap-3 mb-5" action="/users">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Ism yoki telefon bo'yicha qidirish..."
          className="border border-line rounded-sm px-3 py-2 text-sm w-64 focus:border-brass outline-none bg-panel"
        />
        <select
          name="status"
          defaultValue={status}
          className="border border-line rounded-sm px-3 py-2 text-sm bg-panel focus:border-brass outline-none"
        >
          <option value="all">Barchasi</option>
          <option value="premium">Premium</option>
          <option value="free">Bepul</option>
        </select>
        <button type="submit" className="bg-ink text-paper rounded-sm px-4 py-2 text-sm hover:bg-inkLight transition-colors">
          Qidirish
        </button>
      </form>

      <div className="bg-panel border border-line rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="px-4 py-3 font-medium">Foydalanuvchi</th>
              <th className="px-4 py-3 font-medium">Telefon</th>
              <th className="px-4 py-3 font-medium">Holat</th>
              <th className="px-4 py-3 font-medium">Streak</th>
              <th className="px-4 py-3 font-medium">Hamyon</th>
              <th className="px-4 py-3 font-medium">Qo'shilgan</th>
            </tr>
          </thead>
          <tbody>
            {data.items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  Hech kim topilmadi.
                </td>
              </tr>
            )}
            {data.items.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0 hover:bg-paper/60">
                <td className="px-4 py-3">
                  <Link href={`/users/${u.id}`} className="flex items-center gap-3">
                    <Avatar name={u.name} phone={u.phone} avatarUrl={u.avatarUrl} />
                    <span className="text-ink900 font-medium">{u.name || 'Ism kiritilmagan'}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{u.phone}</td>
                <td className="px-4 py-3">
                  <PremiumBadge active={u.isPremiumActive} />
                </td>
                <td className="px-4 py-3 text-ink900">{u.streak} kun</td>
                <td className="px-4 py-3 text-ink900">{new Intl.NumberFormat('uz-UZ').format(u.walletBalance)} so'm</td>
                <td className="px-4 py-3 text-muted">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.totalPages > 1 && (
        <div className="flex items-center gap-2 mt-4 text-sm">
          {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/users?${new URLSearchParams({ ...(search ? { search } : {}), ...(status !== 'all' ? { status } : {}), page: String(p) }).toString()}`}
              className={`w-8 h-8 flex items-center justify-center rounded-sm border ${
                p === data.page ? 'bg-ink text-paper border-ink' : 'border-line text-ink900 hover:bg-paper'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
