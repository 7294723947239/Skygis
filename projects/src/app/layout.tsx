import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { CapacitorUpdater } from '@/components/capacitor-updater';

export const metadata: Metadata = {
  title: 'SkyGIS - 太阳系天体地理信息系统',
  description: '融合GIS空间技术与天文数据的太阳系天体地理信息系统',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased font-sans">
        <CapacitorUpdater />
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </body>
    </html>
  );
}
