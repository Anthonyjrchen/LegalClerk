import { Calendar, Home, Inbox, Settings, LogOut, UserCog } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/home/dashboard",
    icon: Home,
  },
  {
    title: "Create Trial",
    url: "/home/createTrial",
    icon: Inbox,
  },
  {
    title: "Form Calculator",
    url: "/home/formCalculator",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/home/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    url: "/home/profile",
    icon: UserCog,
  },
];

export default function AppSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <Sidebar>
      <SidebarHeader className="text-gray-800 font-bold text-lg py-4">
        LegalClerk
      </SidebarHeader>
      <div className="border-b border-gray-200 mx-2" />
      <SidebarContent className="bg-white h-full px-2 py-2 flex flex-col justify-between h-full">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 font-medium mb-4">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div>
                {items.map((item) => (
                  <div key={item.title} className="mb-3">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        [
                          "block rounded-[7px]",
                          isActive
                            ? "bg-gray-100 border border-blue-500 text-blue-700"
                            : "bg-white text-black hover:bg-gray-100 hover:border hover:border-gray-300",
                        ].join(" ")
                      }
                    >
                      <SidebarMenuButton className="flex items-center gap-3 w-full py-2 px-2 font-semibold text-lg transition-colors">
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1 text-left text-lg">
                          {item.title}
                        </span>
                      </SidebarMenuButton>
                    </NavLink>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
        <div className="mt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full py-2 px-2 rounded-[7px] font-semibold text-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left text-lg">Logout</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
