import React from "react";
import CustomerSidebar from "@/components/customer/CustomerSidebar";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
const CustomerSupportContent = () => {
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

  return (
    <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">
          {t("support")}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Call Us Card */}
          <Card className="flex flex-col items-center justify-center p-6">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <Phone className="text-green-600 w-6 h-6" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{t("callUs")}</h2>
            <p className="text-sm text-gray-500 mb-4 ">
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
            <AccordionItem value="item-1">
              <AccordionTrigger>{t("trackOrder")}</AccordionTrigger>
              <AccordionContent>{t("trackOrderAnswer")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>{t("needHelpOrder")}</AccordionTrigger>
              <AccordionContent>{t("needHelpOrderAnswer")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>{t("contactDriver")}</AccordionTrigger>
              <AccordionContent>{t("contactDriverAnswer")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>{t("modifyAddress")}</AccordionTrigger>
              <AccordionContent>{t("modifyAddressAnswer")}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>{t("deleteAccountQuestion")}</AccordionTrigger>
              <AccordionContent style={{ whiteSpace: "pre-line" }}>
                {t("deleteAccountAnswer")}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </main>
    </div>
  );
};
const CustomerSupport = () => {
  return (
    <LanguageProvider>
      <CustomerSupportContent />
    </LanguageProvider>
  );
};
export default CustomerSupport;
