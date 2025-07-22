import React from "react";
import Customers from "./Customers";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LanguageProvider } from "@/components/ui/language-context";

const CustomersWithSidebar = () => {
  return (
    <LanguageProvider>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <Customers />
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
};

export default CustomersWithSidebar;
