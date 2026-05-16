import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountPageView } from "@/components/account/account-page-view";
import { verifyToken } from "@/lib/jwt";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) redirect("/login");

  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <AccountPageView />
    </div>
  );
}
