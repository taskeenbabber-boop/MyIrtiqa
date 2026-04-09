import { NavLink, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Award,
    Users,
    UserCog,
    Image,
    Settings,
    ShoppingCart,
    Zap,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import logoIcon from "@/assets/logo-icon.png";

const menuItems = [
    { title: "Overview", url: "/admin", icon: LayoutDashboard },
    { title: "Symposium", url: "/admin/symposium", icon: Zap },
    { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
    { title: "Certificates", url: "/admin/certificates", icon: Award },
    { title: "Team", url: "/admin/team", icon: Users },
    { title: "Users & Roles", url: "/admin/users", icon: UserCog },
    { title: "Media Library", url: "/admin/media", icon: Image },
    { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const { state } = useSidebar();
    const location = useLocation();
    const collapsed = state === "collapsed";

    const isActive = (path: string) => location.pathname === path;

    return (
        <Sidebar className={`hidden md:flex ${collapsed ? "w-14" : "w-60"}`}>
            {/* Logo */}
            <div className={`p-4 border-b border-border flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
                <img src={logoIcon} alt="IRTIQA" className="w-8 h-8" />
                {!collapsed && (
                    <span className="font-heading font-bold text-lg">IRTIQA Admin</span>
                )}
            </div>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Management</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={item.url}
                                            end
                                            className={({ isActive }) =>
                                                isActive
                                                    ? "bg-accent text-accent-foreground font-medium"
                                                    : "hover:bg-secondary"
                                            }
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {!collapsed && <span>{item.title}</span>}
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {!collapsed && (
                <div className="p-4 border-t border-border">
                    <SidebarTrigger />
                </div>
            )}
        </Sidebar>
    );
}
