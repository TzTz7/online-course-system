import { SidebarNav } from "./sidebar-nav"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <main className="md:ml-[240px] transition-all duration-300">
        {children}
      </main>
    </div>
  )
}
