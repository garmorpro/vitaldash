import type { Metadata } from "next";
import { frauncesDisplay } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "VitalDash",
  description: "Daily weight and step tracking.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${frauncesDisplay.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
