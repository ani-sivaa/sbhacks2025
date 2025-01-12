import type { Metadata } from 'next';
import { Space_Grotesk, Unbounded } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
/*import LoadingScreen from '@/components/LoadingScreen';*/

const unbounded = Unbounded({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-unbounded',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  display: 'swap',
});

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
      <body className={`${spaceGrotesk.className} ${unbounded.variable}`}>
        <Navbar />
        <main className="pt-16 min-h-screen bg-black">
          {children}
        </main>
      </body>
    </html>
  );
}