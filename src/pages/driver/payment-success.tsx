import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const DriverPaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState("checking");
  const [verifying, setVerifying] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const verifyPayment = useCallback(async () => {
    if (!user?.id) return;

    setVerifying(true);
    try {
      const orderNumber = searchParams.get("orderNumber");
      const transactionNo = searchParams.get("transactionNo");

      if (!orderNumber) {
        setStatus("error");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "verify-driver-payment",
        {
          body: {
            orderNumber: orderNumber,
            transactionNo: transactionNo, // Include transaction number for better verification
            driverId: user.id,
          },
        }
      );

      if (error) throw error;

      if (data.subscriptionActive) {
        setStatus("success");
        setSubscription(data.subscription);
      } else {
        setStatus("pending");
      }
    } catch (err) {
      console.error("Payment verification error:", err);
      setStatus("error");
    } finally {
      setVerifying(false);
    }
  }, [user?.id, searchParams]);

  useEffect(() => {
    if (user?.id) {
      verifyPayment();
    }
  }, [user?.id, verifyPayment]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        {status === "checking" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              جاري التحقق من الدفع...
            </h2>
            <p className="text-gray-600">يرجى الانتظار لحظة</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">
              تم تفعيل الاشتراك بنجاح!
            </h2>
            {subscription && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-4">
                <p className="text-sm text-green-700">
                  <strong>الخطة:</strong>{" "}
                  {subscription.plan === "monthly" ? "شهري" : "سنوي"}
                  <br />
                  <strong>المبلغ:</strong> {subscription.amount} ريال
                  <br />
                  <strong>ينتهي في:</strong>{" "}
                  {new Date(subscription.expiresAt).toLocaleDateString("ar-SA")}
                </p>
              </div>
            )}
            <p className="text-gray-600 mb-6">
              يمكنك الآن تفعيل حالة التوفر وقبول الطلبات
            </p>
            <Button
              onClick={() => navigate("/driver/orders")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              العودة إلى الطلبات
            </Button>
          </>
        )}

        {status === "pending" && (
          <>
            <div className="text-yellow-600 text-6xl mb-4">⏳</div>
            <h2 className="text-xl font-semibold text-yellow-600 mb-2">
              الدفع قيد المعالجة
            </h2>
            <p className="text-gray-600 mb-6">
              يرجى الانتظار لحين اكتمال عملية الدفع أو المحاولة مرة أخرى
            </p>
            <div className="space-y-2">
              <Button
                onClick={verifyPayment}
                disabled={verifying}
                className="w-full"
              >
                {verifying ? "جاري التحقق..." : "التحقق من الدفع مرة أخرى"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/driver/orders")}
                className="w-full"
              >
                العودة إلى الطلبات
              </Button>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-600 text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              خطأ في التحقق من الدفع
            </h2>
            <p className="text-gray-600 mb-6">
              يرجى المحاولة مرة أخرى أو التواصل مع الدعم
            </p>
            <div className="space-y-2">
              <Button
                onClick={verifyPayment}
                disabled={verifying}
                className="w-full"
              >
                {verifying ? "جاري التحقق..." : "إعادة المحاولة"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/driver/orders")}
                className="w-full"
              >
                العودة إلى الطلبات
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DriverPaymentSuccess;
