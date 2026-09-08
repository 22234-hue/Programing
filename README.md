# MC Chat — Vercel + Supabase

เว็บแชทสำหรับนักเรียนแลกเปลี่ยนความรู้ ธีมชมพู–ฟ้า พร้อมพื้นหลัง **MN School** รองรับแชทส่วนตัว กลุ่ม บันทึกส่วนตัว รูปภาพ ข้อความเสียง ไฟล์ การตอบกลับ แก้ไข ลบ reaction และสถานะอ่าน ใช้งานได้ทั้งคอมพิวเตอร์และโทรศัพท์

ชุดนี้เป็น Next.js สำหรับ Vercel โดยตรง ใช้ Supabase สำหรับ:

- Auth: เข้าสู่ระบบด้วยลิงก์ที่ส่งไปทางอีเมล
- Postgres: ผู้ใช้ เพื่อน ห้อง สมาชิก ข้อความ และข้อมูลไฟล์
- Private Storage: รูป เสียง และไฟล์ไม่เกิน 10 MB

ไฟล์ถูกอัปโหลดตรงไป Supabase ผ่าน signed upload URL จึงไม่ชนข้อจำกัด request body ของ Vercel Function ข้อมูลและไฟล์ของเว็บไซต์เดิมไม่ได้ถูกย้ายมาใน ZIP นี้ ระบบใหม่จะเริ่มด้วยฐานข้อมูลใหม่

## 1. สร้าง Supabase

1. สมัครและสร้าง Project ที่ [Supabase](https://supabase.com/)
2. เปิด **SQL Editor** เลือก **New query**
3. คัดลอกทั้งหมดจาก `supabase/migrations/001_initial_schema.sql` วางแล้วกด **Run** เพียงครั้งเดียว
4. ไปที่ **Authentication → URL Configuration**
   - Site URL ตอนพัฒนา: `http://localhost:3000`
   - หลัง Deploy: เปลี่ยน Site URL เป็น URL ของ Vercel
   - เพิ่ม Redirect URL: `http://localhost:3000/auth/callback`
   - เพิ่ม Redirect URL ของ Vercel เช่น `https://your-project.vercel.app/auth/callback`
5. ไปที่ **Project Settings → API** เก็บ Project URL, Publishable key และ Service role key
6. ไปที่ปุ่ม **Connect → Transaction pooler** คัดลอก PostgreSQL connection string และใส่รหัสผ่านฐานข้อมูลแทน `[YOUR-PASSWORD]`

`SUPABASE_SERVICE_ROLE_KEY` และ `DATABASE_URL` เป็นความลับ ห้ามใส่ในโค้ดหรือส่งขึ้น GitHub

## 2. ตั้งค่าเครื่อง

ต้องใช้ Node.js 22

```bash
npm install
cp .env.example .env.local
npm run dev
```

แก้ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
DATABASE_URL=postgresql://postgres.YOUR_PROJECT:YOUR_PASSWORD@YOUR_POOLER_HOST:6543/postgres
NEXT_PUBLIC_STORAGE_BUCKET=mc-chat
STORAGE_BUCKET=mc-chat
```

ถ้ารหัสผ่านฐานข้อมูลมี `@`, `:`, `/`, `#` หรือ `%` ต้อง URL-encode ก่อนใส่ใน `DATABASE_URL`

## 3. Deploy บน Vercel

1. แตก ZIP แล้วอัปโหลดโฟลเดอร์นี้ไป GitHub หรือ Import เข้า Vercel
2. ใน Vercel เลือก **Add New → Project** และเลือก repository
3. Framework Preset ใช้ **Next.js** และ Build Command ใช้ `npm run build`
4. ใน **Settings → Environment Variables** เพิ่มตัวแปร 6 ตัวจากตัวอย่างด้านบนให้ครบทั้ง Production และ Preview
5. กด Deploy
6. นำ URL ที่ได้ไปเพิ่มใน Supabase Auth URL Configuration ตามขั้นตอนข้อ 1
7. Deploy ซ้ำหนึ่งครั้งหลังตั้ง URL เสร็จ

## การทำงานและความปลอดภัย

หน้าแนะนำเปิดสาธารณะ แต่ข้อมูลแชทต้องเข้าสู่ระบบ API ตรวจตัวตนและสมาชิกห้องทุกครั้ง รูปและเสียงอยู่ใน bucket ส่วนตัว ลิงก์เปิดไฟล์มีอายุ 60 วินาที ตารางเปิด RLS และไม่มี policy สำหรับ browser; server ใช้ connection และ service key ที่เก็บใน Vercel เท่านั้น

ระบบอัปเดตข้อความด้วย polling ประมาณ 4 วินาที ไม่ใช่ WebSocket ผู้ใช้ต้องเปิดลิงก์อีเมลเพื่อเข้าสู่ระบบ ไมโครโฟนต้องใช้ HTTPS และผู้ใช้ต้องอนุญาตจากเบราว์เซอร์

## ตรวจโค้ด

```bash
npm run typecheck
npm test
npm run build
```

โครงสร้างสำคัญ:

- `features/chat/components/chat.tsx` หน้าจอแชท
- `app/api/chat/route.ts` ข้อความ เพื่อน ห้อง และสิทธิ์
- `app/api/files/route.ts` signed upload/download และตรวจชนิดไฟล์
- `features/chat/components/media-composer.tsx` ส่งรูปและอัดเสียง
- `lib/auth/` ระบบบัญชีและ Supabase clients
- `lib/database/chat.ts` PostgreSQL adapter และการตรวจสมาชิก
- `lib/media/validation.ts` ตรวจรูปแบบสื่อและช่วงข้อมูลเสียง
- `supabase/migrations/001_initial_schema.sql` ตาราง ดัชนี RLS และ private bucket
- `public/assets/images/mn-school.webp` พื้นหลัง MN School
- `docs/FILE-STRUCTURE.md` แผนผังหมวดไฟล์ทั้งหมด
