import { Outlet } from "react-router-dom";
import Sidebar from "../components/App-Sidebar";
import TopBar from "../components/TopBar";
import { SidebarProvider } from "../components/ui/sidebar";
export default function Home() {
  return (
    <div className="flex h-screen" style={{ backgroundColor: "#fffafdff" }}>
      {/* Sidebar - 250px wide, full height, fixed to left */}
      <div
        style={{
          width: "250px",
          height: "100vh",
          backgroundColor: "#fffafdff",
          borderRight: "1px solid #e5e7eb",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 10,
        }}
      >
        <SidebarProvider>
          <Sidebar />
        </SidebarProvider>
      </div>

      {/* Main Content Area - offset by sidebar width */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: "250px" }}>
        {/* Top Bar */}
        <TopBar />

        {/* Page Content */}
        <main
          className="flex-1 overflow-x-hidden overflow-y-auto p-6"
          style={{ backgroundColor: "#fffafdff" }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
