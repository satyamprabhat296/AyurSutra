import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get currently logged-in user
  const getCurrentUser = async () => {
    try {
      const response = await api.get("/auth/me");

      if (response.data?.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Get Current User Error:", error);

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check authentication when application loads
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data?.success) {
        setUser(response.data.user);
      }

      return response.data;
    } catch (error) {
      console.error("Login Error:", error);

      // Backend returned an error
      if (error.response) {
        throw new Error(
          error.response.data?.message || "Login failed"
        );
      }

      // Request was sent but no response received
      if (error.request) {
        throw new Error(
          "Unable to connect to the server. Please check your internet connection or try again."
        );
      }

      // Something else happened
      throw new Error(
        error.message || "Something went wrong during login"
      );
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        getCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};

