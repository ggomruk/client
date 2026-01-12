import type { Metadata } from "next";
import './globals.css';
import { AuthProvider } from "./contexts/AuthContext";

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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
