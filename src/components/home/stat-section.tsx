
import { useLanguage } from '@/components/ui/language-context';
import { UserCheck, Truck, Package, Star } from 'lucide-react';

const StatSection = () => {
  const {
    language
  } = useLanguage();
  
  const stats = [{
    icon: <UserCheck className="h-10 w-10 text-safedrop-gold" />,
    value: "100+",
    label: {
      ar: "عملاء سعداء",
      en: "Happy Customers"
    }
  }, {
    icon: <Truck className="h-10 w-10 text-safedrop-gold" />,
    value: "50+",
    label: {
      ar: "سائق معتمد",
      en: "Verified Drivers"
    }
  }, {
    icon: <Package className="h-10 w-10 text-safedrop-gold" />,
    value: "500+",
    label: {
      ar: "توصيل ناجح",
      en: "Successful Deliveries"
    }
  }, {
    icon: <Star className="h-10 w-10 text-safedrop-gold" />,
    value: "4.9",
    label: {
      ar: "تقييم العملاء",
      en: "Customer Rating"
    }
  }];
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center">
              {stat.icon}
              <h3 className="mt-4 text-3xl font-bold text-gray-900">{stat.value}</h3>
              <p className="mt-2 text-lg text-gray-600">{language === 'ar' ? stat.label.ar : stat.label.en}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatSection;
