import { Urbanist } from "next/font/google";
import type { Metadata } from "next";
import './globals.css';
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./app/_components/ErrorBoundary";
import { Toaster } from "./app/_components/ui/sonner";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "stratyix - Algorithmic Trading Platform",
  description: "Advanced algorithmic trading and backtesting platform",
  icons: {
    icon: [
      { url: '/logo/logo_128_128.svg', type: 'image/svg+xml' },
    ],
    apple: '/logo/logo_256_256.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col">
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
