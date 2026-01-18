import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QQuotes - Modern, Fast, Reliable',
  description: 'The ultimate quotes library for TypeScript applications. Sub-millisecond performance, 100% type safety.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
