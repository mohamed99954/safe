import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/components/ui/language-context";

export function useProfile() {
  const { user } = useAuth();
  const { language } = useLanguage();

  return useQuery({
    queryKey: ["profile", user?.id, language],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Try to get existing profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      // If profile exists, return it
      if (data) return data;

      // If error is not "not found", throw it
      if (error && error.code !== "PGRST116") throw error;

      // Profile doesn't exist - create from user metadata
      if (user.user_metadata?.user_type) {
        const newProfile = {
          id: user.id,
          first_name: user.user_metadata.first_name || "",
          last_name: user.user_metadata.last_name || "",
          phone: user.user_metadata.phone || "",
          user_type: user.user_metadata.user_type,
          email: user.email,
        };

        // Create profile
        const { data: createdProfile, error: createError } = await supabase
          .from("profiles")
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        return createdProfile;
      }

      // No metadata to create profile from
      throw new Error("Profile not found and insufficient data to create one");
    },
    enabled: !!user,
    staleTime: 300000, // Profile data stays fresh for 5 minutes
    cacheTime: 600000, // Keep in cache for 10 minutes
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}
