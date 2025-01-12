import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
/*import LoadingScreen from '@/components/LoadingScreen';*/

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GauchoClass',
  description: 'UCSB Course Explorer and Grade Distribution',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="pt-16 min-h-screen bg-black">
          {children}
        </main>
      </body>
    </html>
  );
}