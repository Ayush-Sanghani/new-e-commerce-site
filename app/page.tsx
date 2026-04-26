import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (token) {
    try {
      await verifyToken(token);
      redirect("/home");
    } catch {
      // invalid token — fall through to login
    }
  }

  redirect("/login");
}
