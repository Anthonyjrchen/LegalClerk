import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
];

export default function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="text-gray-800 font-bold text-lg py-4">
        LegalClerk
      </SidebarHeader>
      <div className="border-b border-gray-200 mx-2" />
      <SidebarContent className="bg-white h-full px-2 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 font-medium mb-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div>
              {items.map((item) => (
                <div key={item.title} className="mb-3">
                  <SidebarMenuButton className="flex items-center gap-3 w-full py-2 px-2 rounded-md bg-white text-black font-semibold text-lg transition-colors hover:bg-gray-100 hover:border hover:border-gray-300">
                    <item.icon className="w-5 h-5 text-black" />
                    <span className="flex-1 text-left text-black text-lg">
                      {item.title}
                    </span>
                  </SidebarMenuButton>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
