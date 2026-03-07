import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import logoIcon from "@/assets/logo-icon.png";
import { ThemeToggle } from "./ThemeToggle";
const navigation = [{
  name: "Home",
  href: "/"
}, {
  name: "AI Symposium",
  href: "/ai-symposium"
}, {
  name: "Programs",
  href: "/programs"
}, {
  name: "Verify Certificate",
  href: "/verify"
}, {
  name: "Team",
  href: "/team"
}, {
  name: "Gallery",
  href: "/gallery"
}, {
  name: "About",
  href: "/about"
}, {
  name: "Contact",
  href: "/contact"
}];
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const {
    user,
    signOut,
    isAdmin
  } = useAuth();
  const isActive = (href: string) => location.pathname === href;
  return <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
    <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src={logoIcon} alt="IRTIQA Logo" className="h-11 w-11 md:h-14 md:w-14 object-contain" />
          <span className="font-heading font-bold text-xl">IRTIQA</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-1">
          {navigation.map(item => <Link key={item.name} to={item.href} className={cn("px-4 py-2 rounded-md text-sm font-medium transition-smooth", isActive(item.href) ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-secondary")}>
            {item.name}
          </Link>)}
        </div>

        {/* CTA Button */}
        <div className="hidden lg:flex items-center space-x-4">
          {/* <ThemeToggle /> */}
          {user ? <>
            <Button asChild variant="ghost" size="sm">
              <Link to="/library">My Library</Link>
            </Button>
            {isAdmin() && (
              <Button asChild variant="ghost" size="sm">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </> : <>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button asChild variant="default" size="sm">
              <Link to="/programs">Get Started</Link>
            </Button>
          </>}
        </div>

        {/* Mobile Menu Button */}
        <button type="button" className="lg:hidden p-2 rounded-md text-foreground hover:bg-secondary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && <div className="lg:hidden py-4 border-t border-border animate-fade-in">
        <div className="space-y-1">
          {navigation.map(item => <Link key={item.name} to={item.href} onClick={() => setMobileMenuOpen(false)} className={cn("block px-4 py-2 rounded-md text-base font-medium transition-smooth", isActive(item.href) ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-secondary")}>
            {item.name}
          </Link>)}
          <div className="px-4 pt-4 space-y-2">
            <div className="flex justify-center pb-2">
              {/* <ThemeToggle /> */}
            </div>
            {user ? <>
              <Button asChild variant="outline" className="w-full mb-2">
                <Link to="/library" onClick={() => setMobileMenuOpen(false)}>
                  My Library
                </Link>
              </Button>
              {isAdmin() && (
                <Button asChild variant="outline" className="w-full mb-2">
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                    Admin Dashboard
                  </Link>
                </Button>
              )}
              <Button variant="ghost" className="w-full" onClick={() => {
                signOut();
                setMobileMenuOpen(false);
              }}>
                Sign Out
              </Button>
            </> : <>
              <Button asChild variant="outline" className="w-full mb-2">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
              <Button asChild variant="default" className="w-full">
                <Link to="/programs" onClick={() => setMobileMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </>}
          </div>
        </div>
      </div>}
    </nav>
  </header>;
}