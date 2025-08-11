# Debt Tracker (Next.js + SQLite)

## تشغيل المشروع محليًا:
1. تثبيت الاعتمادات:
```bash
npm install
```
2. إنشاء قاعدة البيانات وتشغيل المايجريشن:
```bash
npx prisma generate
npx prisma migrate dev --name init
```
3. تشغيل السيرفر:
```bash
npm run dev
```
افتح http://localhost:3000.
