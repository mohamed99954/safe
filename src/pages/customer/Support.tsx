
import React from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Card } from '@/components/ui/card';
import { Mail } from 'lucide-react';

const Support = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">الدعم الفني</h1>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Mail className="h-8 w-8 text-safedrop-gold" />
            <div>
              <h2 className="text-xl font-semibold">البريد الإلكتروني</h2>
              <p className="text-gray-600">info@safedrop-express.com</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Support;
