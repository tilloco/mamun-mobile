import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

// Bu route brauzerdan emas, faqat login formasidan chaqiriladi. Token'ni javobda
// JavaScript'ga qaytarish O'RNIGA httpOnly cookie sifatida o'rnatadi - shunda token
// sahifadagi hech qanday skriptga (shu jumladan uchinchi tomon kutubxonalariga yoki
// XSS orqali kiritilgan kodga) ko'rinmaydi.
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const backendRes = await fetch(`${BACKEND_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    return NextResponse.json({ message: data?.message || "Email yoki parol noto'g'ri" }, { status: backendRes.status });
  }

  const response = NextResponse.json({ admin: data.admin });
  response.cookies.set('admin_token', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 soat - backenddagi ADMIN_JWT_EXPIRES_IN bilan mos
  });
  return response;
}
