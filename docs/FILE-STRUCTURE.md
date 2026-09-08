# โครงสร้างไฟล์ MC Chat

ไฟล์ถูกแบ่งตามหน้าที่เพื่อให้หา แก้ไข และส่งต่องานได้ง่าย:

```text
MC-Chat-Vercel-Supabase/
├── app/                         # หน้าและ API ตามระบบ App Router
│   ├── api/
│   │   ├── chat/route.ts        # ข้อความ เพื่อน ห้อง และสถานะอ่าน
│   │   └── files/route.ts       # อัปโหลดและเปิดไฟล์แบบมีสิทธิ์
│   ├── auth/                    # Callback และออกจากระบบ
│   ├── login/                   # หน้าเข้าสู่ระบบ
│   ├── globals.css              # ธีมรวมและ responsive layout
│   ├── layout.tsx               # Metadata และ layout หลัก
│   └── page.tsx                 # หน้าแรกและจุดเข้าแชท
├── features/
│   └── chat/                    # โมดูลระบบแชท
│       ├── index.ts             # จุด export ของโมดูล
│       └── components/          # UI เฉพาะระบบแชท
│           ├── chat.tsx
│           ├── media-composer.tsx
│           └── message-media.tsx
├── components/ui/               # UI พื้นฐานที่ใช้งานจริงร่วมกัน
├── lib/
│   ├── auth/                    # Supabase browser/server และ session
│   ├── database/                # PostgreSQL adapter และ authorization
│   ├── media/                   # ตรวจ MIME, signature และ byte range
│   └── utils.ts                 # Utility ของ UI
├── public/assets/
│   ├── brand/                   # โลโก้ MC
│   └── images/                  # ภาพพื้นหลัง MN School
├── styles/vendor/               # CSS ภายนอกพร้อมไฟล์ลิขสิทธิ์
├── supabase/migrations/         # SQL เริ่มต้นฐานข้อมูลและ Storage
├── tests/                       # Tests สำหรับสื่อ สิทธิ์ และโครงสร้าง
├── .env.example                 # รายชื่อตัวแปรแวดล้อม
├── proxy.ts                     # ต่ออายุ Supabase session
└── vercel.json                  # ตั้งค่า Deploy
```

ไฟล์ config ของ Next.js, TypeScript, PostCSS, ESLint, npm และ Vercel ต้องอยู่รากโปรเจกต์ เพราะเครื่องมือแต่ละตัวค้นหาไฟล์เหล่านี้จากตำแหน่งนี้โดยตรง
