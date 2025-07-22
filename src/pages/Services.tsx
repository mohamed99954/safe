import React, { useEffect } from "react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Shield, Truck, Package, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const ServicesContent = () => {
  const { t, language } = useLanguage();

  useEffect(() => {
    // Ensure the page direction and language are set correctly
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-safedrop-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {language === "ar" ? "خدماتنا" : "Our Services"}
            </h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              {language === "ar"
                ? "توفر المنصة وسيلة سهلة وآمنة لربط العملاء بالسائقين المستقلين، مع تمكين التواصل المباشر بين الطرفين خارج المنصة."
                : "The platform provides a simple and secure way to connect customers with independent drivers, enabling direct communication between both parties outside the platform."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-safedrop-gold hover:bg-safedrop-gold/90 text-white"
              >
                <Link to="/register/customer">
                  {language === "ar" ? "تسجيل كعميل" : "Register as Customer"}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white"
              >
                <Link to="/register/driver">
                  {language === "ar" ? "تسجيل كسائق" : "Register as Driver"}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Package className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {language === "ar"
                      ? "ربط العملاء بمقدمي خدمات التوصيل"
                      : "Connecting customers with delivery service providers"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "ar"
                      ? "منصة تتيح ربط العملاء بمقدمي خدمة توصيل موثوقين، مع توفير أدوات تقنية تضمن سهولة الطلب ومتابعته."
                      : "A platform that connects customers with reliable delivery service providers, offering technical tools to ensure easy order placement and tracking."}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "تغطية شاملة لكافة المناطق"
                          : "Comprehensive coverage across all regions"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "نشر الطلبات ومتابعتها بشكل واضح"
                          : "Clear order posting and tracking"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "اتصال مباشر بين العملاء والسائقين"
                          : "Direct connection between customers and drivers"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Shield className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {language === "ar"
                      ? "نظام الشفافية والأمان"
                      : "Transparency and Safety"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "ar"
                      ? "يعمل النظام على توضيح تفاصيل الطلب وشروط الدفع بشكل واضح، دون تدخل في الاتفاقات المالية بين الطرفين."
                      : "The platform facilitates transactions by clarifying payment terms and ensuring the rights of both parties."}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "تفاصيل واضحة لكل طلب"
                          : "Clear information for each order"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "تأكيد الاستلام قبل إتمام العملية"
                          : "Delivery confirmation before completion"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "تعزيز الثقة بين الأطراف"
                          : "Strengthening trust between parties"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Clock className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {language === "ar"
                      ? "المرونة في التوصيل"
                      : "Flexible Delivery"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "ar"
                      ? "تمكن المنصة العملاء من نشر طلبات فورية، ويختار السائقون قبول الطلبات التي تتناسب مع توافرهم دون وسيط أو تدخل."
                      : "Users can post urgent delivery requests, which are immediately visible to drivers without platform interference in execution."}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "إمكانية التوصيل في نفس اليوم حسب توفر السائق"
                          : "Same-day delivery when available"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "دعم للطلبات العاجلة"
                          : "Suitable for urgent requests"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? " خدمة متاحة على مدار الساعة"
                          : "Available 24/7"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="w-14 h-14 rounded-full bg-safedrop-primary flex items-center justify-center mb-4">
                    <Truck className="h-7 w-7 text-safedrop-gold" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {language === "ar"
                      ? "السائقون المستقلون"
                      : "Independent Drivers"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {language === "ar"
                      ? "تتيح المنصة للسائقين التسجيل بعد التحقق من بياناتهم، مع عرض تقييماتهم بشكل شفاف بعد تنفيذ كل طلب."
                      : "Drivers can register on the platform after submitting their required information, and their ratings are displayed transparently after completing deliveries."}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "التحقق من الهوية والرخصة"
                          : "Identity and license verification"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? "عرض التقييمات بعد كل توصيل"
                          : "Display of customer ratings after each delivery"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>
                        {language === "ar"
                          ? " قبول السائق للطلبات بناءً على رغبته وتوافره"
                          : "Drivers accept requests based on their availability and preference"}
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-safedrop-primary mb-6">
              {language === "ar"
                ? "انضم الآن إلى سيف دروب"
                : "Join SafeDrop Now"}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {language === "ar"
                ? "واستفد من منصة تقنية ذكية تربطك بسائقين مستقلين لتوصيل احتياجاتك بسرعة وأمان، بكل سهولة ومن دون تعقيد."
                : "Benefit from a smart tech platform that connects you with independent drivers to deliver your needs quickly, safely, and effortlessly without any hassle."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-safedrop-primary hover:bg-safedrop-primary/90"
              >
                <Link to="/register/customer">
                  {language === "ar" ? "تسجيل كعميل" : "Register as Customer"}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-safedrop-primary text-safedrop-primary hover:bg-safedrop-primary hover:text-white"
              >
                <Link to="/register/driver">
                  {language === "ar" ? "تسجيل كسائق" : "Register as Driver"}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Services = () => {
  return (
    <LanguageProvider>
      <ServicesContent />
    </LanguageProvider>
  );
};

export default Services;
