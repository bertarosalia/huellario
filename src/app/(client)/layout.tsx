import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/features/auth/queries";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = await getCurrentUserWithProfile();

  if (!user) {
    redirect("/login");
  }

  return children;
}
