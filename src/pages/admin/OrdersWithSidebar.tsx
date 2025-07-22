import React from "react";
import Orders from "./Orders";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";

const OrdersWithSidebar = () => {
  return (
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <Orders />
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default OrdersWithSidebar;
