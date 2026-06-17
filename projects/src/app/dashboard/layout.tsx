import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from '@/components/ui/sonner';
import { CapacitorUpdater } from '@/components/capacitor-updater';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CapacitorUpdater />
      {children}
      <Toaster position="top-right" richColors closeButton />
    </AuthProvider>
  );
}
