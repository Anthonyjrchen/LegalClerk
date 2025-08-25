import { Calendar, Home, Inbox, Settings, LogOut, UserCog } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../SupabaseClient";

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
      <SidebarHeader className="text-gray-800 font-bold text-lg py-1 flex items-center justify-center">
        <img src="/whiteonpink.svg" alt="LegalClerk" className="w-24 h-24" />
      </SidebarHeader>
      <div className="border-b border-gray-200 mx-2" />
      <SidebarContent
        className="h-full px-2 py-2 flex flex-col justify-between h-full"
        style={{ backgroundColor: "#fefefe" }}
      >
        <div>
          <SidebarGroup>
            <SidebarGroupContent>
              <div>
                {items.map((item) => (
                  <div key={item.title} className="mb-3">
                    <NavLink to={item.url}>
                      {({ isActive }) => (
                        <div
                          className={[
                            "block rounded-[7px] transition-all duration-200 ease-in-out border border-transparent",
                            isActive
                              ? "text-black"
                              : "text-black bg-transparent hover:bg-[#fdf2f8]",
                          ].join(" ")}
                          style={isActive ? { backgroundColor: "#fdf2f8" } : {}}
                        >
                          <SidebarMenuButton className="flex items-center gap-3 w-full py-2 px-2 font-semibold text-lg">
                            <item.icon className="w-5 h-5" />
                            <span className="flex-1 text-left text-lg">
                              {item.title}
                            </span>
                          </SidebarMenuButton>
                        </div>
                      )}
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
            className="flex items-center gap-2 w-full py-2 px-2 rounded-[7px] font-semibold text-lg text-red-600 border border-transparent bg-[#fefefe] transition-all duration-200 ease-in-out hover:bg-red-50 hover:border-red-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left text-lg">Logout</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
