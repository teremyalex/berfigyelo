import type { Metadata } from "next";
import "./globals.css";
import Pixel from "./pixel";

export const metadata: Metadata = {
  title: "IT Fizetések",
  description: "IT Fizetések",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu">
      <body>
      <Pixel />
        {children}
      </body>
    </html>
  );
}
