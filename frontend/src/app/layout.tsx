import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Compass DABox - Caja de Ahorro",
  description: "Plataforma de ahorro para colaboradores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} min-h-screen antialiased`}>
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased">
        {children}
        <Toaster theme="light" position="top-right" closeButton richColors />
      </body>
    </html>
  );
}
