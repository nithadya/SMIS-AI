import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase, refreshSupabaseAuth } from "../lib/supabase";

// Create context with default values
const AuthContext = createContext({
  user: null,
  login: async () => ({ success: false, error: "Not implemented" }),
  logout: async () => {},
});

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  // Initialize state with a function to avoid unnecessary computation
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  // Handle session management
  useEffect(() => {
    const setupSession = async () => {
      try {
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          await refreshSupabaseAuth();
        } else {
          localStorage.removeItem("user");
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error("Session setup error:", error);
      }
    };

    setupSession();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (session?.user && !user) {
        // Fetch user data if we have a session but no user in state
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (userData) {
          setUser(userData);
        }
      }
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, [user]);

  // Login function
  const login = async (email, password) => {
    try {
      // Input validation
      if (!email || !password) {
        return { success: false, error: "Email and password are required" };
      }

      // Check email and password
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (error || !userData) {
        console.error("Login error:", error?.message || "Invalid credentials");
        return { success: false, error: "Invalid email or password" };
      }

      // Set user data
      setUser(userData);

      // Refresh Supabase auth
      await refreshSupabaseAuth();

      return {
        success: true,
        redirectTo: "/",
        user: userData,
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("user");
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: "Failed to logout" };
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = React.useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
