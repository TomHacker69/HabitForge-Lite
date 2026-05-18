import AppShell from '@/components/AppShell/AppShell';

export default function ProtectedLayout({ children }) {
  return <AppShell>{children}</AppShell>;
}
