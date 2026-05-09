import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NairaLog",
  description: "Nigerian multi-bank expense tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NairaLog",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0F6E56",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className="font-sans antialiased bg-gray-50">
        <div className="min-h-screen flex flex-col items-center">
          <div className="w-full max-w-mobile min-h-screen bg-white relative">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
