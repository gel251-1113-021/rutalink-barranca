import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'RutaLink — Red de Movilidad Segura y Geolocalización | Provincia de Barranca',
  description: 'Plataforma comunitaria de movilidad interdistrital y geolocalización en tiempo real para Barranca, Supe, Pativilca, Paramonga y la UNAB.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#121417',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-slate-50 dark:bg-[#0c0d0f] text-slate-900 dark:text-slate-100 min-h-screen antialiased flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
