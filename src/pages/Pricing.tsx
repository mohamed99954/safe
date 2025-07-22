
import React from 'react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { CheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PricingContent = () => {
  const { t } = useLanguage();

  const pricingPlans = [
    {
      name: 'الباقة الأساسية',
      price: '99',
      description: 'للمستخدمين الأفراد',
      features: [
        'توصيل داخل المدينة',
        'تأمين حتى 5000 ريال',
        'تتبع الشحنة',
        'خدمة العملاء الأساسية',
      ],
      isPopular: false,
    },
    {
      name: 'الباقة المتميزة',
      price: '199',
      description: 'للتجار والشركات الصغيرة',
      features: [
        'توصيل داخل وخارج المدينة',
        'تأمين حتى 15000 ريال',
        'تتبع الشحنة المباشر',
        'خدمة العملاء المتميزة',
        'أولوية الشحن',
      ],
      isPopular: true,
    },
    {
      name: 'باقة الأعمال',
      price: '499',
      description: 'للشركات والمؤسسات',
      features: [
        'توصيل في جميع أنحاء المملكة',
        'تأمين كامل للشحنة',
        'تتبع متقدم للشحنات',
        'مدير حساب مخصص',
        'أولوية الشحن القصوى',
        'تقارير شهرية',
      ],
      isPopular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-safedrop-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">الباقات والأسعار</h1>
            <p className="text-xl max-w-3xl mx-auto">
              نقدم باقات متنوعة تناسب احتياجاتك المختلفة بأسعار تنافسية
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, index) => (
                <div 
                  key={index} 
                  className={`rounded-lg shadow-lg overflow-hidden ${
                    plan.isPopular ? 'border-2 border-safedrop-gold ring-2 ring-safedrop-gold/20' : 'border border-gray-200'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="bg-safedrop-gold text-white text-center py-2 font-semibold">
                      الأكثر طلباً
                    </div>
                  )}
                  <div className="p-6 bg-white">
                    <h3 className="text-xl font-bold text-safedrop-primary">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="mr-2 text-xl text-gray-500">ريال/شهرياً</span>
                    </div>
                    <p className="mt-2 text-gray-600">{plan.description}</p>
                    
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckIcon className="h-5 w-5 text-green-500 ml-2 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`mt-8 w-full ${
                        plan.isPopular 
                          ? 'bg-safedrop-gold hover:bg-safedrop-gold/90' 
                          : 'bg-safedrop-primary hover:bg-safedrop-primary/90'
                      }`}
                    >
                      اختر هذه الباقة
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-safedrop-primary mb-12">الأسئلة الشائعة</h2>
            
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-3">هل يمكن تغيير الباقة في أي وقت؟</h3>
                <p className="text-gray-600">نعم، يمكنك الترقية أو تخفيض باقتك في أي وقت، وسيتم تطبيق التغييرات في بداية الشهر التالي.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-3">هل هناك رسوم إضافية غير مذكورة؟</h3>
                <p className="text-gray-600">لا توجد رسوم خفية، جميع الرسوم مذكورة بوضوح في تفاصيل كل باقة.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-3">ماذا يشمل التأمين على الشحنات؟</h3>
                <p className="text-gray-600">يشمل التأمين تعويض كامل في حالة فقدان أو تلف الشحنة وفقاً لقيمتها المصرح بها ضمن الحد الأقصى المذكور في الباقة.</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-3">هل هناك اتفاقيات خاصة للشركات الكبيرة؟</h3>
                <p className="text-gray-600">نعم، نقدم حلول مخصصة للشركات الكبيرة بناءً على حجم الشحنات واحتياجاتهم الخاصة. يرجى التواصل مع فريق المبيعات للحصول على عرض مخصص.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Pricing = () => {
  return (
    <LanguageProvider>
      <PricingContent />
    </LanguageProvider>
  );
};

export default Pricing;
