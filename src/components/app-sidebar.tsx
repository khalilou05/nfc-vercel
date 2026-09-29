"use client";
import { LogOutIcon, PlusCircle, Settings, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { fetchApi } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu items.
const items = [
  {
    title: "إضافة زبون",
    url: "/dashboard",
    icon: PlusCircle,
  },
  {
    title: "الزبائن",
    url: "/dashboard/customers",
    icon: User,
  },
];

export function AppSidebar() {
  const { isMobile, toggleSidebar } = useSidebar();
  const path = usePathname();
  const logOut = async () => {
    const response = await fetchApi(`/logout`, { method: "POST" });
    if (response.ok) {
      window.location.replace("/");
    }
  };
  return (
    <Sidebar
      side="right"
      className="h-screen"
    >
      <SidebarContent className="h-full">
        <SidebarGroup className="h-full flex flex-col">
          <SidebarGroupLabel>NFC CARD APP</SidebarGroupLabel>

          {/* This must also stretch */}
          <SidebarGroupContent className="flex-1">
            <SidebarMenu className="flex h-full flex-col justify-between">
              <div>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className={
                        item.url === path ?
                          "bg-stone-200 hover:bg-stone-200"
                        : ""
                      }
                      asChild
                    >
                      <Link
                        onClick={() => {
                          if (isMobile) toggleSidebar();
                        }}
                        href={item.url}
                        replace
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </div>
              <div className="mt-auto">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={
                      path === "/dashboard/settings" ?
                        "bg-stone-200 hover:bg-stone-200"
                      : ""
                    }
                    asChild
                  >
                    <Link href={"/dashboard/settings"}>
                      <Settings />
                      <span>الإعدادات</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className="cursor-pointer"
                    onClick={logOut}
                    asChild
                  >
                    <div>
                      <LogOutIcon />
                      <span>خروج</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
