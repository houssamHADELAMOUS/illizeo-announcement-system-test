import { Outlet } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useLocation } from "react-router-dom"

// Map routes to breadcrumb labels
const routeLabels: Record<string, string> = {
  "/dashboard": "All Announcements",
  "/dashboard/announcements": "Announcements",
  "/dashboard/my-announcements": "My Announcements",
  "/dashboard/user-announcements": "User Announcements",
}

/**
 * Unified dashboard layout for both Admin and Regular Users
 * Uses role-based sidebar navigation to conditionally show menu items
 */
export default function DashboardLayout() {
  const location = useLocation()
  const currentLabel = routeLabels[location.pathname] || "All Announcements"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    All Announcements
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {location.pathname !== "/dashboard" && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="px-4">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 overflow-hidden">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
