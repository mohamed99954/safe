
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";

interface OrderReceiptConfirmationProps {
  orderId: string;
  isEnabled: boolean;
  onConfirm: () => void;
}

const OrderReceiptConfirmation: React.FC<OrderReceiptConfirmationProps> = ({
  orderId,
  isEnabled,
  onConfirm
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmReceipt = async () => {
    setIsLoading(true);
    try {
      // Update order status to completed
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'completed',
          payment_status: 'paid',
          actual_delivery_time: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Get order details to calculate driver payment
      const { data: order, error: getOrderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (getOrderError) throw getOrderError;

      // Calculate driver payout (90% of the price by default, or use commission_rate if set)
      const commissionRate = order.commission_rate || 0.1; // Default 10%
      const driverPayout = order.price * (1 - commissionRate);

      // Update driver payout
      const { error: updatePayoutError } = await supabase
        .from('orders')
        .update({ 
          driver_payout: driverPayout
        })
        .eq('id', orderId);

      if (updatePayoutError) throw updatePayoutError;

      // Create financial transactions
      if (order.driver_id) {
        // Driver payout transaction
        const { error: driverTransactionError } = await supabase
          .from('financial_transactions')
          .insert({
            driver_id: order.driver_id,
            order_id: orderId,
            amount: driverPayout,
            transaction_type: 'driver_payout',
            status: 'completed'
          });

        if (driverTransactionError) throw driverTransactionError;

        // Platform commission transaction
        const platformFee = order.price * commissionRate;
        const { error: platformTransactionError } = await supabase
          .from('financial_transactions')
          .insert({
            order_id: orderId,
            amount: platformFee,
            transaction_type: 'platform_fee',
            status: 'completed'
          });

        if (platformTransactionError) throw platformTransactionError;
      }

      toast.success('تم تأكيد استلام الطلب بنجاح');
      onConfirm();
    } catch (error) {
      console.error('Error confirming receipt:', error);
      toast.error('حدث خطأ أثناء تأكيد الاستلام');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="default"
      className="w-full bg-green-600 hover:bg-green-700"
      disabled={!isEnabled || isLoading}
      onClick={handleConfirmReceipt}
    >
      <CheckIcon className="h-4 w-4 ml-1" />
      تأكيد استلام الشحنة
    </Button>
  );
};

export default OrderReceiptConfirmation;
