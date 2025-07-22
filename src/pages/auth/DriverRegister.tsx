import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  Calendar,
  Upload,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Cookies from "js-cookie";

const DriverRegisterContent = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  const [waitTime, setWaitTime] = useState(0);
  const [idImagePreview, setIdImagePreview] = useState("");
  const [licenseImagePreview, setLicenseImagePreview] = useState("");
  const [idImageFile, setIdImageFile] = useState(null);
  const [licenseImageFile, setLicenseImageFile] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const driverRegisterSchema = z.object({
    firstName: z.string().min(2, {
      message: t("requiredFirstName"),
    }),
    lastName: z.string().min(2, {
      message: t("requiredLastName"),
    }),
    email: z.string().email({
      message: t("invalidEmail"),
    }),
    phone: z.string().min(10, {
      message: t("invalidPhoneNumber"),
    }),
    password: z.string().min(8, {
      message: t("passwordMinLength"),
    }),
    birthDate: z.string().min(1, {
      message: t("requiredBirthDate"),
    }),
    nationalId: z.string().min(10, {
      message: t("requiredNationalId"),
    }),
    licenseNumber: z.string().min(5, {
      message: t("requiredLicenseNumber"),
    }),
    vehicleInfo: z.object({
      make: z.string().min(2, {
        message: t("requiredVehicleMake"),
      }),
      model: z.string().min(2, {
        message: t("requiredVehicleModel"),
      }),
      year: z.string().regex(/^\d{4}$/, {
        message: t("requiredVehicleYear"),
      }),
      plateNumber: z.string().min(4, {
        message: t("requiredPlateNumber"),
      }),
    }),
    idImage: z.any().optional(),
    licenseImage: z.any().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message:
        language === "ar"
          ? "يجب الموافقة على الشروط والأحكام"
          : "You must accept the terms and conditions",
    }),
  });

  type DriverFormValues = z.infer<typeof driverRegisterSchema>;

  useEffect(() => {
    let timer;
    if (waitTime > 0) {
      timer = setTimeout(() => {
        setWaitTime(waitTime - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [waitTime]);

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverRegisterSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      birthDate: "",
      nationalId: "",
      licenseNumber: "",
      vehicleInfo: {
        make: "",
        model: "",
        year: "",
        plateNumber: "",
      },
      acceptTerms: false,
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

  const handleRateLimitError = () => {
    setWaitTime(60);
    setRegistrationError(
      "تم تجاوز الحد المسموح للتسجيل، يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى"
    );
    toast.error(
      "تم تجاوز الحد المسموح للتسجيل، يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى"
    );
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "id") {
        setIdImagePreview(reader.result as string);
        setIdImageFile(file);
      } else {
        setLicenseImagePreview(reader.result as string);
        setLicenseImageFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  // Upload files directly to Supabase Storage
  const uploadFilesToSupabase = async (userId) => {
    const uploadResults = {};
    try {
      // Upload ID image if exists
      if (idImageFile) {
        const fileExt = idImageFile.name.split(".").pop();
        const fileName = `${userId}_id_image_${Date.now()}.${fileExt}`;
        const filePath = `id-cards/${fileName}`;

        const { error: idUploadError } = await supabase.storage
          .from("driver-documents")
          .upload(filePath, idImageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (!idUploadError) {
          const { data: idImageData } = supabase.storage
            .from("driver-documents")
            .getPublicUrl(filePath);

          uploadResults.id_image = idImageData.publicUrl;
        } else {
          console.error("Error uploading ID image:", idUploadError);
        }
      }

      // Upload license image if exists
      if (licenseImageFile) {
        const fileExt = licenseImageFile.name.split(".").pop();
        const fileName = `${userId}_license_image_${Date.now()}.${fileExt}`;
        const filePath = `licenses/${fileName}`;

        const { error: licenseUploadError } = await supabase.storage
          .from("driver-documents")
          .upload(filePath, licenseImageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (!licenseUploadError) {
          const { data: licenseImageData } = supabase.storage
            .from("driver-documents")
            .getPublicUrl(filePath);

          uploadResults.license_image = licenseImageData.publicUrl;
        } else {
          console.error("Error uploading license image:", licenseUploadError);
        }
      }

      return uploadResults;
    } catch (error) {
      console.error("Error uploading files:", error);
      return uploadResults;
    }
  };

  // Store file data in localStorage as backup
  const storeFileData = (userId, idImage, licenseImage) => {
    const fileData = {};

    if (idImage) {
      fileData["id_image"] = {
        name: idImage.name,
        dataUrl: idImagePreview,
      };
    }

    if (licenseImage) {
      fileData["license_image"] = {
        name: licenseImage.name,
        dataUrl: licenseImagePreview,
      };
    }

    if (Object.keys(fileData).length > 0) {
      const fileDataKey = `driverFiles_${userId}`;
      localStorage.setItem(fileDataKey, JSON.stringify(fileData));
    }
  };

  // Create driver record directly
  const createDriverRecord = async (userId, data, imageUrls) => {
    try {
      const driverData = {
        id: userId,
        national_id: data.nationalId,
        license_number: data.licenseNumber,
        vehicle_info: data.vehicleInfo,
        status: "pending",
        is_available: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(imageUrls.id_image && { id_image: imageUrls.id_image }),
        ...(imageUrls.license_image && {
          license_image: imageUrls.license_image,
        }),
      };

      const { error: driverError } = await supabase
        .from("drivers")
        .insert(driverData);

      if (driverError) {
        console.error("Error creating driver record:", driverError);
        setDebugInfo({
          stage: "driver_insertion",
          error: driverError,
          data: driverData,
        });
        return false;
      }

      // Add driver role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: "driver",
        created_at: new Date().toISOString(),
      });

      if (roleError) {
        console.error("Error adding driver role:", roleError);
      }

      return true;
    } catch (error) {
      console.error("Error in createDriverRecord:", error);
      setDebugInfo({
        stage: "driver_creation",
        error: error,
      });
      return false;
    }
  };

  const openDriverTerms = () => {
    window.open("/driver-terms", "_blank");
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

  const onSubmit = async (data: DriverFormValues) => {
    if (waitTime > 0) {
      toast.error(`يرجى الانتظار ${waitTime} ثانية قبل المحاولة مرة أخرى`);
      return;
    }

    if (!acceptedTerms) {
      toast.error(
        language === "ar"
          ? "يجب الموافقة على الشروط والأحكام"
          : "You must accept the terms and conditions"
      );
      return;
    }

    setIsLoading(true);
    setRegistrationError(null);
    setDebugInfo(null);

    try {
      const emailExists = await checkEmailExists(data.email);

      if (emailExists) {
        setRegistrationError(
          language === "ar"
            ? "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول."
            : "This email is already registered. Please use a different email or login."
        );
        toast.error(
          language === "ar"
            ? "هذا البريد الإلكتروني مسجل بالفعل"
            : "This email is already registered"
        );
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
              user_type: "driver",
              birth_date: data.birthDate,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        }
      );

      if (signUpError) {
        if (
          signUpError.message.includes("rate limit") ||
          signUpError.message
            .toLowerCase()
            .includes("email rate limit exceeded")
        ) {
          handleRateLimitError();
        } else if (
          signUpError.message.includes("User already registered") ||
          signUpError.message.includes("already been registered") ||
          signUpError.message.includes("duplicate") ||
          signUpError.message.includes("already exists") ||
          signUpError.message.includes("already taken")
        ) {
          setRegistrationError(
            language === "ar"
              ? "هذا البريد الإلكتروني مسجل بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول."
              : "This email is already registered. Please use a different email or login."
          );
          toast.error(
            "البريد الإلكتروني مسجل بالفعل، يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول"
          );
        } else {
          setRegistrationError(
            "خطأ أثناء إنشاء الحساب: " + signUpError.message
          );
          toast.error("خطأ أثناء إنشاء الحساب: " + signUpError.message);
        }
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        setRegistrationError("فشل إنشاء الحساب، يرجى المحاولة مرة أخرى");
        toast.error("فشل إنشاء الحساب، يرجى المحاولة مرة أخرى");
        setIsLoading(false);
        return;
      }

      const imageUrls = await uploadFilesToSupabase(authData.user.id);

      const driverCreated = await createDriverRecord(
        authData.user.id,
        data,
        imageUrls
      );

      if (!driverCreated) {
        storeFileData(authData.user.id, idImageFile, licenseImageFile);
      }

      const pendingUserDetails = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email,
        user_type: "driver",
        birth_date: data.birthDate,
        national_id: data.nationalId,
        license_number: data.licenseNumber,
        vehicle_info: data.vehicleInfo,
      };

      Cookies.set("pendingUserDetails", JSON.stringify(pendingUserDetails), {
        expires: 1 / 24,
        secure: true,
        sameSite: "strict",
      });

      const notificationData = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email,
        user_type: "driver",
      };
      await sendAdminNotification(notificationData, "driver");

      setRegistrationComplete(true);
      toast.success(t("registrationSuccess"));
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      setRegistrationError(
        "حدث خطأ غير متوقع أثناء التسجيل، يرجى المحاولة مرة أخرى"
      );
      toast.error("حدث خطأ غير متوقع أثناء التسجيل، يرجى المحاولة مرة أخرى");
      setDebugInfo({
        stage: "unexpected_error",
        error: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <img
            src="/lovable-uploads/264169e0-0b4b-414f-b808-612506987f4a.png"
            alt="SafeDrop Logo"
            className="mx-auto h-20 w-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-safedrop-primary mt-6">
            {t("registrationSuccess")}
          </h2>
          <p className="mt-4 text-gray-600">
            {language === "ar"
              ? "شكراً لتسجيلك في سيف دروب. تم إرسال رسالة تأكيد إلى بريدك الإلكتروني."
              : "Thank you for registering with SafeDrop. A confirmation email has been sent to your email."}
          </p>
          <p className="mt-4 text-gray-600">
            {language === "ar"
              ? "يرجى فتح البريد الإلكتروني والنقر على رابط التأكيد لإكمال عملية التسجيل."
              : "Please open the email and click on the confirmation link to complete the registration process."}
          </p>
          <div className="mt-8">
            <Button
              onClick={() => navigate("/login")}
              className="bg-safedrop-gold hover:bg-safedrop-gold/90 w-full"
            >
              {t("login")}
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
            src="/lovable-uploads/264169e0-0b4b-414f-b808-612506987f4a.png"
          />
          <h2 className="text-3xl font-bold text-safedrop-primary">
            {t("driverRegister")}
          </h2>
        </div>

        {waitTime > 0 && (
          <div className="bg-amber-50 border border-amber-300 rounded-md p-4 mb-4 text-center">
            <h3 className="text-amber-800 font-medium">
              {t("pleaseWaitBeforeRetry")}
            </h3>
            <p className="text-amber-700 mt-1">
              {t("timeRemaining")}: {waitTime} {t("seconds")}
            </p>
          </div>
        )}

        {registrationError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="flex gap-2 items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{registrationError}</p>
            </div>
          </div>
        )}

        {debugInfo && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4 text-xs">
            <h3 className="text-red-800 font-medium">
              Debug Info (Admin Only)
            </h3>
            <p className="text-red-700">Stage: {debugInfo.stage}</p>
            <p className="text-red-700">
              Error: {JSON.stringify(debugInfo.error)}
            </p>
            {debugInfo.data && (
              <pre className="mt-2 overflow-auto max-h-32">
                {JSON.stringify(debugInfo.data, null, 2)}
              </pre>
            )}
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
              name="birthDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("birthDate")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="date"
                        placeholder={t("birthDate")}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("nationalId")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("nationalId")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("licenseNumber")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("licenseNumber")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vehicleInfo.make"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("vehicleMake")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("vehicleMake")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleInfo.model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("vehicleModel")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("vehicleModel")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleInfo.year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("vehicleYear")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t("vehicleYear")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vehicleInfo.plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("plateNumber")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("plateNumber")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ID Image Upload */}
            <FormItem>
              <FormLabel>{t("idImage")}</FormLabel>
              <div className="border rounded-md p-4">
                <input
                  type="file"
                  id="idImage"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "id")}
                  className="hidden"
                />
                <label
                  htmlFor="idImage"
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  {idImagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={idImagePreview}
                        alt="ID Preview"
                        className="h-32 mx-auto object-cover rounded-md"
                      />
                      <p className="text-sm text-center text-gray-500 mt-2">
                        {t("clickToChangeImage")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {t("uploadIdImage")}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </FormItem>

            {/* License Image Upload */}
            <FormItem>
              <FormLabel>{t("licenseImage")}</FormLabel>
              <div className="border rounded-md p-4">
                <input
                  type="file"
                  id="licenseImage"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, "license")}
                  className="hidden"
                />
                <label
                  htmlFor="licenseImage"
                  className="flex flex-col items-center justify-center gap-2 cursor-pointer"
                >
                  {licenseImagePreview ? (
                    <div className="relative w-full">
                      <img
                        src={licenseImagePreview}
                        alt="License Preview"
                        className="h-32 mx-auto object-cover rounded-md"
                      />
                      <p className="text-sm text-center text-gray-500 mt-2">
                        {t("clickToChangeImage")}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {t("uploadLicenseImage")}
                      </span>
                    </>
                  )}
                </label>
              </div>
            </FormItem>

            {/* Terms and Conditions Checkbox */}
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start gap-1 rtl:gap-3  space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => {
                        setAcceptedTerms(checked);
                        field.onChange(checked);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      {language === "ar" ? (
                        <span className="text-sm">
                          أوافق على{" "}
                          <a href="/driver-terms" target="_blank">
                            <button
                              type="button"
                              onClick={openDriverTerms}
                              className="text-safedrop-gold hover:underline inline-flex items-center gap-1"
                            >
                              الشروط والأحكام
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </a>
                        </span>
                      ) : (
                        <span className="text-sm">
                          I agree to the{" "}
                          <button
                            type="button"
                            onClick={openDriverTerms}
                            className="text-safedrop-gold hover:underline inline-flex items-center gap-1"
                          >
                            Terms & Conditions
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </span>
                      )}
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
              disabled={isLoading || waitTime > 0 || !acceptedTerms}
            >
              {isLoading ? t("registering") : t("register")}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          {t("alreadyHaveAccount")}{" "}
          <a href="/login" className="text-safedrop-gold hover:underline">
            {t("login")}
          </a>
        </div>
      </div>
    </div>
  );
};

const DriverRegister = () => {
  return (
    <LanguageProvider>
      <DriverRegisterContent />
    </LanguageProvider>
  );
};

export default DriverRegister;
