import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DriverSidebar from "@/components/driver/DriverSidebar";
import { Phone, Mail } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DriverSupportContent = () => {
  const { t } = useLanguage();

  const handleCall = () => {
    const phoneNumber = "+966556160601";
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleEmail = () => {
    const email = "support@safedropksa.com";
    const subject = encodeURIComponent("طلب دعم فني - Support Request");
    const body = encodeURIComponent("");
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const getFormattedPhoneNumber = () => {
    return (
      <span className="inline-block" dir="ltr">
        &#x2066;+966 55 616 0601&#x2069;
      </span>
    );
  };

  const faqItems = [
    {
      question: t("startAcceptingOrdersQuestion"),
      answer: t("startAcceptingOrdersAnswer"),
    },
    {
      question: t("accountActivationRequirementsQuestion"),
      answer: t("accountActivationRequirementsAnswer"),
    },
    {
      question: t("earningsTransferQuestion"),
      answer: t("earningsTransferAnswer"),
    },
    {
      question: t("accountSuspensionQuestion"),
      answer: t("accountSuspensionAnswer"),
    },
    {
      question: t("ignoreOrderQuestion"),
      answer: t("ignoreOrderAnswer"),
    },
    {
      question: t("cantFindCustomerQuestion"),
      answer: t("cantFindCustomerAnswer"),
    },
    {
      question: t("deleteAccountQuestion"),
      answer: t("deleteAccountAnswer"),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <DriverSidebar />

      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">
          {t("supportTitle")}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Call Us Card */}
          <Card className="flex flex-col items-center justify-center p-6">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <Phone className="text-green-600 w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{t("callUs")}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {getFormattedPhoneNumber()}
            </p>
            <Button variant="outline" onClick={handleCall} className="w-full">
              {t("callUs")}
            </Button>
          </Card>

          {/* Email Support Card */}
          <Card className="flex flex-col items-center justify-center p-6">
            <div className="bg-purple-100 p-3 rounded-full mb-4">
              <Mail className="text-purple-600 w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{t("emailSupport")}</h2>
            <p className="text-sm mb-4">{t("contactEmail")}</p>
            <Button variant="outline" onClick={handleEmail} className="w-full">
              {t("emailSupport")}
            </Button>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="md:text-2xl font-bold mb-4 text-xl">
            {t("faqTitle")}
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index + 1}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p
                    className="text-gray-600"
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </main>
    </div>
  );
};

const DriverSupport = () => {
  return (
    <LanguageProvider>
      <DriverSupportContent />
    </LanguageProvider>
  );
};

export default DriverSupport;
