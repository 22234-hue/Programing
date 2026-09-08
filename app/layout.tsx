import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MC Chat — พื้นที่แลกเปลี่ยนความรู้ของนักเรียน",
  description: "MC Chat คือแชท พื้นที่สำหรับนักเรียนเพื่อแลกเปลี่ยนความรู้ แชร์รูป ส่งข้อความเสียง และเรียนรู้ไปด้วยกัน",
  icons: {
    icon: "/assets/brand/mc-logo.svg",
    shortcut: "/assets/brand/mc-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased">{children}</body>
    </html>
  );
}
