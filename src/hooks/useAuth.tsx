import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const COOKIE_OPTIONS = {
  secure: window.location.protocol === "https:",
  sameSite: "Strict",
  expires: 30,
} as const;

export function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  const clearAuthData = useCallback((preserveVerificationData = false) => {
    const authCookieKeys = Object.keys(Cookies.get()).filter(
      (key) =>
        key.includes("Auth") ||
        key.includes("Email") ||
        (key === "pendingUserDetails" && !preserveVerificationData)
    );

    authCookieKeys.forEach((cookieName) => {
      Cookies.remove(cookieName, { path: "/" });
    });

    if (!preserveVerificationData) {
      for (const key of Object.keys(localStorage)) {
        if (
          key.startsWith("driverFiles_") ||
          key === "pendingDriverRegistration" ||
          key === "pendingDriverData"
        ) {
          localStorage.removeItem(key);
        }
      }
    }

    if (window.localStorage) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith("sb-"))
        .forEach((key) => localStorage.removeItem(key));
    }

    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
  }, []);

  const setAuthCookieByType = useCallback((type, email) => {
    const existingAuthCookies = Object.keys(Cookies.get()).filter(
      (key) => key.includes("Auth") && key !== `${type}Auth`
    );

    existingAuthCookies.forEach((key) => {
      Cookies.remove(key, { path: "/" });
    });

    Cookies.set(`${type}Auth`, "true", COOKIE_OPTIONS);
    if (email && type === "admin") {
      Cookies.set("adminEmail", email, COOKIE_OPTIONS);
    }
  }, []);

  const handleUserType = useCallback(
    async (userData) => {
      if (!userData) return null;

      if (userData.user_metadata?.user_type) {
        const type = userData.user_metadata.user_type;
        setUserType(type);
        setAuthCookieByType(type, userData.email);
        return type;
      }

      try {
        const { data } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", userData.id)
          .maybeSingle();

        if (data?.user_type) {
          setUserType(data.user_type);
          setAuthCookieByType(data.user_type, userData.email);
          return data.user_type;
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
      }

      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userData.id)
          .eq("role", "admin")
          .maybeSingle();

        if (data) {
          setUserType("admin");
          setAuthCookieByType("admin", userData.email);
          return "admin";
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
      }

      setUserType("customer");
      return "customer";
    },
    [setAuthCookieByType]
  );

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
        setUserType(null);

        const isVerificationFlow =
          window.location.pathname.includes("/auth/callback");
        if (!isVerificationFlow) {
          clearAuthData();
        }

        setLoading(false);
        return;
      }

      if (
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "INITIAL_SESSION"
      ) {
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          await handleUserType(newSession.user);
        } else {
          setUserType(null);
        }

        setLoading(false);

        if (!isInitialized) {
          setIsInitialized(true);
        }
        return;
      }

      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        await handleUserType(newSession.user);
      } else {
        setUserType(null);
      }

      setLoading(false);
    });

    const getInitialSession = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user) {
          await handleUserType(initialSession.user);
        } else {
          setUserType(null);
        }
      } catch (error) {
        console.error("Error fetching initial session:", error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setUserType(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setIsInitialized(true); // ← MAKE SURE THIS LINE EXISTS
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleUserType, clearAuthData, isInitialized]);

  const signOut = useCallback(async () => {
    try {
      const allCookies = Object.keys(Cookies.get());
      allCookies.forEach((cookieName) => {
        Cookies.remove(cookieName, { path: "/" });
        Cookies.remove(cookieName);
      });
      localStorage.clear();
      sessionStorage.clear();

      const { error } = await supabase.auth.signOut({
        scope: "global",
      });

      if (error) {
        console.warn("Error during Supabase sign out:", error);
      }

      clearAuthData();

      const remainingCookies = Object.keys(Cookies.get());
      remainingCookies.forEach((cookieName) => {
        Cookies.remove(cookieName, { path: "/" });
        Cookies.remove(cookieName);
      });
      localStorage.clear();
      sessionStorage.clear();

      setUser(null);
      setSession(null);
      setUserType(null);

      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 100);

      return { success: true, warning: error?.message };
    } catch (error) {
      console.error("Error signing out:", error);
      clearAuthData();

      const allCookies = Object.keys(Cookies.get());
      allCookies.forEach((cookieName) => {
        Cookies.remove(cookieName, { path: "/" });
        Cookies.remove(cookieName);
      });
      localStorage.clear();
      sessionStorage.clear();

      setUser(null);
      setSession(null);
      setUserType(null);

      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 100);

      return { success: false, error };
    }
  }, [clearAuthData]);

  const checkDriverStatus = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase.rpc("get_driver_status_v3", {
        in_driver_id: userId,
      });

      if (error) throw error;

      if (!data || !data.success) {
        return {
          success: false,
          error: data?.error || "Failed to get driver status",
        };
      }

      return {
        success: true,
        status: data.status,
        rejection_reason: data.rejection_reason,
      };
    } catch (err) {
      console.error("Error checking driver status:", err);
      return { success: false, error: err.message };
    }
  }, []);

  const checkUserProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error("Error checking profile:", err);
      return null;
    }
  }, []);

  const isAuthenticated = !!(session || user);

  return {
    user,
    session,
    loading,
    signOut,
    clearAuthData,
    checkUserProfile,
    checkDriverStatus,
    userType,
    isAuthenticated,
    isInitialized,
    setAuthCookieByType,
    handleUserType,
  };
}
