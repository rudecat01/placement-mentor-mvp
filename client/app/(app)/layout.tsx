import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-bg-page">
      <Sidebar />
      <main className="flex-1 ml-[260px] relative flex flex-col min-h-screen">
        <Topbar />
        {children}
      </main>
    </div>
  );
}
