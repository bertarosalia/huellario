import { getCurrentUserWithProfile } from "@/features/auth/queries";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await getCurrentUserWithProfile();
  const dashboardHref = profile?.role === "admin" ? "/admin/dashboard" : "/dashboard";

  return (
    <div className="flex flex-1 flex-col">
      <PublicHeader isAuthenticated={Boolean(user)} dashboardHref={dashboardHref} />
      {children}
      <PublicFooter />
    </div>
  );
}
