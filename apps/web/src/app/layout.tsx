import Link from 'next/link';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WP Automation Admin',
  description: 'Internal SaaS for WordPress blog automation'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold text-slate-900">
                WP Automation Admin
              </Link>
              <nav className="flex items-center gap-5 text-sm">
                <Link href="/projects" className="text-slate-600 hover:text-slate-900">
                  Projetos
                </Link>
                <Link href="/projects/new" className="text-slate-600 hover:text-slate-900">
                  Novo projeto
                </Link>
              </nav>
            </div>
          </header>
          <div className="mx-auto max-w-6xl p-6">{children}</div>
        </div>
      </body>
    </html>
  );
}
