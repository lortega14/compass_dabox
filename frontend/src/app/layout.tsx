import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export const metadata: Metadata = {
  title: "dabox - Caja de Ahorro",
  description: "Plataforma de ahorro para colaboradores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} min-h-screen antialiased`}>
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased">
        {children}
        <Toaster theme="light" position="top-right" closeButton richColors />
      </body>
    </html>
  );
}
