import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Award, Target, Users, Shield } from "lucide-react";

const AboutContent = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-safedrop-primary text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t("aboutHero")}
            </h1>
            <p className="text-xl max-w-3xl mx-auto">{t("aboutDescription")}</p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-safedrop-primary">
                  {t("ourStory")}
                </h2>
                <p className="text-gray-700 mb-2">
                  {t("ourStoryDescription1")}
                </p>
                <p className="text-gray-700 mb-2">
                  {t("ourStoryDescription2")}
                </p>
                <p className="text-gray-700 mb-2">
                  {t("ourStoryDescription3")}
                </p>
              </div>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  alt="About SafeDrop"
                  className="w-full h-auto"
                  src="/lovable-uploads/ff85dfb5-9750-46d8-a071-2b625d81f41a.png"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-safedrop-primary">
                {t("ourValues")}
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                {t("ourValuesDescription")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-safedrop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-safedrop-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("reliability")}
                </h3>
                <p className="text-gray-600">{t("reliabilityDescription")}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-safedrop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-safedrop-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("quality")}</h3>
                <p className="text-gray-600">{t("qualityDescription")}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-safedrop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-safedrop-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("transparency")}
                </h3>
                <p className="text-gray-600">{t("transparencyDescription")}</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-safedrop-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-safedrop-gold" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {t("innovation")}
                </h3>
                <p className="text-gray-600">{t("innovationDescription")}</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const About = () => {
  return (
    <LanguageProvider>
      <AboutContent />
    </LanguageProvider>
  );
};

export default About;
