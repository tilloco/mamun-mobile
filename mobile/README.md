# Mobile — Expo + TypeScript

3-bosqichda tayyor bo'lgan ekranlar:

- **Onboarding**: telefon raqam → SMS OTP → ism + imtihon sanasi
- **Dashboard**: progress foizi, streak, imtihongacha qolgan kun, tezlik prognozi, zaif mavzular
- **Kurs**: modul → hafta → dars ro'yxati
- **Dars**: matn o'qish + testni boshlash
- **Test**: savol-javob, darhol to'g'ri/noto'g'ri + tushuntirish, bepul limitga yetganda ogohlantirish
- **Profil**: ma'lumotlar + chiqish

Barcha ekranlar hozirgi backend (2-bosqich, xavfsizlik yamog'i bilan) API'siga ulangan — mock data yo'q.

## O'rnatish

```bash
cd mobile
npm install
cp .env.example .env
```

`.env` faylida `EXPO_PUBLIC_API_URL` ni backend manzilingizga moslang:
- Simulyator/emulyatorda: `http://localhost:3000` ishlaydi
- Fizik telefonda (Expo Go orqali): kompyuteringizning lokal tarmoq IP manzilini yozing,
  masalan `http://192.168.1.5:3000` (telefon va kompyuter bir Wi-Fi tarmog'ida bo'lishi kerak)

## Ishga tushirish

```bash
npx expo start
```

Terminaldagi QR kodni Expo Go ilovasi (iOS/Android) bilan skanerlang, yoki `i`/`a` tugmalarini
bosib simulyator/emulyatorda oching.

Backend ham parallel ishlab turishi kerak (`cd ../backend && npm run start:dev`).

## Muhim eslatmalar

- Token qurilmaning himoyalangan xotirasida (`expo-secure-store` — iOS Keychain / Android
  Keystore) saqlanadi, oddiy AsyncStorage'da emas.
- `src/types/api.ts` — `/shared/api-types.ts` ning nusxasi. Hozircha ikkalasi qo'lda
  sinxronlanadi; keyingi bosqichda (admin panel qo'shilganda) buni haqiqiy npm workspace
  monorepo qilib, bitta manba qoldirish tavsiya etiladi.
- `@react-native-community/datetimepicker` native modul, shuning uchun Expo Go'da ishlaydi,
  lekin agar keyinchalik "bare"/EAS build qilsangiz qo'shimcha sozlash kerak emas (Expo
  avtomatik boshqaradi).

## Keyingi bosqich

4-bosqich: referral va premium logikasi backend'da (bu ekranlarga "Premium sotib olish"
va "Do'stlarni taklif qilish" ekranlari qo'shiladi).
