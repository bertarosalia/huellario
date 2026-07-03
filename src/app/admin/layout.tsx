import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/features/auth/queries";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user, profile } = await getCurrentUserWithProfile();

  if (!user) {
    redirect("/login");
  }

  // Comprobación de rol en servidor: el middleware solo garantiza sesión
  // activa, no rol admin. Nunca confiar solo en ocultar el enlace en la UI.
  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return children;
}
