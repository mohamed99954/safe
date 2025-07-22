import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const PrivacyContent = () => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-[#0A192F] py-12 mb-8">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              {language === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
            </h1>
          </div>
        </div>

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            {language === "ar" ? (
              // Arabic content
              <>
                <section className="space-y-6" dir="rtl">
                  <div className="bg-gradient-to-r from-safedrop-primary/5 to-safedrop-gold/5 border border-safedrop-gold/20 rounded-lg p-6">
                    <p className="text-safedrop-primary text-lg leading-relaxed font-medium">
                      في منصة سيف دروب، التي تعمل كوسيط تقني يربط بين العملاء
                      والسائقين لتسهيل خدمات التوصيل، نحترم خصوصية مستخدمينا
                      ونسعى لحماية بياناتهم الشخصية وفقًا لأفضل الممارسات
                      والقوانين المعمول بها في المملكة العربية السعودية، بما في
                      ذلك لوائح حماية البيانات الصادرة عن الهيئة السعودية
                      للبيانات والذكاء الاصطناعي (سدايا).
                    </p>
                  </div>
                </section>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    1. البيانات التي نقوم بجمعها
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    نقوم بجمع البيانات التالية عند استخدامك للمنصة أو التطبيق:
                  </p>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>• الاسم الكامل</li>
                    <li>• رقم الجوال</li>
                    <li>• البريد الإلكتروني</li>
                    <li>• الموقع الجغرافي (عند طلب الخدمة)</li>
                    <li>
                      • معلومات الدفع (تتم معالجتها عبر مزودي بوابات دفع مرخصة
                      خارجيًا، ولا تحتفظ المنصة بها مباشرة)
                    </li>
                    <li>
                      • أي بيانات يقدمها المستخدم ضمن الطلبات أو الرسائل داخل
                      التطبيق
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    2. كيف نستخدم بياناتك
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    نستخدم البيانات التي نجمعها للأغراض التالية:
                  </p>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>• تنفيذ الطلبات وتوصيل الخدمات بين العميل والسائق</li>
                    <li>• تحسين تجربة المستخدم وجودة الخدمة</li>
                    <li>• التواصل معك في حال وجود تحديثات أو مشكلات</li>
                    <li>• الامتثال للأنظمة والقوانين المحلية</li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    3. مشاركة البيانات
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    نحن لا نشارك بياناتك الشخصية مع أي طرف ثالث، باستثناء:
                  </p>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>• السائق المرتبط بطلبك لتنفيذ الخدمة</li>
                    <li>
                      • الجهات التنظيمية عند الطلب الرسمي (مثل الجهات الأمنية أو
                      القضائية)
                    </li>
                    <li>
                      • مزودي خدمات الدفع الآمن (مثل بوابات الدفع المرخصة)
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    4. حماية البيانات
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    نستخدم إجراءات تقنية وتنظيمية مناسبة لحماية بياناتك من
                    الوصول أو التعديل أو الإفشاء أو الإتلاف غير المصرح به.
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    5. حقوقك
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    لديك الحق في:
                  </p>
                  <ul className="space-y-2 text-gray-700 leading-relaxed mb-4">
                    <li>• طلب معرفة البيانات التي نحتفظ بها عنك</li>
                    <li>• تعديل بياناتك الشخصية</li>
                    <li>
                      • طلب حذف حسابك وبياناتك (وفقًا للأنظمة المعمول بها)
                    </li>
                    <li>
                      • الاعتراض على معالجة بياناتك أو تقييدها حسب القوانين
                      المعمول بها
                    </li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    يمكنك تنفيذ أي من هذه الحقوق عبر التواصل معنا على البريد
                    الإلكتروني التالي:
                  </p>
                  <p className="text-safedrop-primary font-semibold mt-2">
                    📧 info@safedropksa.com
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    6. فترة حفظ البيانات
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    نحتفظ ببياناتك فقط للمدة اللازمة لتحقيق أغراض المعالجة أو
                    الامتثال للأنظمة القانونية.
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    7. ملفات تعريف الارتباط (Cookies)
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    قد نستخدم ملفات "كوكيز" لتحسين تجربة التصفح، وهي لا تجمع
                    بيانات شخصية مباشرة.
                  </p>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    8. التعديلات على السياسة
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    نحتفظ بالحق في تعديل هذه السياسة في أي وقت. سيتم إشعار
                    المستخدمين بأي تغييرات جوهرية من خلال الموقع أو التطبيق.
                  </p>
                </div>
              </>
            ) : (
              // English content
              <>
                <section className="space-y-6">
                  <div className="bg-gradient-to-r from-safedrop-primary/5 to-safedrop-gold/5 border border-safedrop-gold/20 rounded-lg p-6">
                    <p className="text-safedrop-primary text-lg leading-relaxed font-medium">
                      At SafeDrop, a platform that operates as a technical
                      intermediary connecting customers and drivers to
                      facilitate delivery services, we respect the privacy of
                      our users and are committed to protecting their personal
                      data in accordance with best practices and applicable laws
                      in the Kingdom of Saudi Arabia, including the data
                      protection regulations issued by the Saudi Data and
                      Artificial Intelligence Authority (SDAIA).
                    </p>
                  </div>
                </section>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    1. Data We Collect
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We collect the following data when you use our platform or
                    application:
                  </p>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>• Full name</li>
                    <li>• Mobile number</li>
                    <li>• Email address</li>
                    <li>• Geolocation (when requesting a service)</li>
                    <li>
                      • Payment information (processed through licensed
                      third-party payment gateways; the platform does not store
                      this data directly)
                    </li>
                    <li>
                      • Any data submitted by the user within orders or messages
                      on the app
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    2. How We Use Your Data
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use the collected data for the following purposes:
                  </p>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      • Facilitating order execution and service delivery
                      between the customer and driver
                    </li>
                    <li>• Improving user experience and service quality</li>
                    <li>
                      • Communicating with you regarding updates or issues
                    </li>
                    <li>• Complying with local laws and regulations</li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    3. Data Sharing
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We do not share your personal data with any third party,
                    except for:
                  </p>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      • The driver assigned to your request for service
                      fulfillment
                    </li>
                    <li>
                      • Regulatory authorities upon official request (such as
                      law enforcement or judicial entities)
                    </li>
                    <li>
                      • Secure payment drivers (such as licensed payment
                      gateways)
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    4. Data Protection
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We implement appropriate technical and organizational
                    measures to protect your data from unauthorized access,
                    modification, disclosure, or destruction.
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    5. Your Rights
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You have the right to:
                  </p>
                  <ul className="space-y-2 text-gray-700 leading-relaxed mb-4">
                    <li>• Request access to the data we hold about you</li>
                    <li>• Modify your personal information</li>
                    <li>
                      • Request the deletion of your account and data (in
                      accordance with applicable laws)
                    </li>
                    <li>
                      • Object to or restrict the processing of your data as
                      permitted by law
                    </li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    You can exercise these rights by contacting us at:
                  </p>
                  <p className="text-safedrop-primary font-semibold mt-2">
                    📧 info@safedropksa.com
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    6. Data Retention
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We retain your data only for as long as necessary to fulfill
                    the purposes outlined in this policy or as required by legal
                    obligations.
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    7. Cookies
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may use cookies to enhance your browsing experience.
                    These do not collect personal data directly.
                  </p>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    8. Changes to This Policy
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to update or modify this policy at any
                    time. Users will be notified of any material changes through
                    the website or application.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const Privacy = () => {
  return (
    <LanguageProvider>
      <PrivacyContent />
    </LanguageProvider>
  );
};

export default Privacy;
