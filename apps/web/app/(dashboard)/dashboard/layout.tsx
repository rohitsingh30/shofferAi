import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={{ name: session.user.name || 'User', email: session.user.email || '' }} />
      <main className="flex flex-1 flex-col overflow-hidden bg-chat-bg">
        {children}
      </main>
    </div>
  );
}
