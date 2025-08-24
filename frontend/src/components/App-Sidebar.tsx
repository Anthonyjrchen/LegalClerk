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
      <SidebarHeader className="text-gray-800 font-bold text-lg py-1 flex items-center justify-center">
        <img src="/pink.svg" alt="LegalClerk" className="w-24 h-24" />
      </SidebarHeader>
      <div className="border-b border-gray-200 mx-2" />
      <SidebarContent
        className="h-full px-2 py-2 flex flex-col justify-between h-full"
        style={{ backgroundColor: "#fffafdff" }}
      >
        <div>
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 font-medium mb-4">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div>
                {items.map((item) => (
                  <div key={item.title} className="mb-3">
                    <NavLink to={item.url}>
                      {({ isActive }) => (
                        <div
                          className={[
                            "block rounded-[7px] transition-colors",
                            isActive
                              ? "bg-white border border-gray-400 text-black"
                              : "text-black border border-transparent",
                          ].join(" ")}
                          style={
                            !isActive ? { backgroundColor: "#fffafdff" } : {}
                          }
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor = "white";
                              e.currentTarget.style.borderColor = "#d1d5db";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.backgroundColor =
                                "#fffafdff";
                              e.currentTarget.style.borderColor = "transparent";
                            }
                          }}
                        >
                          <SidebarMenuButton className="flex items-center gap-3 w-full py-2 px-2 font-semibold text-lg transition-colors">
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
            className="flex items-center gap-2 w-full py-2 px-2 rounded-[7px] font-semibold text-lg text-red-600 border border-transparent transition-colors"
            style={{ backgroundColor: "#fffafdff" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fef2f2";
              e.currentTarget.style.borderColor = "#fca5a5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#fffafdff";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1 text-left text-lg">Logout</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
