# Admin panel — ishga tushirish

Bu Next.js ilova bo'lib, `backend` ishlab turgan bo'lishi shart (avval backend'ni
ishga tushiring — `backend/README.md` ga qarang).

## 1. Birinchi admin hisobini yarating

Backend papkasida (bir marta):
```bash
cd backend
npm run admin:create
```
Email va parol so'raladi — shu ma'lumotlar bilan admin panelga kirasiz.

## 2. Admin panelni sozlang va ishga tushiring

```bash
cd admin
npm install
cp .env.example .env
npm run dev
```

Brauzerda **http://localhost:3001** ni oching. Login sahifasiga tushasiz — yuqorida
yaratgan email/parolni kiriting.

## Nima bor

- **Login** — email + parol, backend'dan olingan token httpOnly cookie'da xavfsiz saqlanadi
  (brauzer JavaScript'i unga umuman kira olmaydi)
- **Umumiy holat** (`/`) — jami foydalanuvchi, faol Premium, DAU/WAU, daromad
- **Foydalanuvchilar** (`/users`) — rasm (yoki bosh harflar), ism, telefon, **Premium/Bepul
  belgisi**, streak, hamyon balansi; ism/telefon bo'yicha qidiruv va Premium/Bepul filtri
- **Foydalanuvchi tafsiloti** (`/users/:id`) — to'lovlar tarixi, progress statistikasi

## Keyingi qadamlar (istasangiz)

Backend'da tayyor, lekin admin panelga hali UI qo'shilmagan qismlar:
- Kontent boshqaruvi (`/content/*` endpointlar orqali modul/dars/savol qo'shish)
- Referral pul yechish so'rovlarini tasdiqlash (`/referral/admin/withdrawals`)

Bularni ham xohlasangiz, xuddi shu naqsh bo'yicha (`app/(dashboard)/...` ostiga yangi
sahifa) qo'shish mumkin — aytsangiz quraman.
