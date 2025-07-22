
import React from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

const Billing = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">الفواتير والدفع</h1>
        {/* عرض الفاتورة، وسيلة الدفع وسجل المدفوعات */}
        <p>لم يتم إضافة بيانات الفواتير بعد.</p>
      </main>
    </div>
  );
};

export default Billing;
