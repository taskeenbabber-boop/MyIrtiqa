import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    ShoppingCart,
    Award,
    Users,
    UserCog,
    Image as ImageIcon,
    Settings,
    Menu,
    Zap,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import logoIcon from "@/assets/logo-icon.png";

const menuItems = [
    { title: "Overview", url: "/admin", icon: LayoutDashboard, end: true },
    { title: "Symposium", url: "/admin/symposium", icon: Zap },
    { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
    { title: "Certificates", url: "/admin/certificates", icon: Award },
    { title: "Team", url: "/admin/team", icon: Users },
    { title: "Users & Roles", url: "/admin/users", icon: UserCog },
    { title: "Media Library", url: "/admin/media", icon: ImageIcon },
    { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebarMobile() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all duration-200 active:scale-95"
                    aria-label="Open navigation menu"
                >
                    <Menu className="h-5 w-5 text-primary" />
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
                <SheetHeader className="p-5 border-b border-sidebar-border">
                    <div className="flex items-center gap-3">
                        <img src={logoIcon} alt="IRTIQA" className="w-8 h-8" />
                        <SheetTitle className="text-lg font-heading text-sidebar-foreground">
                            Admin Panel
                        </SheetTitle>
                    </div>
                </SheetHeader>
                <nav className="flex flex-col gap-1 p-3">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.url}
                            to={item.url}
                            end={item.end}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                                }`
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
                    <p className="text-xs text-sidebar-foreground/60 text-center">IRTIQA Admin v1.0</p>
                </div>
            </SheetContent>
        </Sheet>
    );
}
