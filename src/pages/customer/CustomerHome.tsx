
import React from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';

const CustomerHomeContent = () => {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">{t('Dashboard')}</h1>
        <p>{t('welcomeCustomerDashboard')}</p>
      </main>
    </div>
  );
};

const CustomerHome = () => {
  return (
    <LanguageProvider>
      <CustomerHomeContent />
    </LanguageProvider>
  );
};

export default CustomerHome;
