import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const TermsContent = () => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-[#0A192F] py-12 mb-8">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">
              {language === "ar" ? "الشروط والأحكام" : "Terms & Conditions"}
            </h1>
          </div>
        </div>

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
            {language === "ar" ? (
              // Arabic content
              <>
                <section className="space-y-6" dir="rtl">
                  <div className="border-r-4 border-safedrop-gold pr-6">
                    <h2 className="text-2xl font-bold text-safedrop-primary mb-4">
                      1. التعريفات
                    </h2>
                    <ul className="space-y-4 text-gray-700 text-lg">
                      <li className="flex gap-2">
                        <span className="font-semibold whitespace-nowrap">
                          المنصة:
                        </span>
                        <span>
                          تشير إلى موقع وتطبيق "سيف دروب" الإلكتروني، الذي يعمل
                          كوسيط تقني يوفر وسيلة إلكترونية لربط المستخدمين
                          الراغبين في إرسال أو استلام طلبات بمقدمي خدمات
                          مستقلين.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold whitespace-nowrap">
                          السائق:
                        </span>
                        <span>
                          الشخص الطبيعي أو الاعتباري الذي يقدم خدمات التوصيل أو
                          النقل بصفة مستقلة، دون ارتباط تشغيلي أو تعاقدي مع
                          المنصة.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold whitespace-nowrap">
                          العميل:
                        </span>
                        <span>
                          الشخص الطبيعي أو الاعتباري الذي يستخدم المنصة لطلب
                          خدمات التوصيل أو النقل.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold whitespace-nowrap">
                          الخدمة:
                        </span>
                        <span>
                          أي عملية توصيل أو استلام تتم خارج نطاق المنصة، ويجري
                          تنفيذها مباشرة بين العميل والسائق دون تدخل من المنصة.
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    2. دور المنصة
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      تعمل "سيف دروب" كوسيط تقني محايد، تقتصر مهمته على تمكين
                      التواصل التقني بين العملاء والسائقين، دون أن تشارك في
                      تقديم الخدمة فعليًا أو الإشراف عليها.
                    </li>
                    <li>
                      لا تُعد المنصة مزودًا لخدمة التوصيل أو النقل، ولا تملك أو
                      تدير أي مركبات، ولا توظف أو تتحكم بالسائقين.
                    </li>
                    <li>
                      لا تتحمل المنصة أي مسؤولية قانونية أو تشغيلية تتعلق بتنفيذ
                      الخدمة، بما في ذلك (على سبيل المثال لا الحصر): جودة النقل،
                      توقيت التوصيل، أو حالة الشحنة.
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    3. حدود المسؤولية
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      تتم جميع الاتفاقيات المتعلقة بالخدمة (بما في ذلك التكلفة،
                      وسائل الدفع، وقت ومكان التسليم) بشكل مباشر بين العميل
                      والسائق، دون تدخل أو مسؤولية على المنصة.
                    </li>
                    <li>
                      تقع مسؤولية التحقق من هوية وكفاءة السائق على العميل، وتخلي
                      المنصة مسؤوليتها عن أي أضرار أو خسائر تنشأ عن التعامل بين
                      الطرفين.
                    </li>
                    <li>
                      في حال وقوع أي نزاع بين العميل والسائق، يتم حله بينهما
                      مباشرة، وتخلي المنصة مسؤوليتها عن التدخل أو الضمان.
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    4. استخدام المنصة
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      يقر المستخدم بأن استخدام المنصة يتم على مسؤوليته الخاصة.
                    </li>
                    <li>
                      لا تضمن المنصة توفر خدمات في جميع الأوقات أو قبول جميع
                      الطلبات.
                    </li>
                    <li>
                      يلتزم المستخدمون بالامتثال لجميع الأنظمة واللوائح ذات
                      الصلة، بما في ذلك اشتراطات الجهات التنظيمية ذات العلاقة
                      (مثل الهيئة العامة للنقل)، حسب طبيعة الخدمة المنفذة.
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    5. الدفع
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      لا تجمع المنصة أي مبالغ مالية نيابة عن أي طرف، ولا تدير
                      حسابات أو محفظات مالية داخلية.
                    </li>
                    <li>
                      تتم جميع عمليات الدفع والتعويضات بين العميل والسائق بشكل
                      مباشر خارج المنصة، ما لم يُذكر خلاف ذلك بوضوح وبموجب خدمات
                      طرف ثالث مستقل ومرخص.
                    </li>
                    <li>
                      الاشتراك الشهري المدفوع يُعد رسمًا مقابل استخدام المنصة
                      والوصول إلى ميزاتها التقنية، ولا يُمثل عمولة على الطلبات
                      أو نسبة من قيمة الخدمات المقدمة بين المستخدمين.
                    </li>
                    <li>
                      لا تضمن المنصة عددًا معينًا من الطلبات أو أي دخل معين
                      مقابل الاشتراك المدفوع.
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    6. التعديلات
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      تحتفظ المنصة بحق تعديل أو تحديث هذه الشروط في أي وقت دون
                      إشعار مسبق.
                    </li>
                    <li>
                      استمرار استخدام المنصة يُعد موافقة ضمنية على الشروط
                      المعدّلة.
                    </li>
                  </ul>
                </div>

                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    7. القانون والاختصاص
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>تخضع هذه الشروط لأنظمة المملكة العربية السعودية.</li>
                    <li>
                      في حال وقوع نزاع، تكون الجهة القضائية المختصة في المملكة
                      هي المرجع الحصري للفصل فيه.
                    </li>
                  </ul>
                </div>
                <div className="border-r-4 border-safedrop-gold pr-6" dir="rtl">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    8. سياسة الاسترجاع
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      جميع المدفوعات التي تتم عبر المنصة مقابل الاشتراكات أو
                      الخدمات التقنية تُعد نهائية وغير قابلة للاسترجاع، سواء
                      كليًا أو جزئيًا، بعد إتمام عملية الدفع.
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              // English content
              <>
                <section className="space-y-6">
                  <div className="border-l-4 border-safedrop-gold pl-6">
                    <h2 className="text-2xl font-bold text-safedrop-primary mb-4">
                      1. Definitions
                    </h2>
                    <ul className="space-y-4 text-gray-700 text-lg">
                      <li className="flex gap-2">
                        <span className="font-semibold whitespace-nowrap">
                          Platform:
                        </span>
                        <span>
                          Refers to "SafeDrop" website and application, which
                          operates as a neutral technical intermediary providing
                          an electronic means to connect users wishing to send
                          or receive orders with independent drivers.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold whitespace-nowrap">
                          Driver:
                        </span>
                        <span>
                          A natural or legal person who independently offers
                          delivery or transportation services, without any
                          operational or contractual affiliation with the
                          platform.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold whitespace-nowrap">
                          Client:
                        </span>
                        <span>
                          A natural or legal person who uses the platform to
                          request delivery or transportation services.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-semibold whitespace-nowrap">
                          Service:
                        </span>
                        <span>
                          Any delivery or pickup operation performed outside the
                          platform's scope, executed directly between the client
                          and the driver without the platform's intervention.
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    2. Role of the Platform
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      SafeDrop operates as a neutral technical intermediary
                      whose role is limited to enabling technical communication
                      between clients and drivers, without actual involvement in
                      providing or supervising the service.
                    </li>
                    <li>
                      The platform is not a provider of delivery or
                      transportation services, does not own or manage any
                      vehicles, and does not employ or control the drivers.
                    </li>
                    <li>
                      The platform bears no legal or operational responsibility
                      related to service execution, including (but not limited
                      to) transport quality, delivery timing, or shipment
                      condition.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    3. Limitation of Liability
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      All agreements related to the service (including cost,
                      payment methods, delivery time and location) are made
                      directly between the client and the driver, without
                      intervention or liability on the platform.
                    </li>
                    <li>
                      The client is responsible for verifying the identity and
                      competence of the driver, and the platform disclaims
                      responsibility for any damages or losses arising from
                      dealings between the parties.
                    </li>
                    <li>
                      In case of any dispute between the client and the driver,
                      it shall be resolved directly between them, and the
                      platform disclaims any liability for intervention or
                      guarantee.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    4. Use of the Platform
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      The user acknowledges that use of the platform is at their
                      own risk.
                    </li>
                    <li>
                      The platform does not guarantee availability of services
                      at all times or acceptance of all requests.
                    </li>
                    <li>
                      Users must comply with all relevant laws and regulations,
                      including requirements of regulatory authorities (such as
                      the General Authority for Transport), according to the
                      nature of the executed service.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    5. Payment
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      The platform does not collect any funds on behalf of any
                      party and does not manage any internal accounts or
                      wallets.
                    </li>
                    <li>
                      All payment and compensation transactions occur directly
                      between the client and the driver outside the platform,
                      unless otherwise explicitly stated and provided via an
                      independent licensed third-party service.
                    </li>
                    <li>
                      The paid monthly subscription is considered a fee for
                      using the platform and accessing its technical features.
                      It does not represent a commission on orders or a
                      percentage of the services exchanged between users.
                    </li>
                    <li>
                      The platform does not guarantee any specific number of
                      orders or income in exchange for the paid subscription.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    6. Amendments
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      The platform reserves the right to modify or update these
                      terms at any time without prior notice.
                    </li>
                    <li>
                      Continued use of the platform constitutes implicit
                      acceptance of the amended terms.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    7. Governing Law and Jurisdiction
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      These terms are governed by the laws of the Kingdom of
                      Saudi Arabia.
                    </li>
                    <li>
                      In the event of a dispute, the competent judicial
                      authority in the Kingdom shall have exclusive jurisdiction
                      to resolve it.
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-safedrop-gold pl-6">
                  <h2 className="text-xl font-bold text-safedrop-primary mb-4">
                    8. Refund Policy
                  </h2>
                  <ul className="space-y-2 text-gray-700 leading-relaxed">
                    <li>
                      All payments made through the platform for subscriptions
                      or technical services are considered final and
                      non-refundable, whether in full or in part, once the
                      payment process is completed.
                    </li>
                  </ul>
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

const Terms = () => {
  return (
    <LanguageProvider>
      <TermsContent />
    </LanguageProvider>
  );
};

export default Terms;
