
import React from 'react';
import CustomerSidebar from '@/components/customer/CustomerSidebar';

const Feedback = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-4">التقييم والملاحظات</h1>
        {/* تقييم الخدمة وكتابة ملاحظات */}
        <form className="space-y-4 max-w-md">
          <div>
            <label htmlFor="rating" className="block mb-1 font-semibold text-gray-700">التقييم (1-5)</label>
            <select id="rating" name="rating" className="w-full rounded border border-gray-300 px-3 py-2">
              <option value="">اختر التقييم</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="comments" className="block mb-1 font-semibold text-gray-700">ملاحظات</label>
            <textarea id="comments" name="comments" rows={4} className="w-full rounded border border-gray-300 px-3 py-2" />
          </div>
          <button type="submit" className="bg-safedrop-gold text-white px-4 py-2 rounded hover:bg-yellow-500">إرسال</button>
        </form>
      </main>
    </div>
  );
};

export default Feedback;
