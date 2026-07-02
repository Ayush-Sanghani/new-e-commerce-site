import { redirect } from "next/navigation";
import { AccountPageView } from "@/components/account/account-page-view";
import { getSessionUserFromCookies } from "@/lib/auth";

export default async function AccountPage() {
  const user = await getSessionUserFromCookies();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <AccountPageView />
    </div>
  );
}
