import {
  LayoutDashboard,
  Package,
  CreditCard,
  User,
  MessageSquare,
  Star,
  Settings,
  PlusCircle,
  LogOut,
  ShieldQuestion,
  Menu,
  Bell,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useLanguage } from "@/components/ui/language-context";
import { useAuth } from "@/components/auth/AuthContext";

const CustomerSidebar = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // Convert to Promise chain for IE compatibility
    signOut()
      .then(() => {
        navigate("/customer/logout");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        // Still navigate even if signOut fails
        navigate("/customer/logout");
      });
  };

  const menuItems = [
    {
      path: "/customer/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      label: t("Dashboard"),
    },
    {
      path: "/customer/create-order",
      icon: <PlusCircle className="h-5 w-5" />,
      label: t("New Order"),
    },
    {
      path: "/customer/orders",
      icon: <Package className="h-5 w-5" />,
      label: t("My Orders"),
    },
    // {
    //   path: "/customer/billing",
    //   icon: <CreditCard className="h-5 w-5" />,
    //   label: t("Billing & Payment"),
    // },
    {
      path: "/customer/profile",
      icon: <User className="h-5 w-5" />,
      label: t("Profile"),
    },
    {
      path: "/customer/support",
      icon: <MessageSquare className="h-5 w-5" />,
      label: t("Technical Support"),
    },
    {
      path: "/customer/notifications",
      icon: <Bell className="h-5 w-5" />,
      label: t("notifications"),
    },
    {
      path: "/customer/feedback",
      icon: <Star className="h-5 w-5" />,
      label: t("Feedback & Rating"),
    },
    {
      path: "/customer/security-questions",
      icon: <ShieldQuestion className="h-5 w-5" />,
      label: t("securityQuestions"),
    },
    {
      path: "/customer/settings",
      icon: <Settings className="h-5 w-5" />,
      label: t("Settings"),
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
          className="flex items-center justify-center w-full gap-2 py-2 px-4 rounded-md bg-safedrop-gold hover:bg-safedrop-gold/90 transition-colors"
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

export default CustomerSidebar;
