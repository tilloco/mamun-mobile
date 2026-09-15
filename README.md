# Huquq Imtihoniga Tayyorgarlik — Monorepo

Bu repo uchta qismdan iborat bo'ladi:

```
/backend   → NestJS + Prisma + PostgreSQL API (TAYYOR — shu bosqichda)
/mobile    → React Native + Expo + TypeScript ilova (KEYINGI BOSQICH)
/admin     → Next.js + Tailwind admin panel (KEYINGI BOSQICH)
/shared    → umumiy TypeScript typelar (mobile va admin uchun) (KEYINGI BOSQICH)
```

## Qurish tartibi (rejadagi 8 bosqich)

- [x] 1. Monorepo struktura
- [x] 2. Backend: Prisma schema, SMS OTP autentifikatsiya, asosiy CRUD + XAVFSIZLIK YAMOG'I
- [x] 3. Mobil: onboarding, dashboard, lesson, quiz ekranlari
- [ ] 4. Referral va premium logikasi backend'da
- [ ] 5. Click/Payme webhook integratsiyasi
- [ ] 6. Admin panel: login, kontent CRUD, foydalanuvchilar, analitika
- [ ] 7. Push notification scheduled job
- [ ] 8. AI shaxsiylashtirilgan tavsiya endpointi

Har bir bosqich alohida, ishlaydigan holatda beriladi — avvalgisi tugamaguncha keyingisiga o'tilmaydi.

Batafsil ishga tushirish uchun `/backend/README.md` ga qarang.
