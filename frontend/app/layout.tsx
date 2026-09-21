import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IIITG Sports 26",
  description: "IIITG Freshers' Cup 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}