import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your AI shopping assistant — compare prices, add to cart, checkout.',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b]">
      <Sidebar user={{ name: session.user.name || 'User', email: session.user.email || '' }} />
      <main id="main" className="flex flex-1 flex-col overflow-hidden" role="main" aria-live="polite">
        <h1 className="sr-only">ShofferAI Dashboard</h1>
        {children}
      </main>
    </div>
  );
}
