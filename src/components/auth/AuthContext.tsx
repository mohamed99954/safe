import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isLoggedIn: boolean;
  userType: string | null;
  signOut: () => Promise<void>;
  checkUserProfile: (userId: string) => Promise<any>;
  checkDriverStatus: (userId: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem("adminAuth") === "true";
      if (isAdminLoggedIn) {
        setUserType("admin");
      }
      return isAdminLoggedIn;
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      const isAdminLoggedIn = checkAdminAuth();
      if (isAdminLoggedIn) {
        setLoading(false);
        return;
      }

      if (newSession?.user) {
        setTimeout(async () => {
          try {
            const { data } = await supabase
              .from("profiles")
              .select("user_type")
              .eq("id", newSession.user.id)
              .single();

            if (data?.user_type === "customer") {
              localStorage.setItem("customerAuth", "true");
            } else if (data?.user_type === "driver") {
              localStorage.setItem("driverAuth", "true");
            }

            setUserType(data?.user_type || null);
          } catch (error) {
            console.error("Error fetching user type:", error);
          } finally {
            setLoading(false);
          }
        }, 0);
      } else {
        setUserType(null);
        setLoading(false);
      }
    });

    const initializeAuth = async () => {
      try {
        const isAdminLoggedIn = checkAdminAuth();
        if (isAdminLoggedIn) {
          setLoading(false);
          return;
        }

        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          const { data } = await supabase
            .from("profiles")
            .select("user_type")
            .eq("id", currentSession.user.id)
            .single();

          if (data?.user_type === "customer") {
            localStorage.setItem("customerAuth", "true");
          } else if (data?.user_type === "driver") {
            localStorage.setItem("driverAuth", "true");
          }

          setUserType(data?.user_type || null);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
    }

    setUser(null);
    setSession(null);
    setUserType(null);
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("customerAuth");
    localStorage.removeItem("driverAuth");
  };

  // Check user profile without throwing errors
  const checkUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking user profile:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Exception when checking profile:", err);
      return null;
    }
  };

  // Check driver status to handle driver-specific flows
  const checkDriverStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("status, rejection_reason")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error checking driver status:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Exception when checking driver status:", err);
      return null;
    }
  };

  // Check for admin auth in localStorage on each render
  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem("adminAuth") === "true";
    if (isAdminLoggedIn && userType !== "admin") {
      setUserType("admin");
    }
  }, [userType]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isLoggedIn: !!session || userType === "admin",
        userType,
        signOut,
        checkUserProfile,
        checkDriverStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
