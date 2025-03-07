import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Safely access localStorage or sessionStorage
  const safeStorageGet = (key) => {
    try {
      if (typeof window !== "undefined") {
        return localStorage.getItem(key) || sessionStorage.getItem(key);
      }
    } catch (error) {
      console.warn(`Failed to access ${key} from storage:`, error);
    }
    return null;
  };

  // Safely set localStorage or sessionStorage
  const safeStorageSet = (key, value) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(key, value);
        sessionStorage.setItem(key, value); // Fallback to sessionStorage
      }
    } catch (error) {
      console.error(`Failed to set ${key} in storage:`, error);
    }
  };

  // Safely remove from localStorage or sessionStorage
  const safeStorageRemove = (key) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key); // Remove from sessionStorage as well
      }
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error);
    }
  };

  // Fetch user data from the backend
  const fetchUser = async () => {
    const token = safeStorageGet('token');
    console.log("Token being sent:", token); // Debugging log

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://unishop-fullstack-1.onrender.com/users", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",  // Include credentials (cookies) in the request
      });

      console.log("Response status:", response.status); // Debugging log

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user data");
      }

      const data = await response.json();
      console.log("Fetched User:", data.user); // Debugging log
      setUser(data.user);
      setIsAuthenticated(true);
      safeStorageSet('user', JSON.stringify(data.user));
    } catch (error) {
      console.error("Fetch user error:", error);
      safeStorageRemove('token');
      safeStorageRemove('user');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Initialize user and authentication state from storage
  useEffect(() => {
    fetchUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log("Sending login request..."); // Debugging log
  
      const response = await fetch("https://unishop-fullstack-1.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",  // This allows cookies to be sent with requests
      });
  
      console.log("Response status:", response.status); // Debugging log
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login failed:", errorData.message); // Debugging log
        throw new Error(errorData.message || "Login failed");
      }
  
      const data = await response.json();
      console.log("Login successful:", data.user); // Debugging log
      setUser(data.user);
      setIsAuthenticated(true);
      safeStorageSet('user', JSON.stringify(data.user));
      safeStorageSet('token', data.access_token);
      console.log("Token stored after login:", data.access_token); // Debugging log
      return data;
    } catch (error) {
      console.error("Login error:", error); // Debugging log
      throw error;
    }
  };
  // Login with Google function
  const login_with_google = async (email) => {
    try {
      const response = await fetch("https://unishop-fullstack-1.onrender.com/auth/login_with_google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",  // Include credentials (cookies) in the request
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        safeStorageSet('user', JSON.stringify(data.user));
        safeStorageSet('token', data.access_token);
        return data;
      } else {
        throw new Error(data.message || "Login with Google failed");
      }
    } catch (error) {
      console.error("Login with Google error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    safeStorageRemove('user');
    safeStorageRemove('token');
  };

  // Register function
  const register = async (username, email, password) => {
    try {
      const response = await fetch("https://unishop-fullstack-1.onrender.com/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
        credentials: "include",  // Include credentials (cookies) in the request
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        setIsAuthenticated(true);
        safeStorageSet('user', JSON.stringify(data.user));
        safeStorageSet('token', data.access_token);
        return data;
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  // Update user profile
  const updateProfile = async (updatedProfile) => {
    try {
      const token = safeStorageGet('token');
      console.log("Token being sent:", token); // Debugging log

      if (!token) {
        throw new Error("No token found. Please log in again.");
      }

      const response = await fetch(`https://unishop-fullstack-1.onrender.com/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
        credentials: "include",  // Include credentials (cookies) in the request
      });

      const data = await response.json();
      console.log("API Response:", data); // Debugging log

      if (!response.ok) {
        throw new Error(data.error || "Profile update failed");
      }

      return data;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  // Upload profile picture
  const uploadProfilePicture = async (file) => {
    try {
      if (!file) {
        throw new Error("No file selected for upload");
      }

      console.log("Uploading file:", file); // Debugging log

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://unishop-fullstack-1.onrender.com/auth/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${safeStorageGet("token")}`,
        },
        body: formData,
        credentials: "include",  // Include credentials (cookies) in the request
      });

      const data = await response.json();
      console.log("Upload response:", data); // Debugging log

      if (response.ok) {
        const updatedUser = { ...user, profile_image: data.url };
        setUser(updatedUser);
        safeStorageSet("user", JSON.stringify(updatedUser));
        return data;
      } else {
        throw new Error(data.error || "Profile picture upload failed");
      }
    } catch (error) {
      console.error("Profile picture upload error:", error);
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    login_with_google,
    register,
    updateProfile,
    uploadProfilePicture,
    fetchUser,
    safeStorageGet,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};