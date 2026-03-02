import { Link } from "react-router-dom";
import { Mail, Linkedin, Twitter, Facebook } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
const navigation = {
  main: [{
    name: "About",
    href: "/about"
  }, {
    name: "Programs",
    href: "/programs"
  }, {
    name: "Certificate Verification",
    href: "/verify"
  }, {
    name: "Team",
    href: "/team"
  }, {
    name: "Contact",
    href: "/contact"
  }],
  social: [{
    name: "LinkedIn",
    icon: Linkedin,
    href: "https://linkedin.com/in/irtiqaresearch"
  }, {
    name: "Twitter",
    icon: Twitter,
    href: "https://x.com/irtiqa_research"
  }, {
    name: "Facebook",
    icon: Facebook,
    href: "https://www.facebook.com/Facebook.com/irtiqa_research"
  }]
};
export function Footer() {
  return <footer className="bg-gradient-to-br from-secondary via-background to-secondary border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src={logoIcon} alt="IRTIQA Logo" className="w-10 h-10 object-cover" />
              <span className="font-heading font-bold text-xl">IRTIQA</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Incubator for Research, Training, Innovation & Quality Advancement
            </p>
            <div className="flex items-center space-x-4">
              {navigation.social.map(item => <a key={item.name} href={item.href} className="text-muted-foreground hover:text-primary transition-smooth" aria-label={item.name}>
                  <item.icon className="h-5 w-5" />
                </a>)}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navigation.main.map(item => <li key={item.name}>
                  <Link to={item.href} className="text-muted-foreground hover:text-primary transition-smooth text-sm">
                    {item.name}
                  </Link>
                </li>)}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <a href="mailto:info.irtiqa@gmail.com" className="flex items-center text-muted-foreground hover:text-primary transition-smooth text-sm">
                <Mail className="h-4 w-4 mr-2" />
                info.irtiqa@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} IRTIQA. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm">
              Crafted with ❤️ by <span className="text-primary font-medium">Taskeen Baber</span>
            </p>
          </div>
        </div>
      </div>
    </footer>;
}