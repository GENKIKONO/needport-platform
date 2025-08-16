import { redirect } from 'next/navigation';
import { isAdmin } from './_lib/auth';
import AdminDashboard from './AdminDashboard';
import AdminLoginForm from './AdminLoginForm';

export default function AdminPage() {
  // フラグチェック
  if (process.env.EXPERIMENTAL_ADMIN !== '1') {
    redirect('/');
  }
  
  const admin = isAdmin();
  
  if (!admin) {
    return <AdminLoginForm />;
  }
  
  return <AdminDashboard />;
}
