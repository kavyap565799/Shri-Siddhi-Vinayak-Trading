import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: {
    default: 'Shri Siddhi Vinayak Trading Co. — Industrial Tools & Equipment',
    template: '%s | Shri Siddhi Vinayak Trading Co.',
  },
  description:
    'Your trusted partner for industrial tools, electric power tools, welding accessories, project materials, and safety equipment in Motikhavdi, Jamnagar, Gujarat. 25+ years of service, 1000+ products, 100+ brands.',
  keywords: [
    'industrial tools',
    'power tools',
    'welding accessories',
    'safety equipment',
    'Motikhavdi',
    'Jamnagar',
    'Gujarat',
    'Shri Siddhi Vinayak',
    'hardware shop',
  ],
  openGraph: {
    title: 'Shri Siddhi Vinayak Trading Co.',
    description: 'A House of Industrial Tools, Power Tools & Safety Equipment',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-bg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
