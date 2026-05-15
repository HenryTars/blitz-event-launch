import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/rbac';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'SUPER_ADMIN') {
    redirect('/auth');
  }

  return (
    <div className="min-h-screen bg-[#09070b]">
      <AdminSidebar />
      <div className="pl-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
