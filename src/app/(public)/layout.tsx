import { PublicHeader } from "@/components/layout/public-header";

export default function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-1 flex-col">
      <PublicHeader />
      {children}
    </div>
  );
}
