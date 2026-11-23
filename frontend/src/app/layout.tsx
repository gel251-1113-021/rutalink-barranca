import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { ErrorBoundary } from '../components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'RutaLink — Red de Movilidad Segura y Geolocalización | Provincia de Barranca',
  description: 'Plataforma comunitaria de movilidad interdistrital y geolocalización en tiempo real para Barranca, Supe, Pativilca, Paramonga y la UNAB.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#1d4ed8',
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-slate-50 dark:bg-[#0c0d0f] text-slate-900 dark:text-slate-100 h-[100dvh] min-h-[100dvh] w-full overflow-hidden antialiased flex flex-col">
        <AuthProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
