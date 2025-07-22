import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ComplaintType {
  id: string;
  complaint_number: number;
  user_id: string;
  issue_type: string;
  description: string;
  order_number?: string;
  status: "pending" | "resolved";
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    user_type?: string;
  };
}

export interface ComplaintFormData {
  issue_type: string;
  description: string;
  order_number?: string;
  attachment_url?: string;
}

// Main hook for fetching all complaints (for admin)
export const useComplaints = () => {
  return useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          profiles (
            id,
            first_name,
            last_name,
            email,
            user_type
          )
        `
        )
        .order("complaint_number", { ascending: false });

      if (error) {
        console.error("Error fetching complaints:", error);
        throw error;
      }

      return (data || []) as ComplaintType[];
    },
    staleTime: 0, // Always refetch when component mounts
    cacheTime: 0, // Don't cache the data
  });
};

// Hook for creating new complaints
export const useCreateComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      complaintData: ComplaintFormData & { user_id: string }
    ) => {
      // Get the next complaint number
      const { data: lastComplaint } = await supabase
        .from("complaints")
        .select("complaint_number")
        .order("complaint_number", { ascending: false })
        .limit(1)
        .single();

      const nextComplaintNumber = lastComplaint?.complaint_number
        ? lastComplaint.complaint_number + 1
        : 1;

      const { data, error } = await supabase
        .from("complaints")
        .insert({
          complaint_number: nextComplaintNumber,
          user_id: complaintData.user_id,
          issue_type: complaintData.issue_type,
          description: complaintData.description,
          order_number: complaintData.order_number || null,
          attachment_url: complaintData.attachment_url || null,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating complaint:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["user-complaints"] });
      toast.success("تم إرسال الشكوى بنجاح");
    },
    onError: (error) => {
      console.error("Error creating complaint:", error);
      toast.error("حدث خطأ في إرسال الشكوى");
    },
  });
};

// Hook for updating complaint status - FIXED VERSION
export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      complaintId,
      status,
      adminResponse,
    }: {
      complaintId: string;
      status: "resolved" | "pending";
      adminResponse?: string;
    }) => {
      // Update complaint status using ID instead of complaint_number
      const { error: updateError } = await supabase
        .from("complaints")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaintId); // Use ID instead of complaint_number

      if (updateError) throw updateError;

      // Add admin response if provided
      if (adminResponse?.trim()) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { error: responseError } = await supabase
          .from("complaint_responses")
          .insert({
            complaint_id: complaintId, // Use complaint_id instead of complaint_number
            admin_id: user?.id,
            response: adminResponse.trim(),
            created_at: new Date().toISOString(),
          });

        if (responseError) throw responseError;
      }

      return { complaintId, status, adminResponse };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["user-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["complaint-responses"] });
      toast.success("تم تحديث حالة الشكوى بنجاح");
    },
    onError: (error) => {
      console.error("Error updating complaint:", error);
      toast.error("حدث خطأ في تحديث الشكوى");
    },
  });
};

// Hook for fetching user-specific complaints
export const useUserComplaints = (userId: string) => {
  return useQuery({
    queryKey: ["user-complaints", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select(
          `
          *,
          profiles (
            id,
            first_name,
            last_name,
            email
          )
        `
        )
        .eq("user_id", userId)
        .order("complaint_number", { ascending: false });

      if (error) {
        console.error("Error fetching user complaints:", error);
        throw error;
      }

      return (data || []) as ComplaintType[];
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
  });
};

// Hook for fetching complaint responses
export const useComplaintResponses = (complaintId: string) => {
  return useQuery({
    queryKey: ["complaint-responses", complaintId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaint_responses")
        .select(
          `
          *,
          profiles (
            first_name,
            last_name,
            email
          )
        `
        )
        .eq("complaint_id", complaintId) // Using complaint_id
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching complaint responses:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!complaintId,
  });
};

// Hook for bulk operations (for admin)
export const useBulkUpdateComplaints = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      complaintIds,
      status,
    }: {
      complaintIds: string[];
      status: "resolved" | "pending";
    }) => {
      const { error } = await supabase
        .from("complaints")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .in("id", complaintIds);

      if (error) throw error;

      return { complaintIds, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success(`تم تحديث ${data.complaintIds.length} شكوى بنجاح`);
    },
    onError: (error) => {
      console.error("Error bulk updating complaints:", error);
      toast.error("حدث خطأ في تحديث الشكاوى");
    },
  });
};

// Hook for deleting a complaint (admin only)
export const useDeleteComplaint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (complaintId: string) => {
      // First delete any responses
      await supabase
        .from("complaint_responses")
        .delete()
        .eq("complaint_id", complaintId);

      // Then delete the complaint
      const { error } = await supabase
        .from("complaints")
        .delete()
        .eq("id", complaintId);

      if (error) throw error;

      return complaintId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("تم حذف الشكوى بنجاح");
    },
    onError: (error) => {
      console.error("Error deleting complaint:", error);
      toast.error("حدث خطأ في حذف الشكوى");
    },
  });
};
