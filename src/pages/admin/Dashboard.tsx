import { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminSidebarMobile } from "@/components/admin/AdminSidebarMobile";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, loading, rolesLoaded, hasRole } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && rolesLoaded) {
      if (!user) {
        navigate("/auth");
        return;
      }

      if (!hasRole("admin") && !hasRole("editor") && !hasRole("super_admin")) {
        navigate("/");
        return;
      }

      setAuthorized(true);
    }
  }, [user, loading, rolesLoaded, hasRole, navigate]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          {/* Mobile Header with hamburger menus on both sides */}
          <header className="md:hidden h-14 border-b border-border flex items-center justify-between px-3 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
            <AdminSidebarMobile />
            <span className="text-base font-heading font-semibold">Admin</span>
            <AdminQuickActions />
          </header>
          
          {/* Desktop Header */}
          <header className="hidden md:flex h-16 border-b border-border items-center px-8">
            <SidebarTrigger />
            <span className="ml-4 text-lg font-heading font-semibold">IRTIQA Admin</span>
          </header>
          
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
