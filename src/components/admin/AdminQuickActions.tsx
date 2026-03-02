import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Bell,
  User,
  LogOut,
  Settings,
  Moon,
  Sun,
  MoreVertical,
  Home,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "next-themes";

export function AdminQuickActions() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
    setOpen(false);
  };

  const quickActions = [
    {
      title: "Go to Website",
      icon: Home,
      onClick: () => { navigate("/"); setOpen(false); },
    },
    {
      title: "Settings",
      icon: Settings,
      onClick: () => { navigate("/admin/settings"); setOpen(false); },
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button 
          className="flex items-center justify-center h-10 w-10 rounded-lg bg-secondary hover:bg-secondary/80 border border-border transition-all duration-200 active:scale-95"
          aria-label="Quick actions"
        >
          <MoreVertical className="h-5 w-5 text-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-0 bg-background border-border">
        <SheetHeader className="p-5 border-b border-border">
          <SheetTitle className="text-lg font-heading">Quick Actions</SheetTitle>
        </SheetHeader>
        
        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-4 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground mb-3">APPEARANCE</p>
          <div className="flex gap-2">
            <Button 
              variant={theme === 'light' ? 'default' : 'outline'} 
              size="sm" 
              className="flex-1"
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4 mr-2" />
              Light
            </Button>
            <Button 
              variant={theme === 'dark' ? 'default' : 'outline'} 
              size="sm" 
              className="flex-1"
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3">
          <p className="text-xs font-medium text-muted-foreground mb-2 px-1">QUICK ACTIONS</p>
          <nav className="flex flex-col gap-1">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={action.onClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-accent text-foreground w-full text-left"
              >
                <action.icon className="h-4 w-4" />
                <span>{action.title}</span>
              </button>
            ))}
          </nav>
        </div>

        <Separator />

        {/* Sign Out */}
        <div className="p-3">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:bg-destructive/10 text-destructive w-full text-left"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
