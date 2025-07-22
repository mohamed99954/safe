import { useLanguage } from "@/components/ui/language-context";
import { PackagePlus, MessageSquare, Truck, CheckCircle } from "lucide-react";

const HowItWorks = () => {
  const { t, language } = useLanguage();

  const steps = [
    {
      icon: <PackagePlus className="h-10 w-10 text-safedrop-gold" />,
      title: {
        ar: "إنشاء طلب",
        en: "Create a Request",
      },
      description: {
        ar: "انضم وسجّل تفاصيل الشحنة ومواقع الاستلام والتسليم ليتم نشر الطلب عبر المنصة.",
        en: "Join and submit shipment details, including pickup and delivery locations, to have your request published on the platform.",
      },
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-safedrop-gold" />,
      title: {
        ar: "التواصل والاتفاق",
        en: "Communicate and Agree",
      },
      description: {
        ar: "تتيح المنصة للطرفين إمكانية التواصل والتفاهم على تفاصيل الخدمة بشكل مباشر.",
        en: "The platform enables both parties to communicate directly and agree on the service details.",
      },
    },
    {
      icon: <Truck className="h-10 w-10 text-safedrop-gold" />,
      title: {
        ar: "الالتقاط والتوصيل",
        en: "Pickup and Delivery",
      },
      description: {
        ar: "يتم تنفيذ التوصيل من قبل السائق وفق التفاصيل المتفق عليها مع العميل.",
        en: "The delivery is carried out by the driver according to the terms agreed upon with the customer.",
      },
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-safedrop-gold" />,
      title: {
        ar: "الاشتراك الشهري المسبق",
        en: "Prepaid Monthly Subscription",
      },
      description: {
        ar: "لضمان الوصول إلى الطلبات وقبولها، يشترط أن يكون السائق مشتركًا في إحدى الباقات الشهرية مسبقًا. الاشتراك لا يرتبط بعدد الطلبات ولا بتأكيد الاستلام.",
        en: "To ensure access to and acceptance of delivery requests, drivers are required to have an active monthly subscription in advance. The subscription is not tied to the number of orders or the confirmation of delivery.",
      },
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-safedrop-primary mb-4">
            {language === "ar"
              ? "كيف تعمل منصة سيف دروب؟"
              : "How Does SafeDrop Work?"}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {language === "ar"
              ? "أربع خطوات بسيطة تتيح ربط العملاء بالسائقين المستقلين لإنجاز طلبات التوصيل بطريقة آمنة وسريعة"
              : "Four simple steps that connect customers with independent drivers to complete delivery requests in a safe and fast manner."}
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center"
              >
                {/* Step Number with Icon */}
                <div className="mb-4 relative">
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white border-2 border-safedrop-gold shadow-lg mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-safedrop-primary text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>

                {/* Step Text */}
                <h3 className="text-xl font-semibold text-safedrop-primary mb-2">
                  {step.title[language]}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.description[language]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
