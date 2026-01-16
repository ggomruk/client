import { Urbanist } from "next/font/google";
import type { Metadata } from "next";
import './globals.css';
import { AuthProvider } from "./contexts/AuthContext";
import ErrorBoundary from "./app/_components/ErrorBoundary";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "stratyix - Algorithmic Trading Platform",
  description: "Advanced algorithmic trading and backtesting platform",
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
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
