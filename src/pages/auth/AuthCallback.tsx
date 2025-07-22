import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import Cookies from "js-cookie";

const AuthCallbackContent = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState(null);
  const [success, setSuccess] = useState(false);

  const processDriverFiles = async (userId) => {
    try {
      const fileDataKey = `driverFiles_${userId}`;
      const fileDataStr = localStorage.getItem(fileDataKey);

      if (!fileDataStr) {
        return null;
      }

      const fileData = JSON.parse(fileDataStr);
      const uploadResults = {};

      for (const fileType of ["id_image", "license_image"]) {
        if (fileData[fileType]) {
          const dataURLParts = fileData[fileType].dataUrl.split(",");
          const mime = dataURLParts[0].match(/:(.*?);/)[1];
          const bstr = atob(dataURLParts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);

          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }

          const file = new File([u8arr], fileData[fileType].name, {
            type: mime,
          });

          const fileExt = file.name.split(".").pop();
          const fileName = `${userId}_${fileType}_${Date.now()}.${fileExt}`;
          const filePath = `${
            fileType === "id_image" ? "id-cards" : "licenses"
          }/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("driver-documents")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (!uploadError) {
            const {
              data: { publicUrl },
            } = supabase.storage
              .from("driver-documents")
              .getPublicUrl(filePath);

            uploadResults[fileType] = publicUrl;
          } else {
            console.error(`Error uploading ${fileType}:`, uploadError);
          }
        }
      }

      localStorage.removeItem(fileDataKey);

      return Object.keys(uploadResults).length > 0 ? uploadResults : null;
    } catch (error) {
      console.error("Error processing driver files:", error);
      return null;
    }
  };

  // Create driver record with all related data
  const createDriverRecord = async (userId, driverData, fileUrls) => {
    try {
      const { data: result, error: functionError } = await supabase.rpc(
        "create_driver_with_related_records",
        {
          in_user_id: userId,
          in_national_id: driverData.national_id || "",
          in_license_number: driverData.license_number || "",
          in_vehicle_info: driverData.vehicle_info || {},
          in_id_image: fileUrls?.id_image || null,
          in_license_image: fileUrls?.license_image || null,
        }
      );

      if (functionError) {
        console.error("Error creating driver with function:", functionError);

        const directDriverData = {
          id: userId,
          national_id: driverData.national_id || "",
          license_number: driverData.license_number || "",
          vehicle_info: driverData.vehicle_info || {},
          status: "pending",
          is_available: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...(fileUrls?.id_image && { id_image: fileUrls.id_image }),
          ...(fileUrls?.license_image && {
            license_image: fileUrls.license_image,
          }),
        };

        const { error: driverError } = await supabase
          .from("drivers")
          .insert(directDriverData);

        if (!driverError) {
          // Insert role
          await supabase
            .from("user_roles")
            .insert({
              user_id: userId,
              role: "driver",
              created_at: new Date().toISOString(),
            })
            .catch((e) => console.warn("Role creation warning:", e));

          // Create earnings record
          await supabase
            .from("driver_earnings")
            .insert({
              driver_id: userId,
              amount: 0,
              status: "initial",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .catch((e) => console.warn("Earnings creation warning:", e));

          // Create welcome notification
          await supabase
            .from("driver_notifications")
            .insert({
              driver_id: userId,
              title: t("accountUnderReview") || "Account Under Review",
              message:
                t("thankYouForRegistering") || "Thank you for registering",
              notification_type: "welcome",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .catch((e) => console.warn("Notification creation warning:", e));
        }
      }

      return true;
    } catch (error) {
      console.error("Error in createDriverRecord:", error);
      return false;
    }
  };

  const verifyEmail = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));

      const tokenInQuery = queryParams.get("token");
      const typeInQuery = queryParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      let verificationResult = null;

      if (tokenInQuery && typeInQuery) {
        verificationResult = await supabase.auth.verifyOtp({
          token_hash: tokenInQuery,
          type: typeInQuery === "signup" ? "signup" : "recovery",
        });

        if (verificationResult.error) {
          console.error("OTP verification failed:", verificationResult.error);
          throw new Error(t("invalidToken") || "Invalid verification token");
        }
      } else if (accessToken && refreshToken) {
        verificationResult = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (verificationResult.error) {
          console.error("Session setup failed:", verificationResult.error);
          throw new Error(t("sessionExpired") || "Session expired");
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        throw new Error(t("sessionExpired") || "Session expired");
      }

      if (!session) {
        let pendingEmail = queryParams.get("email") || hashParams.get("email");

        if (!pendingEmail) {
          try {
            const pendingUserDetails = Cookies.get("pendingUserDetails");
            if (pendingUserDetails) {
              const details = JSON.parse(pendingUserDetails);
              pendingEmail = details.email;
            }
          } catch (e) {
            console.warn("Error parsing pendingUserDetails cookie:", e);
          }
        }

        if (pendingEmail && (tokenInQuery || accessToken)) {
          Cookies.remove("pendingUserDetails", { path: "/" });

          setSuccess(true);
          toast.success(
            t("emailVerifiedSuccess") || "Email verified successfully!"
          );

          setTimeout(() => {
            navigate("/login", {
              replace: true,
              state: {
                message: t("emailVerified") || "Email verified successfully!",
                type: "success",
                verifiedEmail: pendingEmail,
              },
            });
          }, 2000);
          return;
        }

        throw new Error(t("invalidToken") || "Invalid verification token");
      }

      // We have a valid session, get user details
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(t("userNotFound") || "User not found");
      }

      // Get pending user details from cookies
      let pendingUserDetails = null;
      try {
        const cookieData = Cookies.get("pendingUserDetails");
        if (cookieData) {
          pendingUserDetails = JSON.parse(cookieData);
        }
      } catch (e) {
        console.warn("Error parsing pendingUserDetails cookie:", e);
      }

      let userTypeValue = user.user_metadata?.user_type || "customer";

      // Check if profile exists
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      // Create or update profile
      if (!profileData) {
        const userMetadata = {
          id: user.id,
          first_name:
            pendingUserDetails?.first_name ||
            user.user_metadata?.first_name ||
            "",
          last_name:
            pendingUserDetails?.last_name ||
            user.user_metadata?.last_name ||
            "",
          phone: pendingUserDetails?.phone || user.user_metadata?.phone || "",
          email: user.email,
          user_type:
            pendingUserDetails?.user_type ||
            user.user_metadata?.user_type ||
            "customer",
          birth_date:
            pendingUserDetails?.birth_date ||
            user.user_metadata?.birth_date ||
            null,
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert(userMetadata);

          if (profileError) {
            console.error("Profile creation error:", profileError);
          } else {
            userTypeValue = userMetadata.user_type;

            if (userTypeValue === "driver" && pendingUserDetails) {
              const fileUrls = await processDriverFiles(user.id);
              const driverData = {
                national_id: pendingUserDetails.national_id || "",
                license_number: pendingUserDetails.license_number || "",
                vehicle_info: pendingUserDetails.vehicle_info || {},
              };
              await createDriverRecord(user.id, driverData, fileUrls);
            }
          }
        } catch (e) {
          console.error("Profile creation failed:", e);
        }
      } else {
        userTypeValue = profileData.user_type;

        try {
          await supabase
            .from("profiles")
            .update({
              email_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id);
        } catch (e) {
          console.warn("Email verified update failed:", e);
        }
      }

      // Clean up cookies
      Cookies.remove("pendingUserDetails", { path: "/" });

      // Call RPC function if available
      try {
        await supabase.rpc("verify_user_email", { user_id: user.id });
      } catch (e) {
        console.warn("RPC verify_user_email failed:", e);
      }

      setUserType(userTypeValue);
      setSuccess(true);
      toast.success(
        t("emailVerifiedSuccess") || "Email verified successfully!"
      );

      // Important: Give the auth hook time to process the state change
      setTimeout(async () => {
        // Sign out and redirect to login
        await supabase.auth.signOut();

        // Small delay to ensure sign out is processed
        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: {
              message: t("emailVerified") || "Email verified successfully!",
              type: "success",
              verified: true,
            },
          });
        }, 500);
      }, 1500);
    } catch (err) {
      console.error("Verification error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : t("errorProcessingRequest") || "Error processing request";
      setError(errorMessage);
      toast.error(t("emailVerificationFailed") || "Email verification failed");

      // Ensure we sign out on error
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("Error during sign out:", e);
      }
    } finally {
      setIsVerifying(false);
    }
  }, [navigate, t]);

  useEffect(() => {
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(verifyEmail, 100);
    return () => clearTimeout(timer);
  }, [verifyEmail]);

  if (isVerifying) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <Loader2 className="h-16 w-16 text-safedrop-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            {t("verifyingEmail") || "Verifying Email"}
          </h2>
          <p className="text-gray-600">
            {t("pleaseWaitVerifyingEmail") ||
              "Please wait while we verify your email..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            {t("emailVerificationFailed") || "Email Verification Failed"}
          </h2>
          <p className="text-gray-600">{error}</p>
          <div className="mt-6">
            <Button
              onClick={() => {
                Cookies.remove("pendingUserDetails", { path: "/" });
                navigate("/login");
              }}
              className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
            >
              {t("goToLoginPage") || "Go to Login Page"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center bg-gray-50 ${
          language === "ar" ? "rtl" : "ltr"
        }`}
      >
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            {t("emailVerified") || "Email Verified"}
          </h2>
          <p className="text-gray-600">
            {t("emailVerifiedSuccess") ||
              "Your email has been verified successfully!"}
          </p>
          <p className="text-sm text-gray-500">
            {t("redirectingToLogin") || "Redirecting to login page..."}
          </p>
        </div>
      </div>
    );
  }

  return null;
};

const AuthCallback = () => (
  <LanguageProvider>
    <AuthCallbackContent />
  </LanguageProvider>
);

export default AuthCallback;
