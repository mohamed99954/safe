import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  LanguageProvider,
  useLanguage,
} from "@/components/ui/language-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckIcon, MailIcon, AlertCircle, Loader2 } from "lucide-react";
import Cookies from "js-cookie";

const EmailVerificationContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Initialize component state
  const initializeState = useCallback(() => {
    // Try to get email from location state first
    if (location.state?.email) {
      setEmail(location.state.email);
      setIsVerifying(false);
      return;
    }

    // Try to get email from cookie
    try {
      const pendingUserDetails = Cookies.get("pendingUserDetails");
      if (pendingUserDetails) {
        const details = JSON.parse(pendingUserDetails);
        if (details.email) {
          setEmail(details.email);
        }
      }
    } catch (e) {
      // Continue without email from cookie
    }

    setIsVerifying(false);
  }, [location.state]);

  // Check verification status
  const checkVerificationStatus = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email_confirmed_at) return;

      // Email is verified
      setVerified(true);
      setEmail(user.email);

      // Get user type from metadata
      const userTypeValue = user.user_metadata?.user_type || null;
      setUserType(userTypeValue);

      // Check for profile and create if missing
      await ensureProfileExists(user.id, user);
    } catch (error) {
      // Continue without verification
    }
  }, []);

  // Ensure profile exists
  const ensureProfileExists = async (userId: string, user: any) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", userId)
        .maybeSingle();

      if (profileData) {
        setUserType(profileData.user_type);

        // Try to update email_verified flag
        try {
          await supabase
            .from("profiles")
            .update({ email_verified: true })
            .eq("id", userId);
        } catch (e) {
          // Ignore errors updating email_verified
        }

        return;
      }

      // Profile doesn't exist, create one
      if (!profileData && (!profileError || profileError.code === "PGRST116")) {
        // Get pending details from cookie
        let pendingUserDetails = null;
        try {
          const cookieData = Cookies.get("pendingUserDetails");
          if (cookieData) pendingUserDetails = JSON.parse(cookieData);
        } catch (e) {
          // Continue without pending details
        }

        const userMetadata = {
          id: userId,
          first_name:
            pendingUserDetails?.first_name ||
            user?.user_metadata?.first_name ||
            "",
          last_name:
            pendingUserDetails?.last_name ||
            user?.user_metadata?.last_name ||
            "",
          phone: pendingUserDetails?.phone || user?.user_metadata?.phone || "",
          user_type:
            pendingUserDetails?.user_type ||
            user?.user_metadata?.user_type ||
            "customer",
        };

        try {
          await supabase.from("profiles").insert(userMetadata);
          setUserType(userMetadata.user_type);
          Cookies.remove("pendingUserDetails");
        } catch (e) {
          // Ignore profile creation errors
        }
      }
    } catch (error) {
      // Ignore profile check errors
    }
  };

  // Initialize state and check verification on mount
  useEffect(() => {
    initializeState();
    checkVerificationStatus();
  }, [initializeState, checkVerificationStatus]);

  // Handle resend verification
  const handleResendVerification = async () => {
    if (!email || isResending) return;

    setIsResending(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      toast.success("تم إرسال رابط التحقق مرة أخرى إلى بريدك الإلكتروني");
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء إعادة إرسال التحقق");
    } finally {
      setIsResending(false);
    }
  };

  // Navigate to login
  const handleGoToLogin = () => navigate("/login");

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="mx-auto flex items-center justify-center">
            <Loader2 className="h-16 w-16 text-safedrop-primary animate-spin" />
          </div>
          <h2 className="text-2xl font-bold">جاري التحقق من حالة التأكيد...</h2>
          <p className="text-gray-600">يرجى الانتظار قليلاً.</p>
        </div>
      </div>
    );
  }

  if (verified && userType === "driver") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            تم تأكيد البريد الإلكتروني بنجاح!
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-yellow-800">طلبك قيد المراجعة</h3>
            <p className="text-yellow-700 mt-2">
              شكراً لتسجيلك كسائق في منصة سيف دروب. طلبك قيد المراجعة الآن من
              قبل فريق الإدارة. سنخبرك عبر البريد الإلكتروني بمجرد الموافقة على
              طلبك.
            </p>
          </div>
          <div className="mt-6">
            <Button
              onClick={handleGoToLogin}
              className="bg-safedrop-gold hover:bg-safedrop-gold/90 w-full"
            >
              الذهاب إلى صفحة تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (verified && userType === "customer") {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-safedrop-primary">
            تم تأكيد البريد الإلكتروني بنجاح!
          </h2>
          <p className="text-gray-600 mt-4">
            شكراً لاستخدامك منصة سيف دروب. يمكنك الآن تسجيل الدخول واستخدام
            خدماتنا.
          </p>
          <div className="mt-6">
            <Button
              onClick={handleGoToLogin}
              className="bg-safedrop-gold hover:bg-safedrop-gold/90 w-full"
            >
              الذهاب إلى صفحة تسجيل الدخول
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white shadow-lg rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <MailIcon className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-safedrop-primary">
          تحقق من بريدك الإلكتروني
        </h2>
        <p className="text-gray-600 mt-4">
          {email
            ? `لقد أرسلنا رسالة تأكيد إلى ${email}. يرجى النقر على الرابط الموجود في الرسالة لتأكيد حسابك.`
            : "لقد أرسلنا رسالة تأكيد إلى بريدك الإلكتروني. يرجى النقر على الرابط الموجود في الرسالة لتأكيد حسابك."}
        </p>

        <div className="space-y-3 mt-6">
          <Button
            onClick={handleResendVerification}
            className="w-full bg-safedrop-primary hover:bg-safedrop-primary/90"
            disabled={isResending || !email}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري إعادة الإرسال...
              </>
            ) : (
              "إعادة إرسال رابط التحقق"
            )}
          </Button>

          <Button
            onClick={handleGoToLogin}
            className="w-full bg-safedrop-gold hover:bg-safedrop-gold/90"
          >
            العودة لصفحة تسجيل الدخول
          </Button>
        </div>
      </div>
    </div>
  );
};

const EmailVerification = () => {
  return (
    <LanguageProvider>
      <EmailVerificationContent />
    </LanguageProvider>
  );
};

export default EmailVerification;
