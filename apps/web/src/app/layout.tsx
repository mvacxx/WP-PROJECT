import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WP Automation Admin',
  description: 'Internal SaaS for WordPress blog automation'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
