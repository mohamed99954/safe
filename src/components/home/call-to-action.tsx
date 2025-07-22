import { useLanguage } from "@/components/ui/language-context";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";

const CallToAction = () => {
  const { t, language } = useLanguage();
  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 bg-safedrop-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-safedrop-primary to-safedrop-primary/70 rounded-2xl p-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTRtMC0xNGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNG0tMTQgMGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNG0xNCAxNGMwLTIuMjA5LTEuNzkxLTQtNC00cy00IDEuNzkxLTQgNCAxLjc5MSA0IDQgNCA0LTEuNzkxIDQtNCIvPjwvZz48L2c+PC9zdmc+')] bg-repeat"></div>
          </div>

          {/* Gold circular accent */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-safedrop-gold opacity-10"></div>
          <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-safedrop-gold opacity-10"></div>

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {language === "ar" ? "انضم إلينا الآن" : "Join Us Now"}
            </h2>
            <p className="text-lg text-gray-300 mb-8">
              {language === "ar"
                ? "انضم إلى منصة سيف دروب وابدأ رحلتك مع سائقين مستقلين لتوصيل احتياجاتك بأمان"
                : "Join SafeDrop platform and start your journey with independent drivers to safely deliver your needs."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-safedrop-gold hover:bg-safedrop-gold/90 text-white"
              >
                <Link
                  to="/register/customer"
                  className="flex items-center gap-2"
                >
                  {t("customerRegister")}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white text-black bg-white hover:bg-white/90 hover:text-safedrop-primary"
              >
                <Link to="/register/driver" className="flex items-center gap-2">
                  {t("driverRegister")}
                  <ArrowIcon className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
