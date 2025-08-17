import AdminLoginForm from "../AdminLoginForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminLoginPage() {
  return (
    <main className="container py-8">
      <h1 className="text-xl font-semibold mb-4">管理ログイン</h1>
      <AdminLoginForm />
    </main>
  );
}
