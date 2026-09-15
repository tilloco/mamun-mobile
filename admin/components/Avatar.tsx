import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/api';

function initialsOf(name: string | null, phone: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
  return phone.slice(-2);
}

export function Avatar({ name, phone, avatarUrl, size = 36 }: { name: string | null; phone: string; avatarUrl: string | null; size?: number }) {
  const url = resolveMediaUrl(avatarUrl);

  if (url) {
    return (
      <Image
        src={url}
        alt={name || phone}
        width={size}
        height={size}
        className="rounded-full object-cover border border-line"
        style={{ width: size, height: size }}
      />
    );
  }

  // Rasm yo'q bo'lsa ismning bosh harflari bilan doira - hech qachon bo'sh joy qolmaydi
  return (
    <div
      className="rounded-full bg-sageLight text-sage flex items-center justify-center font-medium border border-line"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initialsOf(name, phone)}
    </div>
  );
}
