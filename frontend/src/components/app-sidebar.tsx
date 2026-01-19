"use client"

import * as React from "react"
import { Megaphone, Users } from "lucide-react"
import { useUser } from "@/domain/auth/hooks/useAuth"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user, isLoading } = useUser()

  // Build navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      {
        title: "Announcements",
        url: "/dashboard",
        icon: Megaphone,
        items: [
          {
            title: "All Announcements",
            url: "/dashboard",
          },
          {
            title: "My Announcements",
            url: "/dashboard/my-announcements",
          },
        ],
      },
    ]

    const adminItems =
      user?.role === "admin"
        ? [
            {
              title: "Admin",
              url: "#",
              icon: Users,
              items: [
                {
                  title: "User Announcements",
                  url: "/dashboard/user-announcements",
                },
                {
                  title: "Manage Users",
                  url: "/dashboard/users",
                },
              ],
            },
          ]
        : []

    return [...commonItems, ...adminItems]
  }

  if (isLoading) {
    return null
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-3">
          {/* Logo for collapsed state */}
          <img 
            src="/sidebarlogo.png" 
            alt="Illizeo" 
            className="h-12 w-12 object-contain group-data-[collapsible=icon]:block hidden group-data-[state=expanded]:hidden"
          />
          {/* Full branding for expanded state */}
          <div className="flex flex-col gap-1 group-data-[collapsible=icon]:hidden">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-white to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
              Illizeo
            </span>
            <span className="text-sm font-medium bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent capitalize">
              {user?.role}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={getNavItems()} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={{ name: user.name, email: user.email, avatar: "/avatars/default.jpg" }} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
