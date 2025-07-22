import { useLanguage } from "@/components/ui/language-context";
import {
  UsersIcon,
  TruckIcon,
  PackageIcon,
  BarChart2Icon,
  SettingsIcon,
  ShieldIcon,
  DollarSign,
  MessageSquareIcon,
  Menu,
  LogOut,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/components/auth/AuthContext";
import { toast } from "sonner";

const AdminSidebar = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    signOut()
      .then(() => {
        try {
          localStorage.removeItem("adminAuth");
          localStorage.removeItem("adminEmail");
        } catch (error) {
          console.error("Error clearing localStorage:", error);
        }

        toast.success(
          language === "ar"
            ? "تم تسجيل الخروج بنجاح"
            : "Logged out successfully"
        );
        navigate("/login?logout=true", { replace: true });
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        toast.error(
          language === "ar"
            ? "حدث خطأ أثناء تسجيل الخروج"
            : "Error during logout"
        );
      });
  };

  const menuItems = [
    {
      icon: <BarChart2Icon className="h-5 w-5" />,
      label: language === "ar" ? "لوحة المعلومات" : "Dashboard",
      path: "/admin/dashboard",
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: language === "ar" ? "الملخص المالي" : "Financial Summary",
      path: "/admin/finance",
    },
    {
      icon: <TruckIcon className="h-5 w-5" />,
      label: language === "ar" ? "إدارة السائقين" : "Driver Management",
      path: "/admin/driver-verification",
    },
    {
      icon: <UsersIcon className="h-5 w-5" />,
      label: language === "ar" ? "إدارة العملاء" : "Customer Management",
      path: "/admin/customers",
    },
    {
      icon: <PackageIcon className="h-5 w-5" />,
      label: language === "ar" ? "إدارة الطلبات" : "Order Management",
      path: "/admin/orders",
    },
    {
      icon: <MessageSquareIcon className="h-5 w-5" />,
      label: language === "ar" ? "الشكاوى والدعم" : "Complaints & Support",
      path: "/admin/complaints",
    },
    {
      icon: <SettingsIcon className="h-5 w-5" />,
      label: language === "ar" ? "الإعدادات" : "Settings",
      path: "/admin/settings",
    },
  ];

  const SidebarContent = () => (
    <>
      <div className="p-4 flex items-center gap-3 flex-col">
        <img
          alt="SafeDrop Logo"
          className="h-20"
          src="/lovable-uploads/23d24828-2c22-46a3-a28c-04dc362e92cd.png"
        />
        <div>
          <h2 className="text-xl font-bold">
            {language === "ar" ? "سيف دروب" : "SafeDrop"}
          </h2>
          <p className="text-xs opacity-75">
            {language === "ar" ? "لوحة تحكم المشرف" : "Admin Dashboard"}
          </p>
        </div>
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
        <span className="sr-only">
          {language === "ar" ? "فتح القائمة" : "Toggle Menu"}
        </span>
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

export default AdminSidebar;
