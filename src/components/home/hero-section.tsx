
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from '@/components/ui/language-context';

export const HeroSection = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t, language } = useLanguage();
  
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);
  
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center">
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-gray-800">
        <video 
          ref={videoRef} 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover" 
          poster="https://images.unsplash.com/photo-1566576912333-261b896ef5cd?q=80&w=2070&auto=format&fit=crop"
        >
          <source src="/mixkit-parcel-clerk-placing-boxes-on-a-loading-dolly-31267-hd-ready.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          {t('siteTitle')}
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl mb-8 max-w-3xl mx-auto">
          {t('tagline')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register/customer">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
              {t('customerRegister')}
            </Button>
          </Link>
          <Link to="/register/driver">
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white px-8">
              {t('driverRegister')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
