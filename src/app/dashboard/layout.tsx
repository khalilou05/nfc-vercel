import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await cookies()).get("token")?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) redirect("/");

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
  } catch {
    redirect("/");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="h-screen w-screen">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
