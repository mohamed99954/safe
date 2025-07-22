import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { UserIcon, CarIcon } from "lucide-react";
import { Link } from "react-router-dom";

const RegisterContent = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <img
            src="/lovable-uploads/264169e0-0b4b-414f-b808-612506987f4a.png"
            alt="SafeDrop Logo"
            className="mx-auto h-20 w-auto"
          />
          <h2 className="mt-4 text-3xl font-bold text-safedrop-primary">
            تسجيل حساب جديد
          </h2>
          <p className="mt-2 text-gray-600">اختر نوع الحساب الذي تريد إنشاءه</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Registration Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-14 h-14 rounded-full bg-safedrop-primary mx-auto flex items-center justify-center mb-4">
                <UserIcon className="h-7 w-7 text-safedrop-gold" />
              </div>
              <CardTitle className="text-xl">حساب عميل</CardTitle>
              <CardDescription>طلب خدمات التوصيل</CardDescription>
            </CardHeader>

            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">
                سجل كعميل لطلب خدمات توصيل الطرود الثمينة بشكل آمن وموثوق.
              </p>
            </CardContent>

            <CardFooter className="flex justify-center">
              <Button
                asChild
                className="bg-safedrop-gold hover:bg-safedrop-gold/90 w-full"
              >
                <Link to="/register/customer">تسجيل كعميل</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Driver Registration Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="w-14 h-14 rounded-full bg-safedrop-primary mx-auto flex items-center justify-center mb-4">
                <CarIcon className="h-7 w-7 text-safedrop-gold" />
              </div>
              <CardTitle className="text-xl">حساب سائق</CardTitle>
              <CardDescription>تقديم خدمات التوصيل</CardDescription>
            </CardHeader>

            <CardContent className="text-center">
              <p className="text-gray-600 text-sm">
                سجل كسائق للانضمام إلى شبكتنا وتقديم خدمات التوصيل للعملاء.
              </p>
            </CardContent>

            <CardFooter className="flex justify-center">
              <Button
                asChild
                className="bg-safedrop-gold hover:bg-safedrop-gold/90 w-full"
              >
                <Link to="/register/driver">تسجيل كسائق</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            لديك حساب بالفعل؟{" "}
            <Link to="/login" className="text-safedrop-gold hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  return (
    <LanguageProvider>
      <RegisterContent />
    </LanguageProvider>
  );
};

export default Register;
