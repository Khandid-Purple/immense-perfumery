import type { Metadata } from 'next';
import { Poppins, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/Providers';
import { Shell } from '@/components/Shell';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-poppins',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const SITE_IMAGE = 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop';

export const metadata: Metadata = {
  title: 'Immense Perfumery',
  description: 'Immense Perfumery - Discover your signature scent with our premium collection and AI-powered recommendations.',
  openGraph: {
    type: 'website',
    url: 'https://immense-perfumery.com/',
    title: 'Immense Perfumery',
    description: 'Discover your signature scent with our premium collection and AI-powered recommendations.',
    images: [SITE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Immense Perfumery',
    description: 'Discover your signature scent with our premium collection and AI-powered recommendations.',
    images: [SITE_IMAGE],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
