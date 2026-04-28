import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = { title: 'Joalheria', description: 'Joias artesanais exclusivas' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="bg-yellow-900 text-white py-4 px-6 flex items-center justify-between shadow">
          <span className="text-xl font-bold tracking-wide">✨ Joalheria</span>
          <span className="text-yellow-200 text-sm">Atendimento via WhatsApp</span>
        </header>
        <main>{children}</main>
        <footer className="bg-yellow-900 text-yellow-200 text-center py-6 text-sm mt-12">
          © 2024 Joalheria • Peças exclusivas em ouro 18k
        </footer>
      </body>
    </html>
  );
}
