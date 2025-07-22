import {
  LayoutDashboard,
  Package,
  UserIcon,
  Settings,
  LogOut,
  Star,
  DollarSign,
  Bell,
  HelpCircle,
  Menu,
  ShieldQuestion,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLanguage } from "@/components/ui/language-context";
import { useAuth } from "@/components/auth/AuthContext";

const DriverSidebar = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    signOut()
      .then(() => {
        navigate("/driver/logout");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        navigate("/driver/logout");
      });
  };

  const menuItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: t("dashboard"),
      path: "/driver/dashboard",
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: t("orders"),
      path: "/driver/orders",
    },
    {
      icon: <UserIcon className="h-5 w-5" />,
      label: t("Profile"),
      path: "/driver/profile",
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: t("ratings"),
      path: "/driver/ratings",
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: t("earnings"),
      path: "/driver/earnings",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: t("notifications"),
      path: "/driver/notifications",
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      label: t("support"),
      path: "/driver/support",
    },
    {
      icon: <ShieldQuestion className="h-5 w-5" />,
      label: t("securityQuestions"),
      path: "/driver/security-questions",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: t("Settings"),
      path: "/driver/settings",
    },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center flex-col gap-2">
        <img
          alt="SafeDrop Logo"
          className="h-20"
          src="/lovable-uploads/23d24828-2c22-46a3-a28c-04dc362e92cd.png"
        />
        <h1 className="text-xl font-bold">{t("siteTitle")}</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${
                  isActive(item.path)
                    ? "bg-white/10 font-medium"
                    : "hover:bg-white/5"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full gap-2 py-2 px-4 rounded-md bg-safedrop-gold hover:bg-safedrop-gold/90  transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>{t("Logout")}</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className={`md:hidden fixed top-4 ${
          language === "ar" ? "left-4" : "right-4"
        } z-50`}
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">{t("toggleMenu")}</span>
      </Button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side={language === "ar" ? "right" : "left"}
          className="w-[280px] sm:w-[340px] p-0"
        >
          <aside className="bg-safedrop-primary text-white h-full flex flex-col">
            <SidebarContent />
          </aside>
        </SheetContent>
      </Sheet>

      <aside className="hidden md:flex bg-safedrop-primary text-white w-64 h-screen flex-col">
        <SidebarContent />
      </aside>
    </>
  );
};

export default DriverSidebar;
