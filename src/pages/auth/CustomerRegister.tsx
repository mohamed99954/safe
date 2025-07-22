import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { useNavigate, Link } from "react-router-dom";
import {
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Cookies from "js-cookie";

const CustomerRegisterContent = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);

  const customerRegisterSchema = z.object({
    firstName: z.string().min(2, { message: t("requiredFirstName") }),
    lastName: z.string().min(2, { message: t("requiredLastName") }),
    email: z.string().email({ message: t("invalidEmail") }),
    phone: z.string().min(10, { message: t("invalidPhoneNumber") }),
    password: z.string().min(8, { message: t("passwordMinLength") }),
  });

  type CustomerFormValues = z.infer<typeof customerRegisterSchema>;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  // Fixed email checking function using the database function
  const checkEmailExists = async (email) => {
    try {
      const { data, error } = await supabase.rpc("check_email_exists", {
        email_to_check: email.toLowerCase(),
      });

      if (error) {
        console.error("Error checking email:", error);
        return false; // Allow registration on error
      }

      return data; // Returns boolean: true if email exists, false if available
    } catch (error) {
      console.error("Error in email check:", error);
      return false;
    }
  };

  const sendAdminNotification = async (userData, userType = "customer") => {
    try {
      console.log(
        `Sending admin notification for new ${userType}:`,
        userData.email
      );

      const currentLanguage = "ar";

      const { data: emailResult, error: emailError } =
        await supabase.functions.invoke("send-admin-notification", {
          body: {
            userData: {
              first_name: userData.first_name,
              last_name: userData.last_name,
              email: userData.email,
              phone: userData.phone,
              user_type: userData.user_type,
              created_at: new Date().toISOString(),
            },
            userType: userType,
            language: currentLanguage,
          },
        });

      if (emailError) {
        console.error("Error sending admin notification:", emailError);
      } else {
        console.log("Admin notification sent successfully:", emailResult);
      }
    } catch (error) {
      console.error("Error in sendAdminNotification:", error);
    }
  };

  const onSubmit = async (data: CustomerFormValues) => {
    if (isLoading) return;

    setIsLoading(true);
    setRegistrationError(null);

    try {
      const emailExists = await checkEmailExists(data.email);

      if (emailExists) {
        setRegistrationError(
          "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول."
        );
        toast.error("هذا البريد الإلكتروني مسجل بالفعل");
        setIsLoading(false);
        return;
      }

      const { data: authData, error: signUpError } = await supabase.auth.signUp(
        {
          email: data.email,
          password: data.password,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              phone: data.phone,
              user_type: "customer",
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }
      );

      if (signUpError) {
        if (
          signUpError.message.includes("User already registered") ||
          signUpError.message.includes("already been registered") ||
          signUpError.message.includes("duplicate") ||
          signUpError.message.includes("already exists") ||
          signUpError.message.includes("already taken")
        ) {
          setRegistrationError(
            "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول."
          );
          toast.error("هذا البريد الإلكتروني مسجل بالفعل");
          setIsLoading(false);
          return;
        }
        throw signUpError;
      }

      if (!authData.user) throw new Error(t("userCreationFailed"));

      const pendingUserDetails = {
        id: authData.user.id,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email,
        user_type: "customer",
      };

      Cookies.set("pendingUserDetails", JSON.stringify(pendingUserDetails), {
        expires: 1 / 24,
        secure: true,
        sameSite: "strict",
      });

      await sendAdminNotification(pendingUserDetails, "customer");

      setRegistrationComplete(true);
      toast.success(t("registrationSuccess"));
    } catch (error: any) {
      console.error("Registration error:", error);

      const errorMsg =
        error.message?.includes("User already registered") ||
        error.message?.includes("duplicate key") ||
        error.message?.includes("already registered")
          ? "هذا البريد الإلكتروني مسجل بالفعل"
          : error.message || t("registrationError");

      setRegistrationError(errorMsg);
      toast.error(t("registrationError"), { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            {t("accountCreatedSuccessfully")}
          </h2>
          <p className="mt-2 text-gray-600">{t("emailVerificationSuccess")}</p>
          <div className="mt-6">
            <Button
              onClick={() =>
                navigate("/login", {
                  state: { email: form.getValues("email") },
                })
              }
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              {t("goToLoginPage")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8">
        <div className="text-center">
          <img
            alt="SafeDrop Logo"
            className="mx-auto h-20 w-auto mb-4"
            src="/lovable-uploads/abbaa84d-9220-43c2-833e-afb017f5a986.png"
          />
          <h2 className="text-3xl font-bold text-safedrop-primary">
            {t("customerRegister")}
          </h2>
        </div>

        {registrationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="flex gap-2 items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{registrationError}</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("firstName")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder={t("firstName")}
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>{t("lastName")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          placeholder={t("lastName")}
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phone")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="tel"
                        placeholder={t("phonePlaceholder")}
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
              disabled={isLoading}
            >
              {isLoading ? t("registering") : t("register")}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          {t("alreadyHaveAccount")}{" "}
          <Link to="/login" className="text-safedrop-gold hover:underline">
            {t("login")}
          </Link>
        </div>
      </div>
    </div>
  );
};

const CustomerRegister = () => (
  <LanguageProvider>
    <CustomerRegisterContent />
  </LanguageProvider>
);

export default CustomerRegister;
